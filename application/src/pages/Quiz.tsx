import './Quiz.css'
import { useEffect, useMemo, useState } from 'react'
import { submitScore } from '../services/scoreService'
import { fallback as fallbackData } from '../data/fallback'
import type { Question, QuizAnswer } from '../types/quiz'
import { useAuth } from '../contexts/AuthContext'
import { unlockQuizBadges, type Badge } from '../data/badges'
import { BadgeUnlockModal } from '../components/badges/BadgeUnlockModal'

const INITIAL_TIMER = 30

export default function Quiz() {
  const { profile } = useAuth()
  const username = profile?.username ?? 'Anonyme'

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [remaining, setRemaining] = useState(INITIAL_TIMER)
  const [isLoading, setIsLoading] = useState(true)
  const [isFinished, setIsFinished] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentScore, setSentScore] = useState<boolean>(false)
  const [newBadges, setNewBadges] = useState<Badge[]>([])

  const [validated, setValidated] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)

  const currentQuestion = questions[currentIndex]

  const score = useMemo(() => answers.filter((a) => a.correct).length, [answers])

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch('/quiz/questions?shuffle=true')
        if (!response.ok) throw new Error('API quiz non disponible')
        const payload = await response.json()
        const list: Question[] = payload.questions
        if (!Array.isArray(list) || list.length === 0) throw new Error('Aucune question reçue')
        setQuestions(list.slice(0, 10))
      } catch (err) {
        console.warn('Quiz API failed, using fallback', err)
        setQuestions(fallbackData.questions.slice(0, 10))
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [])

  useEffect(() => {
    if (isLoading || isFinished || questions.length === 0 || validated) return

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          handleValidate(null)
          return INITIAL_TIMER
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isFinished, questions, currentIndex, validated])

  useEffect(() => {
    if (!isFinished || answers.length === 0 || sentScore) return

    const payload = {
      username,
      score,
      total: questions.length,
      module: 'quiz' as const,
    }

    if (profile?.id) {
      const earned = unlockQuizBadges(profile.id, score, questions.length)
      if (earned.length > 0) setNewBadges(earned)
    }

    submitScore(payload)
      .then(() => setSentScore(true))
      .catch(() => {
        console.error('Echec envoi score');
        setSentScore(true)
      })
  }, [answers, isFinished, questions.length, score, sentScore, username])

  function formatPercent(correct: number, total: number) {
    return Math.round((correct / Math.max(total, 1)) * 100)
  }

  function resetQuiz() {
    setCurrentIndex(0)
    setSelectedOption(null)
    setAnswers([])
    setRemaining(INITIAL_TIMER)
    setIsFinished(false)
    setSentScore(false)
    setNewBadges([])
    setError(null)
    setValidated(false)
    setLastCorrect(null)
  }

  function handleValidate(choice: number | null) {
    if (!currentQuestion || isFinished || validated) return

    const correct = choice === currentQuestion.bonne_reponse
    setLastCorrect(correct)
    setValidated(true)

    const nextAnswers = [
      ...answers,
      {
        question_id: currentQuestion.id,
        selected: choice === null ? -1 : choice,
        correct,
      },
    ]

    setAnswers(nextAnswers)
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true)
      setSelectedOption(null)
      return
    }

    setCurrentIndex((prev) => prev + 1)
    setSelectedOption(null)
    setRemaining(INITIAL_TIMER)
    setValidated(false)
    setLastCorrect(null)
  }

  if (isLoading) {
    return (
      <div className="page-quiz">
        <div className="page-header">
          <span className="page-emoji">❓</span>
          <h1>Quiz</h1>
          <p className="page-subtitle">Chargement des questions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-quiz">
        <div className="page-header">
          <span className="page-emoji">⚠️</span>
          <h1>Quiz</h1>
          <p className="page-subtitle">{error}</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="page-quiz">
        <div className="page-header">
          <span className="page-emoji">🚧</span>
          <h1>Quiz</h1>
          <p className="page-subtitle">Aucune question disponible.</p>
        </div>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="page-quiz">
        <BadgeUnlockModal badges={newBadges} />
        <div className="page-header">
          <span className="page-emoji">🏁</span>
          <h1>Résultats</h1>
          <p className="page-subtitle">{username}, tu as obtenu {score}/{questions.length} ({formatPercent(score, questions.length)}%)</p>
        </div>

        <div className="quiz-results">
          <button className="btn-primary" onClick={resetQuiz}>Rejouer</button>

          {answers.map((answer, idx) => {
            const q = questions[idx]
            const chosen = answer.selected
            const expected = q.bonne_reponse
            return (
              <div key={q.id} className="quiz-result-item">
                <h4>{idx + 1}. {q.texte}</h4>
                <p>
                  Ta réponse : {chosen >= 0 ? q.options[chosen] : 'Temps écoulé'} – <strong>{answer.correct ? 'Bonne' : 'Mauvaise'}</strong>
                </p>
                <p>Bonne réponse : {q.options[expected]}</p>
                <p className="explanation">Explication : {q.explication}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="page-quiz">
      <div className="page-header">
        <span className="page-emoji">❓</span>
        <h1>Quiz</h1>
        <p className="page-subtitle">{currentIndex + 1}/{questions.length} &middot; {score} bonnes réponses</p>
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
            <button
              className="btn-primary"
              disabled={selectedOption === null}
              onClick={() => handleValidate(selectedOption)}
            >
              Valider
            </button>
            <button
              className="btn-secondary"
              onClick={() => handleValidate(null)}
            >
              Passer
            </button>
          </div>
        ) : (
          <div className="quiz-feedback" style={{ marginTop: '20px', padding: '20px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: `1px solid ${lastCorrect ? '#4ade80' : '#f87171'}` }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: lastCorrect ? '#4ade80' : '#f87171' }}>
              {lastCorrect ? '✅ Bonne réponse !' : '❌ Mauvaise réponse !'}
            </p>
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>{currentQuestion.explication}</p>
            <button className="btn-primary" onClick={handleNext}>
              {currentIndex + 1 === questions.length ? 'Voir les résultats' : 'Suivant'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
