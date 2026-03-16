export type Module = 'quiz' | 'fake_or_real' | 'spot_zone'

export interface Score {
  id: string
  username: string
  score: number
  total: number
  module: Module
  timestamp: string
}

export interface SubmitScorePayload {
  username: string
  score: number
  total: number
  module: Module
}

export interface Stats {
  total_games: number
  average_score: number
  hardest_question_id: number | null
}
