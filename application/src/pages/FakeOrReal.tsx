import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { submitScore as submitGameScore } from '../services/scoreService'
import { unlockFakeOrRealBadges, type Badge } from '../data/badges'
import { BadgeUnlockModal } from '../components/badges/BadgeUnlockModal'
import { BASE_URL } from '../services/api'

import fakeImg1 from '../assets/fakeOrReal_IMG1.jpeg'
import fakeImg4 from '../assets/FakeOrReal_IMG4.jpeg'

interface Item {
  id: number
  label: string
  imageUrl: string
  isReal: boolean
  explanation: string
}

const items: Item[] = [
  { id: 1, label: 'Image 1', imageUrl: fakeImg1, isReal: true, explanation: 'Les détails sont cohérents et la lumière est naturelle, les cheveux sont bien définis et les textures sont réalistes. C\'est une vraie photo.' },
  { id: 2, label: 'Portrait 2', imageUrl: '/images/fake_portrait_1773748770531.png', isReal: false, explanation: 'Regarde les mains floues en arrière-plan et les textures étranges sur les vêtements, typiques des erreurs de l\'IA.' },
  { id: 3, label: 'Paysage 1', imageUrl: '/images/real_landscape_1773748786095.png', isReal: false, explanation: 'Bien que convaincante, cette image a été entièrement générée par une Intelligence Artificielle.' },
  { id: 4, label: 'Image 4', imageUrl: fakeImg4, isReal: true, explanation: 'Les détails sont cohérents et la lumière est naturelle, c\'est une vraie photo.' },
]

