import { useEffect, useRef, useState } from 'react'
import './ChatBot.css'

// ── Types ───────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ── Knowledge base ──────────────────────────────

interface QA {
  keywords: string[]
  answer: string
}

const KNOWLEDGE_BASE: QA[] = [
  // ── Désinformation / fake news ──
  {
    keywords: ['fake news', 'fausse information', 'desinformation', 'désinformation', 'infox'],
    answer: 'Une fake news (ou infox) est une fausse information présentée comme vraie, souvent pour manipuler l\'opinion. Elle se propage vite sur les réseaux sociaux car elle joue sur les émotions (peur, colère, surprise). Pour t\'en protéger : vérifie toujours la source !',
  },
  {
    keywords: ['verifier', 'vérifier', 'checker', 'fact check', 'factcheck', 'source'],
    answer: 'Pour vérifier une info :\n1. Cherche la source originale (qui a publié en premier ?)\n2. Regarde si d\'autres médias fiables en parlent\n3. Utilise des fact-checkers comme AFP Factuel ou Les Décodeurs\n4. Vérifie la date de l\'article\n5. Méfie-toi des titres trop sensationnels',
  },
  {
    keywords: ['reconnaitre', 'reconnaître', 'reperer', 'repérer', 'detecter', 'détecter', 'identifier', 'signe'],
    answer: 'Les signes d\'une fake news :\n• Titre choquant ou trop beau pour être vrai\n• Pas de source ou auteur identifiable\n• Fautes d\'orthographe inhabituelles\n• URL bizarre (ex: .com.co)\n• Image sortie de son contexte\n• Aucun autre média n\'en parle',
  },
  {
    keywords: ['propager', 'partager', 'viral', 'reseaux', 'réseaux', 'sociaux', 'tiktok', 'instagram', 'twitter'],
    answer: 'Les fake news se propagent 6x plus vite que les vraies infos sur les réseaux sociaux ! Les algorithmes favorisent les contenus qui génèrent des réactions émotionnelles. Avant de partager : prends 30 secondes pour vérifier. Si tu doutes, ne partage pas.',
  },
  // ── IA générative ──
  {
    keywords: ['deepfake', 'deep fake'],
    answer: 'Un deepfake est une vidéo ou un audio truqué grâce à l\'IA. Elle peut faire dire n\'importe quoi à n\'importe qui de façon très réaliste. Pour les repérer : regarde les clignements des yeux, les bords du visage, les mouvements de lèvres décalés, et vérifie toujours la source de la vidéo.',
  },
  {
    keywords: ['image ia', 'image artificielle', 'image generee', 'image générée', 'generer', 'générer', 'midjourney', 'dall-e', 'stable diffusion'],
    answer: 'Les images générées par IA ont souvent des défauts :\n• Mains avec trop ou pas assez de doigts\n• Texte illisible ou déformé\n• Arrière-plans flous ou incohérents\n• Symétrie trop parfaite des visages\n• Textures étranges sur les vêtements\nUtilise la recherche inversée d\'image (Google Images) pour vérifier.',
  },
  {
    keywords: ['ia', 'intelligence artificielle', 'chatgpt', 'gpt', 'llm'],
    answer: 'L\'intelligence artificielle (IA) est un programme capable d\'apprendre et de produire du contenu (texte, image, vidéo). C\'est un outil puissant mais qui peut être détourné pour créer de la désinformation. L\'important c\'est de garder son esprit critique face à tout contenu, même convaincant.',
  },
  {
    keywords: ['fausse video', 'fausse vidéo', 'video truquee', 'vidéo truquée', 'video ia', 'vidéo ia'],
    answer: 'Oui, l\'IA peut créer de fausses vidéos très réalistes (deepfakes). Pour t\'en méfier :\n• Le mouvement des lèvres est parfois décalé\n• Les bords du visage peuvent scintiller\n• La personne cligne rarement des yeux\n• Vérifie si la vidéo est relayée par des médias fiables',
  },
  // ── Esprit critique ──
  {
    keywords: ['esprit critique', 'critique', 'penser', 'reflexion', 'réflexion'],
    answer: 'L\'esprit critique, c\'est la capacité à ne pas croire tout ce qu\'on voit ou entend sans réfléchir. C\'est se poser des questions : Qui dit ça ? Pourquoi ? Y a-t-il des preuves ? C\'est une compétence essentielle à l\'ère des réseaux sociaux et de l\'IA.',
  },
  {
    keywords: ['biais', 'manipulation', 'manipuler', 'emotion', 'émotion'],
    answer: 'La désinformation exploite nos biais cognitifs : le biais de confirmation (on croit ce qui nous arrange), l\'effet de répétition (à force de voir une info, on la croit vraie), et les émotions fortes (peur, colère). Quand un contenu te fait réagir fort, c\'est justement le moment de prendre du recul !',
  },
  // ── Le projet VériIA ──
  {
    keywords: ['veriia', 'vériia', 'site', 'plateforme', 'projet', 'application'],
    answer: 'VériIA est une plateforme éducative qui t\'aide à comprendre la désinformation et l\'IA générative. Tu peux jouer à des quiz, analyser des images (Fake ou Réel), trouver des incohérences (Spot the Zone), et lire des articles d\'actualité. Tout ça pour développer ton esprit critique !',
  },
  {
    keywords: ['quiz', 'jouer', 'jeu', 'jeux', 'game'],
    answer: 'VériIA propose 3 jeux :\n• Quiz : 10 questions sur la désinformation\n• Fake ou Réel : devine si une image est vraie ou générée par IA\n• Spot the Zone : repère les incohérences dans une image\nTu peux y accéder depuis la page "Jouer" !',
  },
  // ── Politesses ──
  {
    keywords: ['bonjour', 'salut', 'hello', 'hey', 'coucou', 'yo', 'wesh', 'bonsoir'],
    answer: 'Salut ! Comment je peux t\'aider aujourd\'hui ? Tu peux me poser des questions sur les fake news, l\'IA, les deepfakes, ou comment vérifier une information.',
  },
  {
    keywords: ['merci', 'thanks', 'remercie', 'cool', 'super', 'genial', 'génial', 'top'],
    answer: 'De rien ! N\'hésite pas si tu as d\'autres questions. Reste curieux et garde toujours ton esprit critique !',
  },
  {
    keywords: ['au revoir', 'bye', 'a+', 'ciao', 'adieu', 'bonne journee', 'bonne journée'],
    answer: 'À bientôt ! N\'oublie pas : avant de partager, vérifie. Bonne journée !',
  },
  {
    keywords: ['ca va', 'ça va', 'comment tu vas', 'comment vas', 'la forme'],
    answer: 'Je suis un assistant, donc toujours en forme ! Et toi, tu as des questions sur la désinformation ou l\'IA ?',
  },
  {
    keywords: ['qui es tu', 'qui es-tu', 'tu es qui', 'ton nom', 'comment tu t\'appelle'],
    answer: 'Je suis l\'assistant de VériIA ! Je suis là pour t\'aider à comprendre la désinformation, les fake news et l\'intelligence artificielle. Pose-moi tes questions !',
  },
]

