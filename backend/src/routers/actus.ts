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
  if (!html) return ''
  return html
    .replace(/<.*?>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
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

    res.json(actus)
  } catch (err) {
    console.error('Erreur fetch actus RSS:', err)
    res.json([])
  }
})

// Cache for the AI summary
let summaryCache: { data: string | null; timestamp: number } = { data: null, timestamp: 0 }

router.get('/actus-summary', async (_req, res) => {
  // Return cache if fresh
  if (summaryCache.data && Date.now() - summaryCache.timestamp < CACHE_TTL) {
    return res.json({ summary: summaryCache.data })
  }

  try {
    // 1. Get the headlines (re-use cache if possible or fetch)
    let actusToSummarize: any[] = []
    if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
      actusToSummarize = cache.data as any[]
    } else {
      // Small refactor: ideally actus fetching should be a separate function
      // For now, we'll just wait for the main cache to be populated or fetch here
      const resp = await fetch(RSS_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const xml = await resp.text()
      const parsed = await parseStringPromise(xml)
      const items = parsed?.rss?.channel?.[0]?.item ?? []
      actusToSummarize = items.slice(0, 7).map((item: any) => ({
        titre: (item.title?.[0] ?? '').split(' - ')[0]
      }))
    }

    const headlines = actusToSummarize.slice(0, 7).map(a => `- ${a.titre}`).join('\n')
    
    // 2. Call Groq
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return res.json({ summary: "Le résumé IA n'est pas disponible pour le moment (Clé API manquante)." })
    }

    const prompt = `Voici les derniers titres de l'actualité IA :\n${headlines}\n\nFais-en un résumé pédagogique et engageant de 3 à 4 phrases maximum pour des lycéens. Ne commence pas par "Voici un résumé", va droit au but.`

    const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Tu es un expert en IA et médias qui vulgarise l\'actualité pour les jeunes.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    })

    if (!groqResp.ok) throw new Error(`Groq API error: ${await groqResp.text()}`)

    const groqData = await groqResp.json()
    const summary = groqData.choices[0].message.content.trim()

    summaryCache = { data: summary, timestamp: Date.now() }
    res.json({ summary })
  } catch (err) {
    console.error('Erreur génération résumé IA:', err)
    res.status(502).json({ detail: 'Impossible de générer le résumé.' })
  }
})

export default router
