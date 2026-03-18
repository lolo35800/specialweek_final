import { Router } from 'express'

const router = Router()

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const MAX_HISTORY = 10

const SYSTEM_PROMPT =
  'Tu es l\'assistant pédagogique de VériIA, une plateforme de sensibilisation ' +
  'à la désinformation et à l\'IA générative destinée aux lycéens et étudiants. ' +
  'Réponds TOUJOURS en français, de façon pédagogue, bienveillante et concise ' +
  '(200 mots maximum). Utilise des exemples concrets adaptés aux jeunes. ' +
  'Si la question est hors sujet (pas liée à la désinformation, aux médias, ' +
  'à l\'esprit critique ou à l\'IA), redirige poliment vers ces thématiques.'

interface ChatMessage {
  role: string
  content: string
}

router.post('/chat', async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY ?? ''
  if (!apiKey) {
    return res.status(500).json({ detail: 'Clé API Groq non configurée' })
  }

  const { message, history = [] } = req.body as { message: string; history: ChatMessage[] }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-MAX_HISTORY),
    { role: 'user', content: message },
  ]

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const resp = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: 512,
        temperature: 0.7,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!resp.ok) {
      const text = await resp.text()
      return res.status(resp.status).json({ detail: `Erreur Groq : ${text}` })
    }

    const data = await resp.json()
    const reply = data.choices[0].message.content

    res.json({ reply, model: GROQ_MODEL })
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return res.status(504).json({ detail: "L'API Groq n'a pas répondu à temps" })
    }
    return res.status(502).json({ detail: `Erreur de connexion à Groq : ${err}` })
  }
})

export default router
