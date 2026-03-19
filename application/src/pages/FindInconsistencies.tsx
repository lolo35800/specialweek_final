import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import './FindInconsistencies.css'
import { useAuth } from '../contexts/AuthContext'
import { submitScore } from '../services/scoreService'

type Segment = {
  id: number
  text: string
  isInconsistency: boolean
  explanation?: string
}

type Round = {
  id: number
  context: string
  contextEmoji: string
  title: string
  segments: Segment[]
}

const rounds: Round[] = [
  {
    id: 1,
    context: 'Post Facebook',
    contextEmoji: '📘',
    title: 'Un utilisateur partage une info sur les vaccins',
    segments: [
      { id: 1, text: "URGENT ! Une étude publiée ", isInconsistency: false },
      { id: 2, text: "en 1998 dans The Lancet", isInconsistency: true, explanation: "Cette étude de Wakefield (1998) a été rétractée par The Lancet en 2010 après avoir été prouvée frauduleuse. Elle ne constitue pas une source valable." },
      { id: 3, text: " prouve que les vaccins causent l'autisme. ", isInconsistency: true, explanation: "Des dizaines d'études portant sur des millions d'enfants ont démontré qu'il n'existe aucun lien entre vaccination et autisme." },
      { id: 4, text: "Le gouvernement cache cette information depuis des années. ", isInconsistency: true, explanation: "Affirmation complotiste sans preuve. Les données sur la sécurité vaccinale sont publiques et vérifiables." },
      { id: 5, text: "Partagez avant que ça soit supprimé ! ", isInconsistency: false },
      { id: 6, text: "Les médecins eux-mêmes refusent de vacciner leurs enfants.", isInconsistency: true, explanation: "Les études montrent que les médecins vaccinent leurs enfants à des taux plus élevés que la population générale." },
    ],
  },
  {
    id: 2,
    context: 'Article de blog',
    contextEmoji: '📰',
    title: 'L\'IA va remplacer tous les emplois d\'ici 2025',
    segments: [
      { id: 1, text: "Selon un rapport du Forum Économique Mondial, ", isInconsistency: false },
      { id: 2, text: "l'IA va détruire 85 millions d'emplois d'ici 2025", isInconsistency: true, explanation: "Ce chiffre est sorti de son contexte : le même rapport prévoit la création de 97 millions de nouveaux emplois sur la même période. La suppression nette serait donc positive." },
      { id: 3, text: " dans le monde entier. Les experts s'accordent à dire que ", isInconsistency: false },
      { id: 4, text: "aucun métier ne sera épargné, y compris les artistes et les chirurgiens.", isInconsistency: true, explanation: "Les experts ne s'accordent pas sur ce point. Les métiers nécessitant créativité, empathie ou gestes complexes restent très difficiles à automatiser complètement." },
      { id: 5, text: " ChatGPT, lancé en ", isInconsistency: false },
      { id: 6, text: "2019,", isInconsistency: true, explanation: "ChatGPT a été lancé en novembre 2022, pas en 2019. GPT-2 date de 2019, mais ce n'est pas ChatGPT." },
      { id: 7, text: " est déjà capable de réaliser n'importe quelle tâche humaine.", isInconsistency: true, explanation: "ChatGPT a de nombreuses limites : il hallucine, ne peut pas agir dans le monde physique, manque de bon sens dans des situations inédites, etc." },
    ],
  },
  {
    id: 3,
    context: 'Tweet viral',
    contextEmoji: '🐦',
    title: 'Un compte partage une info sur le changement climatique',
    segments: [
      { id: 1, text: "Le réchauffement climatique est un mythe inventé par la Chine ", isInconsistency: true, explanation: "Le changement climatique est établi par le consensus scientifique mondial (97% des climatologues). Cette affirmation est une théorie complotiste." },
      { id: 2, text: "pour nuire à l'économie occidentale. ", isInconsistency: false },
      { id: 3, text: "La température mondiale n'a pas augmenté depuis 1998.", isInconsistency: true, explanation: "Faux : 2010–2024 compte les années les plus chaudes jamais enregistrées. 1998 était une année exceptionnellement chaude à cause d'El Niño, ce qui crée une illusion de stagnation si on part de ce point." },
      { id: 4, text: " Les ours polaires sont en réalité ", isInconsistency: false },
      { id: 5, text: "plus nombreux qu'avant", isInconsistency: true, explanation: "La population d'ours polaires est en déclin dans plusieurs sous-populations en raison de la fonte des glaces. L'UICN les classe comme vulnérables." },
      { id: 6, text: ", preuve que l'Arctique se porte bien. ", isInconsistency: false },
      { id: 7, text: "Le CO₂ est un gaz naturel donc il ne peut pas être nocif.", isInconsistency: true, explanation: "De nombreuses substances naturelles sont nocives en excès. La concentration de CO₂ dans l'atmosphère a augmenté de 50% depuis l'ère préindustrielle, renforçant l'effet de serre." },
    ],
  },
]

