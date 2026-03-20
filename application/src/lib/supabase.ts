import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          role: 'user' | 'admin' | 'etudiant' | 'expert_ia' | 'professeur'
          xp: number
          games_played: number
          posts_created: number
          is_banned: boolean
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          role?: 'user' | 'admin' | 'etudiant' | 'expert_ia' | 'professeur'
          xp?: number
          games_played?: number
          posts_created?: number
        }
        Update: {
          username?: string
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          xp?: number
          games_played?: number
          posts_created?: number
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          title: string
          description: string | null
          type: 'quiz' | 'fake_or_real'
          content: QuizContent | FakeOrRealContent
          thumbnail_url: string | null
          likes_count: number
          plays_count: number
          is_published: boolean
          is_flagged: boolean
          created_at: string
        }
        Insert: {
          author_id: string
          title: string
          description?: string | null
          type: 'quiz' | 'fake_or_real'
          content: QuizContent | FakeOrRealContent
          thumbnail_url?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          is_published?: boolean
          is_flagged?: boolean
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          post_id: string
        }
      }
      play_sessions: {
        Row: {
          id: string
          user_id: string | null
          post_id: string
          score: number
          total: number
          duration_s: number | null
          created_at: string
        }
        Insert: {
          user_id?: string | null
          post_id: string
          score: number
          total: number
          duration_s?: number | null
        }
      }
      challenges: {
        Row: {
          id: string
          creator_id: string
          title: string
          type: 'quiz' | 'fake_or_real'
          join_code: string
          config: Record<string, unknown>
          status: 'open' | 'closed'
          created_at: string
        }
        Insert: {
          creator_id: string
          title: string
          type: 'quiz' | 'fake_or_real'
          join_code: string
          config?: Record<string, unknown>
        }
        Update: {
          title?: string
          status?: 'open' | 'closed'
          config?: Record<string, unknown>
        }
      }
      challenge_participations: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          score: number | null
          total: number | null
          duration_s: number | null
          completed_at: string | null
          joined_at: string
        }
        Insert: {
          challenge_id: string
          user_id: string
        }
        Update: {
          score?: number
          total?: number
          duration_s?: number
          completed_at?: string
        }
      }
    }
  }
}

export interface QuizQuestion {
  id: string
  texte: string
  options: string[]
  bonne_reponse: number
  explication: string
}

export interface QuizContent {
  questions: QuizQuestion[]
}

export interface FakeOrRealContent {
  image_url: string
  is_real: boolean
  explication: string
  indices: string[]
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
export type PlaySession = Database['public']['Tables']['play_sessions']['Row']
export type Challenge = Database['public']['Tables']['challenges']['Row']
export type ChallengeParticipation = Database['public']['Tables']['challenge_participations']['Row']
