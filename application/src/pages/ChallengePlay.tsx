import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getChallengeById, getUserParticipation, submitChallengeResult } from '../services/challengeService'
import type { Challenge, ChallengeParticipation } from '../lib/supabase'
import type { Question, QuizAnswer } from '../types/quiz'
import { fallback as fallbackData } from '../data/fallback'
import './Quiz.css'

import fakeImg1 from '../assets/fakeOrReal_IMG1.jpeg'
import fakeImg4 from '../assets/FakeOrReal_IMG4.jpeg'

interface FakeOrRealItem {
  id: number
  label: string
  imageUrl: string
  isReal: boolean
  explanation: string
}

const fakeOrRealItems: FakeOrRealItem[] = [
  { id: 1, label: 'Image 1', imageUrl: fakeImg1, isReal: true, explanation: 'Les détails sont cohérents et la lumière est naturelle. C\'est une vraie photo.' },
  { id: 2, label: 'Portrait 2', imageUrl: '/images/fake_portrait_1773748770531.png', isReal: false, explanation: 'Regarde les mains floues et les textures étranges, typiques des erreurs de l\'IA.' },
  { id: 3, label: 'Paysage 1', imageUrl: '/images/real_landscape_1773748786095.png', isReal: false, explanation: 'Cette image a été entièrement générée par une Intelligence Artificielle.' },
  { id: 4, label: 'Image 4', imageUrl: fakeImg4, isReal: true, explanation: 'Les détails sont cohérents et la lumière est naturelle, c\'est une vraie photo.' },
]

const INITIAL_TIMER = 30