type GameState = 'playing' | 'round-result' | 'finished'

export default function FindInconsistencies() {
  const { profile } = useAuth()
  const [roundIndex, setRoundIndex] = useState(0)
  const [clicked, setClicked] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [gameState, setGameState] = useState<GameState>('playing')
  const [totalScore, setTotalScore] = useState(0)
  const [scoreSent, setScoreSent] = useState(false)

  const round = rounds[roundIndex]

  const correctIds = useMemo(
    () => round.segments.filter((s) => s.isInconsistency).map((s) => s.id),
    [round]
  )

  const foundCorrect = useMemo(
    () => clicked.filter((id) => correctIds.includes(id)),
    [clicked, correctIds]
  )

  const falsePositives = useMemo(
    () => clicked.filter((id) => !correctIds.includes(id)),
    [clicked, correctIds]
  )

  const roundScore = useMemo(() => {
    if (!revealed) return 0
    const correct = foundCorrect.length
    const penalty = falsePositives.length
    return Math.max(0, correct * 10 - penalty * 5)
  }, [revealed, foundCorrect, falsePositives])

  function toggleSegment(id: number) {
    if (revealed) return
    setClicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleReveal() {
    setRevealed(true)
    setGameState('round-result')
    setTotalScore((s) => s + roundScore)
  }

  function handleNextRound() {
    if (roundIndex + 1 >= rounds.length) {
      handleFinish()
    } else {
      setRoundIndex((i) => i + 1)
      setClicked([])
      setRevealed(false)
      setGameState('playing')
    }
  }

  const maxScore = rounds.reduce(
    (acc, r) => acc + r.segments.filter((s) => s.isInconsistency).length * 10,
    0
  )

  async function handleFinish() {
    setGameState('finished')
    const finalScore = totalScore + roundScore
    if (!scoreSent && profile?.username) {
      setScoreSent(true)
      try {
        await submitScore({ module: 'incoherences', username: profile.username, score: finalScore, total: maxScore })
      } catch (e) {
        console.warn('Score non enregistré', e)
      }
    }
  }

  function handleRestart() {
    setRoundIndex(0)
    setClicked([])
    setRevealed(false)
    setGameState('playing')
    setTotalScore(0)
    setScoreSent(false)
  }

  if (gameState === 'finished') {
    const finalScore = totalScore
    return (
      <div className="fi-page">
        <div className="page-header">
          <span className="page-emoji">🎯</span>
          <h1>Résultats</h1>
          <p className="page-subtitle">Voici comment tu t'en es sorti·e</p>
        </div>
        <div className="fi-result-card">
          <div className="fi-final-score">
            <span className="fi-score-number">{finalScore}</span>
            <span className="fi-score-max">/ {maxScore} pts</span>
          </div>
          <p className="fi-score-label">
            {finalScore >= maxScore * 0.8
              ? '🏆 Excellent ! Tu repères très bien la désinformation.'
              : finalScore >= maxScore * 0.5
              ? '👍 Bon travail ! Quelques incohérences t\'ont échappé.'
              : '📚 Continue à t\'entraîner, la désinformation est subtile !'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleRestart}>
              Rejouer
            </button>
            <Link to="/jouer" className="btn btn-outline">Retour aux jeux</Link>
          </div>
        </div>
        <div className="fi-tips">
          <h3>À retenir</h3>
          <ul>
            <li>Vérifie toujours la date et la source d'une étude avant de la partager.</li>
            <li>Les chiffres sortis de leur contexte peuvent inverser complètement un message.</li>
            <li>Un consensus scientifique repose sur des milliers d'études, pas une seule.</li>
            <li>L'urgence ("partagez avant suppression !") est souvent un signal de désinformation.</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="fi-page">
      <div className="page-header">
        <span className="page-emoji">🧐</span>
        <h1>Trouve les incohérences</h1>
        <p className="page-subtitle">Clique sur les passages suspects dans le texte</p>
      </div>

      <div className="fi-progress">
        {rounds.map((r, i) => (
          <div
            key={r.id}
            className={`fi-progress-dot ${i < roundIndex ? 'done' : i === roundIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      <div className="fi-card">
        <div className="fi-context-badge">
          <span>{round.contextEmoji}</span>
          <span>{round.context}</span>
        </div>
        <h2 className="fi-round-title">{round.title}</h2>

        <div className="fi-text">
          {round.segments.map((seg) => {
            const isClicked = clicked.includes(seg.id)
            const isCorrect = seg.isInconsistency
            let cls = 'fi-segment'
            if (isClicked && !revealed) cls += ' fi-selected'
            if (revealed && isCorrect) cls += ' fi-correct'
            if (revealed && isClicked && !isCorrect) cls += ' fi-wrong'

            return (
              <span key={seg.id}>
                <span
                  role="button"
                  tabIndex={0}
                  className={cls}
                  onClick={() => toggleSegment(seg.id)}
                  onKeyDown={(e) => e.key === 'Enter' && toggleSegment(seg.id)}
                  title={revealed && isCorrect && seg.explanation ? seg.explanation : undefined}
                >
                  {seg.text}
                </span>
                {revealed && isCorrect && seg.explanation && (
                  <span className="fi-tooltip">{seg.explanation}</span>
                )}
              </span>
            )
          })}
        </div>

        {!revealed && (
          <div className="fi-hint">
            <span>💡</span>
            <span>{clicked.length} segment{clicked.length > 1 ? 's' : ''} sélectionné{clicked.length > 1 ? 's' : ''} · {correctIds.length} incohérence{correctIds.length > 1 ? 's' : ''} à trouver</span>
          </div>
        )}

        {!revealed ? (
          <button
            className="btn-primary"
            onClick={handleReveal}
            disabled={clicked.length === 0}
          >
            Valider mes réponses
          </button>
        ) : (
          <div className="fi-round-result">
            <div className="fi-round-stats">
              <div className="fi-stat fi-stat-good">
                <strong>{foundCorrect.length}/{correctIds.length}</strong>
                <span>correctes</span>
              </div>
              <div className="fi-stat fi-stat-bad">
                <strong>{falsePositives.length}</strong>
                <span>faux positifs</span>
              </div>
              <div className="fi-stat fi-stat-score">
                <strong>+{roundScore}</strong>
                <span>points</span>
              </div>
            </div>
            <button className="btn-primary" onClick={handleNextRound}>
              {roundIndex + 1 >= rounds.length ? 'Voir mes résultats' : 'Round suivant →'}
            </button>
          </div>
        )}
      </div>

      {revealed && (
        <div className="fi-explanations">
          <h3>Explications</h3>
          {round.segments
            .filter((s) => s.isInconsistency)
            .map((s) => (
              <div key={s.id} className="fi-explanation-item">
                <blockquote>« {s.text.trim()} »</blockquote>
                <p>{s.explanation}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
