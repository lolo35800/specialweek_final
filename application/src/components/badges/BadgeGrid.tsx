import { ALL_BADGES, getUnlockedBadges } from '../../data/badges'
import { BadgeCard } from './BadgeCard'
import './badges.css'

interface Props {
  userId: string
}

export function BadgeGrid({ userId }: Props) {
  const unlocked = getUnlockedBadges(userId)
  const unlockedIds = new Set(unlocked.map((u) => u.badgeId))

  return (
    <div className="badge-grid-section">
      <h2>Badges ({unlocked.length}/{ALL_BADGES.length})</h2>
      <div className="badge-grid">
        {ALL_BADGES.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} unlocked={unlockedIds.has(badge.id)} />
        ))}
      </div>
    </div>
  )
}
