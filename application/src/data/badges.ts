export interface Badge {
  id: string
  name: string
  emoji: string
  description: string
  category: 'quiz' | 'fake_or_real' | 'spot_the_zone' | 'community'
}

export interface UnlockedBadge {
  badgeId: string
  unlockedAt: string
}

export const ALL_BADGES: Badge[] = [
  // ── Jeux ──
  { id: 'quiz_first', name: 'Première question', emoji: '❓', description: 'A terminé son premier Quiz', category: 'quiz' },
  { id: 'quiz_good', name: 'Bon élève', emoji: '📚', description: '70 %+ de bonnes réponses au Quiz', category: 'quiz' },
  { id: 'quiz_perfect', name: 'Cerveau d\'acier', emoji: '🧠', description: 'Score parfait au Quiz', category: 'quiz' },
  { id: 'fake_first', name: 'Détective en herbe', emoji: '🕵️', description: 'A terminé Fake ou Réel', category: 'fake_or_real' },
  { id: 'fake_perfect', name: 'Œil de lynx', emoji: '👁️', description: 'Score parfait à Fake ou Réel', category: 'fake_or_real' },
  { id: 'spot_done', name: 'Chasseur d\'indices', emoji: '🔍', description: 'Toutes les incohérences trouvées', category: 'spot_the_zone' },
  // ── Communauté ──
  { id: 'post_first', name: 'Premier pas', emoji: '✏️', description: 'A publié son premier post', category: 'community' },
  { id: 'post_5', name: 'Créateur actif', emoji: '🎨', description: 'A publié 5 posts', category: 'community' },
  { id: 'likes_10', name: 'Apprécié', emoji: '❤️', description: 'A reçu 10 likes au total', category: 'community' },
  { id: 'likes_50', name: 'Populaire', emoji: '🌟', description: 'A reçu 50 likes au total', category: 'community' },
  { id: 'plays_25', name: 'Influenceur', emoji: '🎮', description: '25 parties jouées sur ses posts', category: 'community' },
]

function storageKey(userId: string): string {
  return `badges_${userId}`
}

export function getUnlockedBadges(userId: string): UnlockedBadge[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function hasBadge(userId: string, badgeId: string): boolean {
  return getUnlockedBadges(userId).some((b) => b.badgeId === badgeId)
}

/** Unlock a badge. Returns the Badge if newly unlocked, null if already owned. */
export function unlockBadge(userId: string, badgeId: string): Badge | null {
  if (hasBadge(userId, badgeId)) return null
  const unlocked = getUnlockedBadges(userId)
  unlocked.push({ badgeId, unlockedAt: new Date().toISOString() })
  localStorage.setItem(storageKey(userId), JSON.stringify(unlocked))
  return ALL_BADGES.find((b) => b.id === badgeId) ?? null
}

/** Unlock all badges the user earned for a quiz result. Returns newly unlocked badges. */
export function unlockQuizBadges(userId: string, score: number, total: number): Badge[] {
  const newBadges: Badge[] = []
  const add = (id: string) => { const b = unlockBadge(userId, id); if (b) newBadges.push(b) }

  add('quiz_first')
  if (score >= Math.ceil(total * 0.7)) add('quiz_good')
  if (score === total) add('quiz_perfect')

  return newBadges
}

export function unlockFakeOrRealBadges(userId: string, score: number, total: number): Badge[] {
  const newBadges: Badge[] = []
  const add = (id: string) => { const b = unlockBadge(userId, id); if (b) newBadges.push(b) }

  add('fake_first')
  if (score === total) add('fake_perfect')

  return newBadges
}

export function unlockSpotBadges(userId: string): Badge[] {
  const b = unlockBadge(userId, 'spot_done')
  return b ? [b] : []
}

/** Check and unlock community badges based on post stats. */
export function unlockCommunityBadges(
  userId: string,
  postCount: number,
  totalLikes: number,
  totalPlays: number,
): Badge[] {
  const newBadges: Badge[] = []
  const add = (id: string) => { const b = unlockBadge(userId, id); if (b) newBadges.push(b) }

  if (postCount >= 1) add('post_first')
  if (postCount >= 5) add('post_5')
  if (totalLikes >= 10) add('likes_10')
  if (totalLikes >= 50) add('likes_50')
  if (totalPlays >= 25) add('plays_25')

  return newBadges
}
