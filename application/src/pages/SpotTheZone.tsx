import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Quiz.css'

import fakeImg1 from '../assets/fakeOrReal_IMG1.jpeg'
import fakeImg4 from '../assets/FakeOrReal_IMG4.jpeg'

interface Hotspot {
  id: number
  top: string
  left: string
  width: string
  height: string
  label: string
}

interface Item {
  id: number
  label: string
  imageUrl: string
  explanation: string
  hotspots: Hotspot[]
}

const items: Item[] = [
  { 
    id: 1, 
    label: 'Image 1', 
    imageUrl: fakeImg1, 
    explanation: 'Aucune incohérence majeure, cette image est plutôt réaliste, mais cherche toujours les petits détails !',
    hotspots: []
  },
  { 
    id: 2, 
    label: 'Portrait 2', 
    imageUrl: '/images/fake_portrait_1773748770531.png', 
    explanation: 'Regarde les mains floues en arrière-plan et les textures étranges sur les vêtements, typiques des erreurs de l\'IA.',
    hotspots: [
      { id: 1, top: '40%', left: '70%', width: '15%', height: '15%', label: 'Mains floues' }
    ]
  },
  { 
    id: 3, 
    label: 'Paysage 1', 
    imageUrl: '/images/real_landscape_1773748786095.png', 
    explanation: 'Bien que convaincante, cette image a été entièrement générée par une Intelligence Artificielle. Un œil attentif peut remarquer des fusions étranges d\'éléments.',
    hotspots: [
      { id: 1, top: '50%', left: '30%', width: '10%', height: '10%', label: 'Fusion étrange' }
    ]
  },
  { 
    id: 4, 
    label: 'Image 4', 
    imageUrl: fakeImg4, 
    explanation: 'Les détails sont cohérents et la lumière est claire, pas d\'erreurs flagrantes ici.',
    hotspots: []
  },
]

