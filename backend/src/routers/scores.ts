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

const router = Router()

router.post('/', (req, res) => {
  const { username, score, total, module } = req.body
  const entry: Score = {
    id: uuidv4(),
    username,
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
  const limit = parseInt(req.query.limit as string, 10) || 10
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