export default function FakeOrReal() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [newBadges, setNewBadges] = useState<Badge[]>([])
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [answers, setAnswers] = useState<{ id: number; ok: boolean; choice: boolean }[]>([])
  const [validated, setValidated] = useState(false)

  const item = items[index]
  const score = useMemo(() => answers.filter((a) => a.ok).length, [answers])

  const [username, setUsername] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  const handleValidate = () => {
    if (chosen === null) return
    const guessed = Boolean(chosen)
    const ok = guessed === item.isReal
    setAnswers((prev) => [...prev, { id: item.id, ok, choice: guessed }])
    setValidated(true)
  }

  const handleNext = () => {
    setIndex((prev) => prev + 1)
    setChosen(null)
    setValidated(false)
  }

  const handleScoreSubmit = async () => {
    const finalUsername = profile?.username || username.trim() || 'Anonyme'
    try {
      await submitGameScore({
        username: finalUsername,
        score,
        total: items.length,
        module: 'fake_or_real'
      })
      setSubmitted(true)
      fetchLeaderboard()
    } catch (e) {
      console.error('Erreur submission score:', e)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${BASE_URL}/scores?module=fake_or_real`)
      const data = await res.json()
      setLeaderboard(data.scores || [])
    } catch (e) {
      console.error(e)
    }
  }

  const [submittedAutomatic, setSubmittedAutomatic] = useState(false)

  useEffect(() => {
    if (index >= items.length) {
      fetchLeaderboard()
      
      // Auto-submit if logged in and not already submitted
      if (profile && !submittedAutomatic && !submitted) {
        handleScoreSubmit()
        setSubmittedAutomatic(true)
      }

      if (profile?.id) {
        const earned = unlockFakeOrRealBadges(profile.id, score, items.length)
        if (earned.length > 0) setNewBadges(earned)
      }
    }
  }, [index, items.length, profile, score, submitted, submittedAutomatic])

  if (index >= items.length) {
    return (
      <div className="page-quiz">
        <BadgeUnlockModal badges={newBadges} />
        <div className="page-header">
          <span className="page-emoji">🕵️</span>
          <h1>Fake ou Réel ? - Résultats</h1>
          <p className="page-subtitle" style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#2dd4bf'}}>
            Score final : {score} / {items.length}
          </p>
        </div>
        
        <div className="quiz-results" style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          
          <h2 style={{marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem'}}>Détail de tes réponses</h2>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {answers.map((a, i) => {
              const it = items[i]
              return (
                <div key={it.id} className="quiz-result-item" style={{display: 'flex', gap: '15px', alignItems: 'flex-start', background: 'var(--bg-elevated)', padding: '15px', borderRadius: '12px'}}>
                  <img src={it.imageUrl} alt={it.label} style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px'}} />
                  <div>
                    <p style={{marginBottom: '5px'}}><strong>{it.label}</strong></p>
                    <p style={{marginBottom: '5px'}}>Ta réponse : {a.choice ? 'Vraie photo' : 'Image IA'} - <strong style={{color: a.ok ? '#4ade80' : '#f87171'}}>{a.ok ? '✅ Bonne réponse' : '❌ Mauvaise réponse'}</strong></p>
                    <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4'}}><em>{it.explanation}</em></p>
                  </div>
                </div>
              )
            })}
          </div>

          {!profile && (
            <div className="score-submission" style={{marginTop: '2rem', borderTop: '1px solid var(--border)'}}>
              {!submitted ? (
                <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(20, 184, 166, 0.08)', borderRadius: '12px', border: '1px solid rgba(20, 184, 166, 0.25)' }}>
                  <h3 style={{marginBottom: '10px', color: '#2dd4bf'}}>Sauvegarde ton score !</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Ton pseudo" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      style={{ padding: '10px', flex: 1, borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--field)', color: 'var(--text-h)' }}
                    />
                    <button className="btn-primary" onClick={handleScoreSubmit} disabled={!profile && !username.trim()}>Valider</button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '20px', padding: '15px', background: 'var(--success-bg)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>✅ Ton score a été sauvegardé avec succès !</p>
                </div>
              )}
            </div>
          )}

          <div className="leaderboard" style={{ marginTop: '30px', background: 'var(--bg-elevated)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}><span style={{fontSize: '1.5rem'}}>🏆</span> Le Top 10</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {leaderboard.length === 0 && <p style={{color: 'var(--text-muted)', textAlign: 'center', margin: '20px 0'}}>Aucun score pour le moment. Sois le premier !</p>}
              {leaderboard.map((entry, idx) => (
                <li key={idx} style={{ padding: '12px 15px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: idx < 3 ? 'var(--primary-bg)' : 'transparent', borderRadius: '8px', marginBottom: '4px' }}>
                  <span style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <strong style={{color: idx === 0 ? '#fbbf24' : idx === 1 ? '#a1a1aa' : idx === 2 ? '#d97706' : 'var(--text-muted)', width: '24px'}}>{idx + 1}.</strong> 
                    <span style={{fontWeight: idx < 3 ? 'bold' : 'normal'}}>{entry.username}</span>
                  </span>
                  <span style={{ fontWeight: 'bold', color: '#2dd4bf', background: 'rgba(20, 184, 166, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>{entry.score} / {entry.total}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px', justifyContent: 'center' }}>
            <button className="btn-primary" style={{flex: 1, padding: '15px', maxWidth: '250px'}} onClick={() => {
              setIndex(0); setChosen(null); setAnswers([]); setSubmitted(false); setUsername(''); setLeaderboard([]); setNewBadges([]);
            }}>Rejouer</button>
            <button className="btn-secondary" style={{flex: 1, padding: '15px', maxWidth: '250px', background: 'transparent', border: '1px solid rgba(20,184,166,0.3)', color: '#2dd4bf', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease'}} onClick={() => navigate('/')}>Retour au menu</button>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="page-quiz">
      <div className="page-header">
        <span className="page-emoji">🕵️</span>
        <h1>Fake ou Réel ?</h1>
        <p className="page-subtitle">Détecte la désinformation visuelle</p>
      </div>

      <div className="quiz-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Image {index + 1} / {items.length}</h2>
        <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden' }}>
          <img src={item.imageUrl} alt="Fake ou Réel ?" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div className="quiz-options">
          <button
            className={`quiz-option ${chosen === 1 ? 'selected' : ''}`}
            onClick={() => !validated && setChosen(1)}
            disabled={validated}
          >Vraie photo</button>
          <button
            className={`quiz-option ${chosen === 0 ? 'selected' : ''}`}
            onClick={() => !validated && setChosen(0)}
            disabled={validated}
          >Image IA</button>
        </div>

        {!validated ? (
          <button
            className="btn-primary"
            disabled={chosen === null}
            onClick={handleValidate}
          >Valider</button>
        ) : (
          <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: answers[answers.length - 1]?.ok ? '#4ade80' : '#f87171' }}>
              {answers[answers.length - 1]?.ok ? '✅ Bonne réponse !' : '❌ Mauvaise réponse !'}
            </p>
            <p className="question-hint" style={{ marginBottom: '15px' }}>Explication : {item.explanation}</p>
            <button className="btn-primary" onClick={handleNext}>
              {index + 1 === items.length ? 'Voir les résultats' : 'Suivant'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
