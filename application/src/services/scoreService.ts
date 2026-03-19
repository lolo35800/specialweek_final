import { supabase } from '../lib/supabase'
import { api } from './api'
import type { Score, SubmitScorePayload } from '../types/score'

export async function submitScore(payload: SubmitScorePayload): Promise<Score> {
  const score = await api.post<Score>('/scores', payload)
  
  // Award XP and increment games_played in Supabase if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const xpGained = 50 + (payload.score * 10)
    const { data: profile } = await supabase.from('profiles').select('xp, games_played').eq('id', user.id).single()
    if (profile) {
      await supabase.from('profiles').update({
        xp: (profile.xp || 0) + xpGained,
        games_played: (profile.games_played || 0) + 1
      }).eq('id', user.id)
    }
  }

  return score
}

export async function getLeaderboard(): Promise<Score[]> {
  try {
    const data = await api.get<{ scores: Score[] }>('/scores')
    return data.scores
  } catch {
    return []
  }
}

export async function getUserScores(username: string): Promise<Score[]> {
  try {
    const data = await api.get<{ scores: Score[] }>(`/scores/${encodeURIComponent(username)}`)
    return data.scores
  } catch {
    return []
  }
}
