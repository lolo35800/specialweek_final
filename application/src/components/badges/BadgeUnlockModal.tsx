import { useState } from 'react'
import type { Badge } from '../../data/badges'
import './badges.css'

interface Props {
  badges: Badge[]
}

export function BadgeUnlockModal({ badges }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)

  if (badges.length === 0) return null

  const badge = badges[currentIdx]
  if (!badge) return null

  function next() {
    if (currentIdx + 1 < badges.length) {
      setCurrentIdx((i) => i + 1)
    }
  }

  const isLast = currentIdx + 1 >= badges.length

  return (
    <div className="badge-unlock-overlay" onClick={isLast ? () => setCurrentIdx(badges.length) : next}>
      <div className="badge-unlock-card" onClick={(e) => e.stopPropagation()}>
        <div className="badge-unlock-emoji">
          {badge.emoji}
          <div className="badge-unlock-stars">
            <span /><span /><span /><span /><span /><span />
          </div>
        </div>
        <p className="badge-unlock-title">Badge débloqué !</p>
        <p className="badge-unlock-name">{badge.name}</p>
        <p className="badge-unlock-desc">{badge.description}</p>
        <button className="badge-unlock-btn" onClick={isLast ? () => setCurrentIdx(badges.length) : next}>
          {isLast ? 'Super !' : 'Suivant'}
        </button>
        {badges.length > 1 && (
          <p style={{ fontSize: 12, color: '#64748b' }}>{currentIdx + 1} / {badges.length}</p>
        )}
      </div>
    </div>
  )
}
