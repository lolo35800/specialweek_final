import type { Badge } from '../../data/badges'
import './badges.css'

interface Props {
  badge: Badge
  unlocked: boolean
}

export function BadgeCard({ badge, unlocked }: Props) {
  return (
    <div className="badge-card">
      <div className="badge-tooltip">
        <strong>{badge.name}</strong>
        <br />
        {badge.description}
      </div>
      <div className={`badge-icon ${unlocked ? '' : 'locked'}`}>
        {badge.emoji}
      </div>
      <span className={`badge-name ${unlocked ? '' : 'locked'}`}>
        {badge.name}
      </span>
    </div>
  )
}
