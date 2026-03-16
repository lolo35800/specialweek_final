import { api } from './api'
import type { Score, SubmitScorePayload } from '../types/score'

export async function submitScore(payload: SubmitScorePayload): Promise<Score> {
  return api.post<Score>('/scores', payload)
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
