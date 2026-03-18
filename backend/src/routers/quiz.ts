import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

const router = Router()

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

router.get('/questions', (req, res) => {
  const data = JSON.parse(readFileSync(join(DATA_DIR, 'questions.json'), 'utf-8'))
  let questions = data.questions
  if (req.query.shuffle === 'true') {
    questions = shuffle(questions)
  }
  res.json({ questions })
})

router.get('/questions/:id', (req, res) => {
  const data = JSON.parse(readFileSync(join(DATA_DIR, 'questions.json'), 'utf-8'))
  const id = parseInt(req.params.id, 10)
  const question = data.questions.find((q: { id: number }) => q.id === id)
  if (!question) return res.status(404).json({ detail: 'Question not found' })
  res.json(question)
})

export default router
