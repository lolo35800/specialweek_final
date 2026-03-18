import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

const router = Router()

router.get('/rules', (_req, res) => {
  const data = JSON.parse(readFileSync(join(DATA_DIR, 'rules.json'), 'utf-8'))
  res.json(data)
})

export default router
