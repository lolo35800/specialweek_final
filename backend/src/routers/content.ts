import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

const router = Router()

router.get('/lessons', (_req, res) => {
  const data = JSON.parse(readFileSync(join(DATA_DIR, 'lessons.json'), 'utf-8'))
  res.json(data)
})

router.get('/lessons/:id', (req, res) => {
  const data = JSON.parse(readFileSync(join(DATA_DIR, 'lessons.json'), 'utf-8'))
  const lesson = data.lessons.find((l: { id: string }) => l.id === req.params.id)
  if (!lesson) return res.status(404).json({ detail: 'Lesson not found' })
  res.json(lesson)
})

router.get('/gallery', (_req, res) => {
  const data = JSON.parse(readFileSync(join(DATA_DIR, 'gallery.json'), 'utf-8'))
  res.json(data)
})

export default router