const FALLBACK_ANSWERS = [
  'Hmm, je ne suis pas sûr de comprendre. Essaie de me poser une question sur les fake news, les deepfakes ou l\'IA !',
  'Je suis spécialisé dans la désinformation et l\'IA. Tu peux me demander comment vérifier une info, ce qu\'est un deepfake, etc.',
  'Je n\'ai pas de réponse pour ça, mais n\'hésite pas à me poser des questions sur les fake news ou l\'esprit critique !',
]

const SUGGESTED_QUESTIONS = [
  'C\'est quoi une fake news ?',
  'Comment repérer une image IA ?',
  'C\'est quoi un deepfake ?',
  'Comment vérifier une info ?',
]

// ── Fuzzy matching ──────────────────────────────

/** Levenshtein distance between two strings */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
    }
  }
  return d[m][n]
}

/** Check if word fuzzy-matches keyword (tolerance based on word length) */
function fuzzyMatch(word: string, keyword: string): boolean {
  if (keyword.includes(' ')) {
    // Multi-word keyword: check if input contains it (with tolerance on each word)
    const kwWords = keyword.split(/\s+/)
    return kwWords.every((kw) => fuzzyMatchAnyWord(word, kw))
  }
  const maxDist = keyword.length <= 3 ? 0 : keyword.length <= 5 ? 1 : 2
  return levenshtein(word, keyword) <= maxDist
}

