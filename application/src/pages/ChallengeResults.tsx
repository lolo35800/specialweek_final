import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getChallengeById, getParticipations, closeChallenge, openChallenge } from '../services/challengeService'
import type { Challenge } from '../lib/supabase'
import type { ParticipationWithProfile } from '../services/challengeService'
import './ChallengeResults.css'

export default function ChallengeResults() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [participations, setParticipations] = useState<ParticipationWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return
      const ch = await getChallengeById(id)
      if (!ch) { setError('Challenge introuvable.'); setLoading(false); return }
      setChallenge(ch)

      const parts = await getParticipations(id)
      setParticipations(parts)
      setLoading(false)
    }
    load()
  }, [id])

  async function handleToggleStatus() {
    if (!challenge) return
    setToggling(true)
    try {
      if (challenge.status === 'open') {
        await closeChallenge(challenge.id)
        setChallenge({ ...challenge, status: 'closed' })
      } else {
        await openChallenge(challenge.id)
        setChallenge({ ...challenge, status: 'open' })
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return (
      <div className="page-quiz">
        <div className="page-header">
          <span className="page-emoji">📊</span>
          <h1>Résultats</h1>
          <p className="page-subtitle">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="page-quiz">
        <div className="page-header">
          <span className="page-emoji">⚠️</span>
          <h1>Résultats</h1>
          <p className="page-subtitle">{error || 'Erreur inconnue'}</p>
        </div>
      </div>
    )
  }

  const isCreator = profile?.id === challenge.creator_id
  const completed = participations.filter(p => p.completed_at)
  const pending = participations.filter(p => !p.completed_at)
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((acc, p) => acc + (p.score ?? 0), 0) / completed.length * 10) / 10
    : 0
  const avgTotal = completed.length > 0 ? completed[0]?.total ?? 0 : 0

  return (
    <div className="challenge-results-page">
      <div className="page-header">
        <span className="page-emoji">📊</span>
        <h1>{challenge.title}</h1>
        <p className="page-subtitle">
          {challenge.type === 'quiz' ? 'Quiz' : 'Fake ou Réel'}
          {' · '}Code : <strong style={{ fontFamily: 'monospace' }}>{challenge.join_code}</strong>
          {' · '}
          <span style={{ color: challenge.status === 'open' ? '#4ade80' : '#f87171' }}>
            {challenge.status === 'open' ? 'Ouvert' : 'Fermé'}
          </span>
        </p>
      </div>

      {isCreator && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            className={`btn ${challenge.status === 'open' ? 'btn-outline' : 'btn-primary'}`}
            onClick={handleToggleStatus}
            disabled={toggling}
            style={{ borderColor: challenge.status === 'open' ? '#f87171' : '#4ade80', color: challenge.status === 'open' ? '#f87171' : '#4ade80' }}
          >
            {toggling ? '...' : challenge.status === 'open' ? 'Fermer le challenge' : 'Rouvrir le challenge'}
          </button>
        </div>
      )}

      <div className="challenge-results-stats">
        <div className="challenge-stat-card">
          <span className="challenge-stat-value">{participations.length}</span>
          <span className="challenge-stat-label">Participants</span>
        </div>
        <div className="challenge-stat-card">
          <span className="challenge-stat-value">{completed.length}</span>
          <span className="challenge-stat-label">Terminé</span>
        </div>
        <div className="challenge-stat-card">
          <span className="challenge-stat-value">{avgScore}/{avgTotal}</span>
          <span className="challenge-stat-label">Score moyen</span>
        </div>
      </div>

      {completed.length > 0 && (
        <div className="challenge-results-table-container">
          <h2>Classement</h2>
          <table className="challenge-results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Étudiant</th>
                <th>Score</th>
                <th>Durée</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((p, idx) => (
                <tr key={p.id} className={idx < 3 ? 'top-three' : ''}>
                  <td className="rank">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </td>
                  <td>
                    <Link to={`/profile/${p.profiles.username}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                      {p.profiles.username}
                    </Link>
                  </td>
                  <td>
                    <strong>{p.score}</strong> / {p.total}
                    <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      ({Math.round(((p.score ?? 0) / Math.max(p.total ?? 1, 1)) * 100)}%)
                    </span>
                  </td>
                  <td>{p.duration_s ? `${Math.floor(p.duration_s / 60)}m ${p.duration_s % 60}s` : '—'}</td>
                  <td>{p.completed_at ? new Date(p.completed_at).toLocaleDateString('fr-FR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pending.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>En attente ({pending.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {pending.map(p => (
              <span key={p.id} style={{
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}>
                {p.profiles.username}
              </span>
            ))}
          </div>
        </div>
      )}

      {participations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.2rem' }}>Aucun participant pour le moment.</p>
          <p>Partage le code <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{challenge.join_code}</strong> avec tes étudiants.</p>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to={`/profile/${profile?.username}`} className="btn btn-outline">Retour au profil</Link>
      </div>
    </div>
  )
}
