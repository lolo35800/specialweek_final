export type Difficulty = 'facile' | 'moyen' | 'difficile'
export type Category = 'fake_news' | 'ia' | 'deepfake' | 'sources'

export interface Question {
  id: number
  texte: string
  options: [string, string, string, string]
  bonne_reponse: 0 | 1 | 2 | 3
  explication: string
  categorie: Category
  difficulte: Difficulty
}

export interface QuizAnswer {
  question_id: number
  selected: number
  correct: boolean
}

export interface QuizResult {
  score: number
  total: number
  answers: QuizAnswer[]
  duration_s: number
}
