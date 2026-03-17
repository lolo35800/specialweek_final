import './Quiz.css'
import { useEffect, useMemo, useState } from 'react'
import { submitScore } from '../services/scoreService'
import { fallback as fallbackData } from '../data/fallback'
import type { Question, QuizAnswer } from '../types/quiz'
import { useAuth } from '../contexts/AuthContext'

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
    if (isLoading || isFinished || questions.length === 0) return

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          handleAnswer(null)
          return INITIAL_TIMER
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isFinished, questions, currentIndex])

  useEffect(() => {
    if (!isFinished || answers.length === 0 || sentScore) return

    const payload = {
      username,
      score,
      total: questions.length,
      module: 'quiz' as const,
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
    setError(null)
  }

  function handleAnswer(choice: number | null) {
    if (!currentQuestion || isFinished) return

    const correct = choice === currentQuestion.bonne_reponse
    const nextAnswers = [
      ...answers,
      {
        question_id: currentQuestion.id,
        selected: choice === null ? -1 : choice,
        correct,
      },
    ]

    setAnswers(nextAnswers)

    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true)
      setSelectedOption(null)
      return
    }

    setCurrentIndex((prev) => prev + 1)
    setSelectedOption(null)
    setRemaining(INITIAL_TIMER)
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
            return (
              <button
                key={option}
                className={`quiz-option ${selected ? 'selected' : ''}`}
                onClick={() => setSelectedOption(index)}
              >
                {option}
              </button>
            )
          })}
        </div>

        <div className="quiz-actions">
          <button
            className="btn-primary"
            disabled={selectedOption === null}
            onClick={() => handleAnswer(selectedOption)}
          >
            Valider
          </button>
          <button
            className="btn-secondary"
            onClick={() => handleAnswer(null)}
          >
            Passer
          </button>
        </div>

        {selectedOption !== null && (
          <div className="question-hint">
            <p>Explication pédagogique (s'affiche après réponse):</p>
            <p><strong>{currentQuestion.explication}</strong></p>
          </div>
        )}
      </div>
    </div>
  )
}
