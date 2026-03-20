import { Router } from 'express'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCORES_PATH = join(__dirname, '..', 'data', 'scores.json')

interface Score {
  id: string
  username: string
  score: number
  total: number
  module: string
  timestamp: string
}

function readScores(): Score[] {
  try {
    const data = JSON.parse(readFileSync(SCORES_PATH, 'utf-8'))
    return data.scores ?? []
  } catch {
    return []
  }
}

function writeScores(scores: Score[]) {
  writeFileSync(SCORES_PATH, JSON.stringify({ scores }, null, 2), 'utf-8')
}

const VALID_MODULES = ['quiz', 'fake_or_real', 'incoherences', 'spot_zone'] as const
type ValidModule = typeof VALID_MODULES[number]

const router = Router()

router.post('/', (req, res) => {
  const { username, score, total, module } = req.body

  if (typeof username !== 'string' || username.trim().length === 0 || username.length > 50) {
    return res.status(400).json({ error: 'Paramètre username invalide' })
  }
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: 'Paramètre score invalide' })
  }
  if (typeof total !== 'number' || !Number.isInteger(total) || total <= 0 || total > 1000) {
    return res.status(400).json({ error: 'Paramètre total invalide' })
  }
  if (score > total) {
    return res.status(400).json({ error: 'Le score ne peut pas dépasser le total' })
  }
  if (!VALID_MODULES.includes(module as ValidModule)) {
    return res.status(400).json({ error: 'Module invalide' })
  }

  const entry: Score = {
    id: uuidv4(),
    username: username.trim(),
    score,
    total,
    module,
    timestamp: new Date().toISOString(),
  }
  const scores = readScores()
  scores.push(entry)
  writeScores(scores)
  res.status(201).json(entry)
})

router.get('/', (req, res) => {
  const rawLimit = parseInt(req.query.limit as string, 10)
  const limit = Number.isNaN(rawLimit) ? 10 : Math.min(Math.max(rawLimit, 1), 100)
  const mod = req.query.module as string | undefined
  let scores = readScores()
  if (mod) scores = scores.filter((s) => s.module === mod)
  scores.sort((a, b) => b.score - a.score)
  res.json({ scores: scores.slice(0, limit) })
})

router.get('/:username', (req, res) => {
  const name = req.params.username.toLowerCase()
  const scores = readScores()
    .filter((s) => s.username.toLowerCase() === name)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  res.json({ scores })
})

export default router
