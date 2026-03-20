import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import contentRouter from './routers/content.js'
import quizRouter from './routers/quiz.js'
import scoresRouter from './routers/scores.js'
import aiMockRouter from './routers/aiMock.js'
import aiChatRouter from './routers/aiChat.js'
import rulesRouter from './routers/rules.js'
import actusRouter from './routers/actus.js'

const app = express()
const PORT = 8000

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true)
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
}))
app.use(express.json({ limit: '1mb' }))

app.use('/content', contentRouter)
app.use('/quiz', quizRouter)
app.use('/scores', scoresRouter)
app.use('/ai', aiMockRouter)
app.use('/ai', aiChatRouter)
app.use(rulesRouter)
app.use(actusRouter)

app.get('/', (_req, res) => {
  res.json({ status: 'ok', app: 'Verif-IA API', version: '1.0.0' })
})

app.listen(PORT, () => {
  console.log(`Verif-IA API → http://localhost:${PORT}`)
})
