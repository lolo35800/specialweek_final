import { Link } from 'react-router-dom'
import type { Challenge } from '../../lib/supabase'

interface Props {
  challenge: Challenge
  showResults?: boolean
}

export function ChallengeCard({ challenge, showResults = false }: Props) {
  const isOpen = challenge.status === 'open'
  const typeLabel = challenge.type === 'quiz' ? 'Quiz' : 'Fake ou Réel'
  const typeEmoji = challenge.type === 'quiz' ? '❓' : '🕵️'

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      padding: '1.25rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span>{typeEmoji}</span>
          <strong style={{ color: 'var(--text-h)' }}>{challenge.title}</strong>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '20px',
            background: isOpen ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
            color: isOpen ? '#4ade80' : '#f87171',
            border: `1px solid ${isOpen ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
          }}>
            {isOpen ? 'Ouvert' : 'Fermé'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>{typeLabel}</span>
          <span>Code : <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{challenge.join_code}</strong></span>
          <span>{new Date(challenge.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
      {showResults && (
        <Link
          to={`/challenge/${challenge.id}/resultats`}
          className="btn btn-outline"
          style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}
        >
          Voir résultats
        </Link>
      )}
    </div>
  )
}
