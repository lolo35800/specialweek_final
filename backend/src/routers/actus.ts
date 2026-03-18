import { Router } from 'express'
import { parseStringPromise } from 'xml2js'

const router = Router()

const RSS_URL =
  'https://news.google.com/rss/search?q=intelligence+artificielle+when:7d&hl=fr&gl=FR&ceid=FR:fr'

const MONTHS_FR = [
  'janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
]

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Éducation': ['école', 'ecole', 'lycée', 'lycee', 'collège', 'college', 'élève', 'eleve', 'professeur', 'prof', 'éducation'],
  'Politique': ['élection', 'election', 'politique', 'gouvernement', 'loi', 'guerre', 'ministre', 'député', 'vote', 'candidat'],
  'Réseaux Sociaux': ['réseau', 'reseau', 'tiktok', 'instagram', 'facebook', 'twitter', 'x', 'social'],
  'Business': ['argent', 'économie', 'entreprise', 'startup', 'bourse', 'nvidia', 'microsoft', 'google', 'openai'],
  'Cybersécurité': ['arnaque', 'cyber', 'hacker', 'sécurité', 'phishing'],
}

// In-memory cache (1 hour TTL)
let cache: { data: unknown[] | null; timestamp: number } = { data: null, timestamp: 0 }
const CACHE_TTL = 3600 * 1000

function stripHtml(html: string): string {
  return html.replace(/<.*?>/g, '')
}

function categorize(text: string): string {
  const lower = text.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat
  }
  return 'IA & Tech'
}

function formatDateFr(dateStr: string): { display: string; ts: number } {
  try {
    const d = new Date(dateStr)
    const day = d.getDate()
    const month = MONTHS_FR[d.getMonth()]
    const year = d.getFullYear()
    return { display: `${day} ${month} ${year}`, ts: d.getTime() }
  } catch {
    return { display: '', ts: Date.now() }
  }
}

router.get('/actus', async (_req, res) => {
  // Return cache if fresh
  if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
    return res.json(cache.data)
  }

  try {
    const resp = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const xml = await resp.text()
    const parsed = await parseStringPromise(xml)

    const items = parsed?.rss?.channel?.[0]?.item ?? []
    const actus = items.slice(0, 50).map((item: Record<string, string[]>, idx: number) => {
      const rawTitle = item.title?.[0] ?? ''
      const link = item.link?.[0] ?? ''
      const rawDesc = item.description?.[0] ?? ''
      const pubDate = item.pubDate?.[0] ?? ''

      // Extract source from title ("Title - Source")
      const dashIdx = rawTitle.lastIndexOf(' - ')
      const titre = dashIdx > 0 ? rawTitle.slice(0, dashIdx) : rawTitle
      const source = dashIdx > 0 ? rawTitle.slice(dashIdx + 3) : ''

      // Clean description
      let resume = stripHtml(rawDesc).trim()
      if (!resume) resume = "Découvrez la dernière actualité sur l'intelligence artificielle."
      if (resume.length > 150) resume = resume.slice(0, 147) + '...'

      const { display: date, ts: timestamp } = formatDateFr(pubDate)
      const combined = `${titre} ${resume}`
      const categorie = categorize(combined)

      return {
        id: `rss-${idx}-${timestamp}`,
        date,
        timestamp,
        categorie,
        titre,
        resume,
        source,
        lien: link,
        une: false,
      }
    })

    // Sort newest first, mark first as featured
    actus.sort((a: { timestamp: number }, b: { timestamp: number }) => b.timestamp - a.timestamp)
    if (actus.length > 0) actus[0].une = true

    cache = { data: actus, timestamp: Date.now() }
    res.json(actus)
  } catch (err) {
    console.error('Erreur fetch actus RSS:', err)
    res.json([])
  }
})

export default router