function fuzzyMatchAnyWord(input: string, kw: string): boolean {
  return input.split(/\s+/).some((w) => fuzzyMatch(w, kw))
}

/** Score a user message against a QA entry. Higher = better match. */
function scoreMatch(input: string, qa: QA): number {
  const normalized = input
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents for matching
    .replace(/['']/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')

  const inputKeep = input.toLowerCase() // keep accents for exact substring check

  let score = 0
  for (const kw of qa.keywords) {
    const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    // Exact substring match (best)
    if (inputKeep.includes(kw) || normalized.includes(kwNorm)) {
      score += 10
      continue
    }

    // Fuzzy word-level match
    if (kw.includes(' ')) {
      const kwWords = kwNorm.split(/\s+/)
      const inputWords = normalized.split(/\s+/)
      const matched = kwWords.filter((kword) =>
        inputWords.some((iw) => fuzzyMatch(iw, kword))
      ).length
      if (matched === kwWords.length) score += 8
      else if (matched > 0) score += matched * 2
    } else {
      const inputWords = normalized.split(/\s+/)
      if (inputWords.some((w) => fuzzyMatch(w, kwNorm))) {
        score += 5
      }
    }
  }
  return score
}

function findBestAnswer(input: string): string {
  let bestScore = 0
  let bestAnswer = ''

  for (const qa of KNOWLEDGE_BASE) {
    const s = scoreMatch(input, qa)
    if (s > bestScore) {
      bestScore = s
      bestAnswer = qa.answer
    }
  }

  if (bestScore >= 5) return bestAnswer

  // Fallback
  return FALLBACK_ANSWERS[Math.floor(Math.random() * FALLBACK_ANSWERS.length)]
}

// ── Typing delay ────────────────────────────────

function typingDelay(): Promise<void> {
  const ms = 600 + Math.random() * 800
  return new Promise((r) => setTimeout(r, ms))
}

// ── Component ───────────────────────────────────

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Salut ! Je suis l\'assistant VériIA. Pose-moi tes questions sur la désinformation, les fake news ou l\'IA générative !' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setInput('')
    setLoading(true)
    setShowSuggestions(false)

    const reply = findBestAnswer(msg)

    await typingDelay()

    setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <button
        className={`chatbot-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Ouvrir le chatbot"
      >
        {open ? '✕' : '🤖'}
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span className="chatbot-header-icon">🤖</span>
            <div>
              <strong>Assistant VériIA</strong>
              <span className="chatbot-status">En ligne</span>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-bubble ${msg.role}`}>
                {msg.role === 'assistant' && <span className="chatbot-avatar">🤖</span>}
                <div className="chatbot-text">{msg.content}</div>
              </div>
            ))}

            {showSuggestions && !loading && (
              <div className="chatbot-suggestions">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button key={q} className="chatbot-chip" onClick={() => handleSend(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="chatbot-bubble assistant">
                <span className="chatbot-avatar">🤖</span>
                <div className="chatbot-text">
                  <span className="chatbot-typing"><span /><span /><span /></span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form className="chatbot-input-bar" onSubmit={(e) => { e.preventDefault(); handleSend() }}>
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Pose ta question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoComplete="off"
            />
            <button type="submit" className="chatbot-send" disabled={!input.trim() || loading}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  )
}