export default function ChallengePlay() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [participation, setParticipation] = useState<ChallengeParticipation | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [remaining, setRemaining] = useState(INITIAL_TIMER)
  const [validated, setValidated] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)

  // Fake or Real state
  const [forIndex, setForIndex] = useState(0)
  const [forChosen, setForChosen] = useState<number | null>(null)
  const [forAnswers, setForAnswers] = useState<{ id: number; ok: boolean; choice: boolean }[]>([])
  const [forValidated, setForValidated] = useState(false)

  const [isFinished, setIsFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [startTime] = useState(Date.now())

  // Load challenge + participation
  useEffect(() => {
    async function load() {
      if (!id || !profile) {
        setPageError('Tu dois être connecté pour jouer.')
        setPageLoading(false)
        return
      }

      const ch = await getChallengeById(id)
      if (!ch) { setPageError('Challenge introuvable.'); setPageLoading(false); return }
      if (ch.status === 'closed') { setPageError('Ce challenge est fermé.'); setPageLoading(false); return }
      setChallenge(ch)

      const part = await getUserParticipation(id, profile.id)
      if (!part) { setPageError('Tu n\'as pas rejoint ce challenge.'); setPageLoading(false); return }
      if (part.completed_at) { setPageError('Tu as déjà terminé ce challenge.'); setPageLoading(false); return }
      setParticipation(part)

      // Load quiz questions if quiz type
      if (ch.type === 'quiz') {
        try {
          const response = await fetch('/quiz/questions?shuffle=true')
          if (!response.ok) throw new Error('API quiz non disponible')
          const payload = await response.json()
          const list: Question[] = payload.questions
          if (!Array.isArray(list) || list.length === 0) throw new Error('Aucune question')
          setQuestions(list.slice(0, 10))
        } catch {
          setQuestions(fallbackData.questions.slice(0, 10))
        }
      }

      setPageLoading(false)
    }
    load()
  }, [id, profile])

  // Quiz timer
  useEffect(() => {
    if (!challenge || challenge.type !== 'quiz' || pageLoading || isFinished || questions.length === 0 || validated) return

    const timer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          handleQuizValidate(null)
          return INITIAL_TIMER
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [pageLoading, isFinished, questions, currentIndex, validated, challenge])

  // Submit result when finished
  useEffect(() => {
    if (!isFinished || submitted || submitting || !challenge || !profile) return
    setSubmitting(true)

    const finalScore = challenge.type === 'quiz'
      ? answers.filter(a => a.correct).length
      : forAnswers.filter(a => a.ok).length
    const total = challenge.type === 'quiz' ? questions.length : fakeOrRealItems.length
    const durationS = Math.round((Date.now() - startTime) / 1000)

    submitChallengeResult(challenge.id, profile.id, finalScore, total, durationS)
      .then(() => setSubmitted(true))
      .catch(() => setSubmitted(true))
  }, [isFinished])

  // --- Quiz handlers ---
  const quizScore = useMemo(() => answers.filter(a => a.correct).length, [answers])
  const currentQuestion = questions[currentIndex]

  function handleQuizValidate(choice: number | null) {
    if (!currentQuestion || isFinished || validated) return
    const correct = choice === currentQuestion.bonne_reponse
    setLastCorrect(correct)
    setValidated(true)
    setAnswers(prev => [...prev, { question_id: currentQuestion.id, selected: choice === null ? -1 : choice, correct }])
  }

  function handleQuizNext() {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true)
      return
    }
    setCurrentIndex(prev => prev + 1)
    setSelectedOption(null)
    setRemaining(INITIAL_TIMER)
    setValidated(false)
    setLastCorrect(null)
  }

  // --- Fake or Real handlers ---
  const forScore = useMemo(() => forAnswers.filter(a => a.ok).length, [forAnswers])
  const forItem = fakeOrRealItems[forIndex]

  function handleForValidate() {
    if (forChosen === null) return
    const guessed = Boolean(forChosen)
    const ok = guessed === forItem.isReal
    setForAnswers(prev => [...prev, { id: forItem.id, ok, choice: guessed }])
    setForValidated(true)
  }

  function handleForNext() {
    if (forIndex + 1 >= fakeOrRealItems.length) {
      setIsFinished(true)
      return
    }
    setForIndex(prev => prev + 1)
    setForChosen(null)
    setForValidated(false)
  }

  // --- Renders ---
  if (pageLoading) {
    return (
      <div className="page-quiz">
        <div className="page-header">
          <span className="page-emoji">🏆</span>
          <h1>Challenge</h1>
          <p className="page-subtitle">Chargement...</p>
        </div>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="page-quiz">
        <div className="page-header">
          <span className="page-emoji">⚠️</span>
          <h1>Challenge</h1>
          <p className="page-subtitle">{pageError}</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/" className="btn btn-outline">Retour à l'accueil</Link>
        </div>
      </div>
    )
  }

  if (!challenge) return null

  // Finished screen
  if (isFinished) {
    const finalScore = challenge.type === 'quiz' ? quizScore : forScore
    const total = challenge.type === 'quiz' ? questions.length : fakeOrRealItems.length
    const pct = Math.round((finalScore / Math.max(total, 1)) * 100)

    return (
      <div className="page-quiz">
        <div className="page-header">
          <span className="page-emoji">🏁</span>
          <h1>Challenge terminé !</h1>
          <p className="page-subtitle">{challenge.title}</p>
        </div>

        <div className="quiz-results" style={{ maxWidth: '700px', margin: '0 auto', background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {finalScore} / {total} ({pct}%)
            </p>
            <p style={{ color: 'var(--text-muted)' }}>
              {submitted ? 'Ton score a été enregistré !' : 'Enregistrement en cours...'}
            </p>
          </div>

          {challenge.type === 'quiz' && answers.map((answer, idx) => {
            const q = questions[idx]
            return (
              <div key={q.id} className="quiz-result-item">
                <h4>{idx + 1}. {q.texte}</h4>
                <p>
                  Ta réponse : {answer.selected >= 0 ? q.options[answer.selected] : 'Temps écoulé'} – <strong>{answer.correct ? 'Bonne' : 'Mauvaise'}</strong>
                </p>
                <p>Bonne réponse : {q.options[q.bonne_reponse]}</p>
                <p className="explanation">Explication : {q.explication}</p>
              </div>
            )
          })}

          {challenge.type === 'fake_or_real' && forAnswers.map((a, i) => {
            const it = fakeOrRealItems[i]
            return (
              <div key={it.id} className="quiz-result-item" style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', background: 'var(--bg-elevated)', padding: '15px', borderRadius: '12px' }}>
                <img src={it.imageUrl} alt={it.label} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <p><strong>{it.label}</strong></p>
                  <p>Ta réponse : {a.choice ? 'Vraie photo' : 'Image IA'} – <strong style={{ color: a.ok ? '#4ade80' : '#f87171' }}>{a.ok ? '✅ Bonne' : '❌ Mauvaise'}</strong></p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}><em>{it.explanation}</em></p>
                </div>
              </div>
            )
          })}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to={`/profile/${profile?.username}`} className="btn btn-outline">Retour au profil</Link>
          </div>
        </div>
      </div>
    )
  }

  // Quiz gameplay
  if (challenge.type === 'quiz' && currentQuestion) {
    return (
      <div className="page-quiz">
        <div className="page-header">
          <span className="page-emoji">🏆</span>
          <h1>{challenge.title}</h1>
          <p className="page-subtitle">{currentIndex + 1}/{questions.length} · {quizScore} bonnes réponses</p>
        </div>

        <div className="quiz-card">
          <div className="quiz-meta">
            <div>Question {currentIndex + 1} de {questions.length}</div>
            <div>Temps restant : {remaining}s</div>
            <progress value={remaining} max={INITIAL_TIMER} className="timer-bar" />
          </div>

          <h2>{currentQuestion.texte}</h2>

          <div className="quiz-options">
            {currentQuestion.options.map((option, index) => {
              const selected = selectedOption === index
              const isCorrect = index === currentQuestion.bonne_reponse
              return (
                <button
                  key={option}
                  className={`quiz-option ${selected ? 'selected' : ''} ${validated && isCorrect ? 'correct' : ''} ${validated && selected && !isCorrect ? 'wrong' : ''}`}
                  onClick={() => !validated && setSelectedOption(index)}
                  disabled={validated}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {!validated ? (
            <div className="quiz-actions">
              <button className="btn-primary" disabled={selectedOption === null} onClick={() => handleQuizValidate(selectedOption)}>
                Valider
              </button>
              <button className="btn-secondary" onClick={() => handleQuizValidate(null)}>
                Passer
              </button>
            </div>
          ) : (
            <div className="quiz-feedback" style={{ marginTop: '20px', padding: '20px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: `1px solid ${lastCorrect ? '#4ade80' : '#f87171'}` }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: lastCorrect ? '#4ade80' : '#f87171' }}>
                {lastCorrect ? '✅ Bonne réponse !' : '❌ Mauvaise réponse !'}
              </p>
              <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>{currentQuestion.explication}</p>
              <button className="btn-primary" onClick={handleQuizNext}>
                {currentIndex + 1 === questions.length ? 'Voir les résultats' : 'Suivant'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Fake or Real gameplay
  if (challenge.type === 'fake_or_real' && forItem) {
    return (
      <div className="page-quiz">
        <div className="page-header">
          <span className="page-emoji">🏆</span>
          <h1>{challenge.title}</h1>
          <p className="page-subtitle">Image {forIndex + 1} / {fakeOrRealItems.length}</p>
        </div>

        <div className="quiz-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden' }}>
            <img src={forItem.imageUrl} alt="Fake ou Réel ?" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          <div className="quiz-options">
            <button
              className={`quiz-option ${forChosen === 1 ? 'selected' : ''}`}
              onClick={() => !forValidated && setForChosen(1)}
              disabled={forValidated}
            >Vraie photo</button>
            <button
              className={`quiz-option ${forChosen === 0 ? 'selected' : ''}`}
              onClick={() => !forValidated && setForChosen(0)}
              disabled={forValidated}
            >Image IA</button>
          </div>

          {!forValidated ? (
            <button className="btn-primary" disabled={forChosen === null} onClick={handleForValidate}>
              Valider
            </button>
          ) : (
            <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: forAnswers[forAnswers.length - 1]?.ok ? '#4ade80' : '#f87171' }}>
                {forAnswers[forAnswers.length - 1]?.ok ? '✅ Bonne réponse !' : '❌ Mauvaise réponse !'}
              </p>
              <p style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>Explication : {forItem.explanation}</p>
              <button className="btn-primary" onClick={handleForNext}>
                {forIndex + 1 === fakeOrRealItems.length ? 'Voir les résultats' : 'Suivant'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
