import { Router } from 'express'

const router = Router()

const TEXT_SUSPICIOUS_KEYWORDS = [
  'choquant', 'scandale', 'incroyable', 'révélation', 'exclusif',
  'breaking', 'urgent', 'secret', 'censuré', 'interdit',
]

const TEXT_REASONS = [
  'Le titre utilise un vocabulaire très émotionnel pour provoquer une réaction immédiate',
  'Le texte manque de sources vérifiables ou de références précises',
  "Le style d'écriture ressemble à du contenu généré automatiquement",
  'Les affirmations sont formulées de façon absolue sans nuance',
  "Absence d'auteur identifiable ou de date précise",
]

const IMAGE_REASONS = [
  'Les proportions anatomiques semblent incorrectes',
  'Le fond présente des répétitions caractéristiques des IA génératives',
  "L'éclairage et les ombres sont incohérents avec la scène",
  'Les textures sont trop lisses ou présentent des artefacts visuels',
  'Les extrémités (mains, pieds) présentent des anomalies',
]

const TIPS = [
  'Vérifie la source originale avant de partager',
  "Effectue une recherche inversée de l'image sur Google Images",
  'Consulte un fact-checker comme Les Décodeurs ou AFP Factuel',
  'Méfie-toi des contenus qui provoquent des émotions très fortes',
  "Vérifie si d'autres médias fiables relaient l'information",
]

function sample<T>(arr: T[], k: number): T[] {
  const copy = [...arr]
  const result: T[] = []
  for (let i = 0; i < k && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length)
    result.push(copy.splice(idx, 1)[0])
  }
  return result
}

router.post('/analyze', (req, res) => {
  const { type, content } = req.body as { type: 'text' | 'image_url'; content: string }
  const lower = content.toLowerCase()

  let is_likely_fake: boolean
  let confidence: number
  let reasons: string[]

  if (type === 'text') {
    const hits = TEXT_SUSPICIOUS_KEYWORDS.filter((kw) => lower.includes(kw)).length
    is_likely_fake = hits > 0 || Math.random() < 0.4
    confidence = Math.min(0.95, 0.5 + hits * 0.15 + (Math.random() * 0.15 - 0.05))
    reasons = sample(TEXT_REASONS, 3)
  } else {
    is_likely_fake = Math.random() < 0.6
    confidence = 0.55 + Math.random() * 0.37
    reasons = sample(IMAGE_REASONS, 3)
  }

  res.json({
    is_likely_fake,
    confidence: Math.round(confidence * 100) / 100,
    reasons,
    tips: sample(TIPS, 3),
  })
})

export default router
