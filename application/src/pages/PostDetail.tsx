import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Post, QuizContent, FakeOrRealContent } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getPostById, recordPlay } from '../services/postService'
import './PostDetail.css'

type PostWithProfile = Post & {
  profiles: { username: string; avatar_url: string | null }
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [post, setPost] = useState<PostWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [step, setStep] = useState<'intro' | 'playing' | 'results'>('intro')
  // Quiz state
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<{ selected: number; correct: boolean }[]>([])
  // Fake or Real state
  const [forGuess, setForGuess] = useState<boolean | null>(null)
  const startTime = useRef<number>(0)

  useEffect(() => {
    if (!id) return
    getPostById(id).then(data => {
      if (!data) setNotFound(true)
      else setPost(data as PostWithProfile)
      setLoading(false)
    })
  }, [id])

  function startGame() {
    setStep('playing')
    setCurrentQ(0)
    setAnswers([])
    setSelected(null)
    setForGuess(null)
    startTime.current = Date.now()
  }

  function handleForGuess(guess: boolean) {
    if (!post || forGuess !== null) return
    setForGuess(guess)
    const correct = guess === (post.content as FakeOrRealContent).is_real
    const durationS = Math.round((Date.now() - startTime.current) / 1000)
    recordPlay(post.id, correct ? 1 : 0, 1, user?.id, durationS)
  }

  function handleAnswer(optionIndex: number) {
    if (selected !== null) return
    setSelected(optionIndex)
  }

  function nextQuestion() {
    if (!post || selected === null) return
    const questions = (post.content as QuizContent).questions
    const q = questions[currentQ]
    const correct = selected === q.bonne_reponse
    const newAnswers = [...answers, { selected, correct }]
    setAnswers(newAnswers)
    setSelected(null)

    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1)
    } else {
      const score = newAnswers.filter(a => a.correct).length
      const total = questions.length
      const durationS = Math.round((Date.now() - startTime.current) / 1000)
      recordPlay(post.id, score, total, user?.id, durationS)
      setStep('results')
    }
  }

  if (loading) return <div className="post-detail-loading"><div className="feed-spinner" /></div>
  if (notFound || !post) return (
    <div className="post-detail-notfound">
      <p>Post introuvable.</p>
      <Link to="/" className="btn btn-outline">Retour au feed</Link>
    </div>
  )

  const isQuiz = post.type === 'quiz'
  const questions = isQuiz ? (post.content as QuizContent).questions : []

  return (
    <div className="post-detail">
      <div className="post-detail-header">
        <Link to="/" className="btn btn-ghost">← Retour</Link>
        <div className="post-detail-author">
          <div className="post-card-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
            {post.profiles?.avatar_url
              ? <img src={post.profiles.avatar_url} alt="" />
              : <span>{post.profiles?.username?.[0]?.toUpperCase() ?? '?'}</span>
            }
          </div>
          <Link to={`/profile/${post.profiles?.username}`} className="post-detail-username">
            {post.profiles?.username}
          </Link>
        </div>
      </div>

      {step === 'intro' && (
        <div className="post-detail-intro">
          <span className={`badge ${isQuiz ? 'badge-quiz' : 'badge-fake'}`}>
            {isQuiz ? '🧠 Quiz' : '🕵️ Vrai ou IA'}
          </span>
          <h1>{post.title}</h1>
          {post.description && <p className="post-detail-desc">{post.description}</p>}
          <div className="post-detail-stats">
            <span>❤️ {post.likes_count} likes</span>
            <span>▶ {post.plays_count} parties</span>
            {isQuiz && <span>🧠 {questions.length} questions</span>}
          </div>
          <button className="btn btn-primary post-detail-start" onClick={startGame}>
            Commencer !
          </button>
        </div>
      )}

      {step === 'playing' && !isQuiz && (
        <div className="post-detail-for">
          {(() => {
            const content = post.content as FakeOrRealContent
            const correct = forGuess === content.is_real
            return (
              <>
                <div className="for-image-wrap">
                  <img src={content.image_url} alt="À identifier" className="for-image" />
                </div>

                {forGuess === null ? (
                  <>
                    <p className="for-question">Cette image est-elle vraie ou générée par IA ?</p>
                    <div className="for-choices">
                      <button className="for-btn for-real" onClick={() => handleForGuess(true)}>
                        📷 Vraie photo
                      </button>
                      <button className="for-btn for-ia" onClick={() => handleForGuess(false)}>
                        🤖 Générée par IA
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="for-reveal">
                    <p className={correct ? 'correct-text' : 'wrong-text'} style={{ fontSize: 20 }}>
                      {correct ? '✅ Bonne réponse !' : '❌ Mauvaise réponse'}
                    </p>
                    <p className="for-answer">
                      Cette image est : <strong>{content.is_real ? '📷 une vraie photo' : '🤖 générée par IA'}</strong>
                    </p>
                    <p className="quiz-explication">{content.explication}</p>
                    {content.indices.length > 0 && (
                      <div className="for-indices">
                        <p className="for-indices-title">Indices :</p>
                        <ul>
                          {content.indices.map((ind, i) => <li key={i}>{ind}</li>)}
                        </ul>
                      </div>
                    )}
                    <div className="results-actions">
                      <button className="btn btn-outline" onClick={startGame}>Rejouer</button>
                      <Link to="/" className="btn btn-primary">Retour au feed</Link>
                    </div>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      {step === 'playing' && isQuiz && questions.length > 0 && (
        <div className="post-detail-quiz">
          <div className="quiz-progress">
            <div
              className="quiz-progress-bar"
              style={{ width: `${((currentQ) / questions.length) * 100}%` }}
            />
          </div>
          <p className="quiz-counter">Question {currentQ + 1} / {questions.length}</p>
          <h2 className="quiz-question">{questions[currentQ].texte}</h2>
          <div className="quiz-options">
            {questions[currentQ].options.map((opt, i) => (
              <button
                key={i}
                className={`quiz-option ${
                  selected === null ? '' :
                  i === questions[currentQ].bonne_reponse ? 'correct' :
                  i === selected ? 'wrong' : 'dim'
                }`}
                onClick={() => handleAnswer(i)}
                disabled={selected !== null}
              >
                <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
          </div>
          {selected !== null && (
            <div className="quiz-feedback">
              <p className={selected === questions[currentQ].bonne_reponse ? 'correct-text' : 'wrong-text'}>
                {selected === questions[currentQ].bonne_reponse ? '✅ Bonne réponse !' : '❌ Mauvaise réponse'}
              </p>
              <p className="quiz-explication">{questions[currentQ].explication}</p>
              <button className="btn btn-primary" onClick={nextQuestion}>
                {currentQ + 1 < questions.length ? 'Question suivante →' : 'Voir les résultats'}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'results' && (
        <div className="post-detail-results">
          <div className="results-score-circle">
            <span className="results-score-num">{answers.filter(a => a.correct).length}</span>
            <span className="results-score-total">/ {answers.length}</span>
          </div>
          <h2>Quiz terminé !</h2>
          <p className="results-msg">
            {answers.filter(a => a.correct).length === answers.length
              ? '🏆 Parfait ! Tu es un expert !'
              : answers.filter(a => a.correct).length >= answers.length / 2
              ? '👍 Pas mal ! Continue à t\'entraîner.'
              : '💪 Continue, tu progresses !'}
          </p>
          <div className="results-actions">
            <button className="btn btn-outline" onClick={startGame}>Rejouer</button>
            <Link to="/" className="btn btn-primary">Retour au feed</Link>
          </div>
        </div>
      )}
    </div>
  )
}