export default function SpotTheZone() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState<{ id: number; revealed: boolean }[]>([])

  const item = items[index]
  
  // Dans cette version "exploration", le score pourrait juste refléter la complétion.
  const score = answers.length

  const [username, setUsername] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  const handleReveal = () => {
    if (revealed) return
    setAnswers((prev) => [...prev, { id: item.id, revealed: true }])
    setRevealed(true)
  }

  const handleNext = () => {
    setIndex((prev) => prev + 1)
    setRevealed(false)
  }

  const submitScore = async () => {
    if (!username.trim()) return
    try {
      await fetch('http://localhost:8000/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          score,
          total: items.length,
          module: 'spot_the_zone'
        })
      })
      setSubmitted(true)
      fetchLeaderboard()
    } catch (e) {
      console.error(e)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('http://localhost:8000/scores?module=spot_the_zone')
      const data = await res.json()
      setLeaderboard(data.scores || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (index >= items.length) {
      fetchLeaderboard()
    }
  }, [index, items.length])

  if (index >= items.length) {
    return (
      <div className="page-quiz">
        <div className="page-header">
          <span className="page-emoji">🔍</span>
          <h1>Trouve les incohérences - Résultats</h1>
          <p className="page-subtitle" style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#a78bfa'}}>
            Images analysées : {score} / {items.length}
          </p>
        </div>
        
        <div className="quiz-results" style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '16px' }}>
          
          <h2 style={{marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem'}}>Détail des analyses</h2>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {answers.map((_, i) => {
              const it = items[i]
              return (
                <div key={it.id} className="quiz-result-item" style={{display: 'flex', gap: '15px', alignItems: 'flex-start', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px'}}>
                  <img src={it.imageUrl} alt={it.label} style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px'}} />
                  <div>
                    <p style={{marginBottom: '5px'}}><strong>{it.label}</strong></p>
                    <p style={{fontSize: '0.9rem', color: '#ccc', lineHeight: '1.4'}}><em>{it.explanation}</em></p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="score-submission" style={{marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
            {!submitted ? (
              <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '12px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                <h3 style={{marginBottom: '10px', color: '#a78bfa'}}>Sauvegarde ta participation !</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Ton pseudo" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '10px', flex: 1, borderRadius: '8px', border: '1px solid #444', background: '#111', color: 'white' }}
                  />
                  <button className="btn-primary" onClick={submitScore} disabled={!username.trim()}>Valider</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.3)', textAlign: 'center' }}>
                <p style={{ color: '#4ade80', fontWeight: 'bold' }}>✅ Ta participation a été sauvegardée avec succès !</p>
              </div>
            )}
          </div>

          <div className="leaderboard" style={{ marginTop: '30px', background: 'rgba(0, 0, 0, 0.4)', padding: '25px', borderRadius: '12px' }}>
            <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}><span style={{fontSize: '1.5rem'}}>🏆</span> Le Top 10</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {leaderboard.length === 0 && <p style={{color: '#999', textAlign: 'center', margin: '20px 0'}}>Aucun score pour le moment. Sois le premier !</p>}
              {leaderboard.map((entry, idx) => (
                <li key={idx} style={{ padding: '12px 15px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: idx < 3 ? 'rgba(167, 139, 250, 0.05)' : 'transparent', borderRadius: '8px', marginBottom: '4px' }}>
                  <span style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <strong style={{color: idx === 0 ? '#fbbf24' : idx === 1 ? '#e5e7eb' : idx === 2 ? '#d97706' : '#888', width: '24px'}}>{idx + 1}.</strong> 
                    <span style={{fontWeight: idx < 3 ? 'bold' : 'normal'}}>{entry.username}</span>
                  </span>
                  <span style={{ fontWeight: 'bold', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>{entry.score} / {entry.total}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px', justifyContent: 'center' }}>
            <button className="btn-primary" style={{flex: 1, padding: '15px', maxWidth: '250px'}} onClick={() => {
              setIndex(0); setRevealed(false); setAnswers([]); setSubmitted(false); setUsername(''); setLeaderboard([]);
            }}>Rejouer</button>
            <button className="btn-secondary" style={{flex: 1, padding: '15px', maxWidth: '250px', background: 'transparent', border: '1px solid #a78bfa', color: '#a78bfa', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease'}} onClick={() => navigate('/')}>Retour au menu</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-quiz">
      <div className="page-header">
        <span className="page-emoji">🔍</span>
        <h1>Trouve les incohérences</h1>
        <p className="page-subtitle">Exerce ton œil pour repérer les erreurs de l'IA</p>
      </div>

      <div className="quiz-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Image {index + 1} / {items.length}</h2>
        
        <div style={{ padding: '10px 0', textAlign: 'center', color: '#a78bfa', fontWeight: 'bold' }}>
          {!revealed ? "Clique sur l'image pour révéler l'erreur cachée 👇" : "Voici ce qu'il fallait remarquer !"}
        </div>

        <div 
          style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', position: 'relative', cursor: revealed ? 'default' : 'pointer', border: '2px solid transparent', transition: 'border 0.3s ease' }}
          onClick={handleReveal}
        >
          <img src={item.imageUrl} alt="Incohérence à trouver" style={{ width: '100%', height: 'auto', display: 'block' }} />
          
          {revealed && item.hotspots.map(hotspot => (
            <div
              key={hotspot.id}
              style={{
                position: 'absolute',
                top: hotspot.top,
                left: hotspot.left,
                width: hotspot.width,
                height: hotspot.height,
                border: '3px solid #f87171',
                borderRadius: '50%',
                backgroundColor: 'rgba(248, 113, 113, 0.2)',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
                pointerEvents: 'none',
                zIndex: 10
              }}
              title={hotspot.label}
            >
              <span style={{ 
                position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', 
                background: '#f87171', color: 'white', padding: '4px 8px', borderRadius: '4px', 
                fontSize: '12px', whiteSpace: 'nowrap', fontWeight: 'bold'
              }}>
                {hotspot.label}
              </span>
            </div>
          ))}
        </div>

        {!revealed ? (
          <button
            className="btn-primary"
            style={{ width: '100%', opacity: 0.5 }}
            disabled
          >
            Clique sur l'image !
          </button>
        ) : (
          <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
            <p className="question-hint" style={{ marginBottom: '15px', fontSize: '1.1rem', lineHeight: '1.5' }}>
              <strong>Explication :</strong> {item.explanation}
            </p>
            <button className="btn-primary" onClick={handleNext} style={{ width: '100%' }}>
              {index + 1 === items.length ? 'Voir les résultats' : 'Image Suivante'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
