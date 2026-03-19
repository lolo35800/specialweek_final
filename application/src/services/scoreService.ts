import { supabase } from '../lib/supabase'
import { api } from './api'
import type { Score, SubmitScorePayload } from '../types/score'

export async function submitScore(payload: SubmitScorePayload): Promise<Score> {
  console.log('Déclenchement de la soumission du score...', payload)
  
  // 1. Envoi au backend local (mock/scores.json)
  const apiPromise = api.post<Score>('/scores', payload)
    .then(res => {
      console.log('Succès API locale')
      return res
    })
    .catch(err => {
      console.warn('Echec API locale (mais on continue pour Supabase):', err)
      return null as any
    })

  // 2. Mise à jour Supabase (XP et Participation)
  const supabasePromise = (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('Pas d\'utilisateur connecté, pas de mise à jour XP.')
        return
      }

      const xpGained = 50 + (payload.score * 10)
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('xp, games_played')
        .eq('id', user.id)
        .single()
      
      if (fetchError) {
        console.error('Erreur fetch profil Supabase:', fetchError)
        return
      }

      if (profile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            xp: (profile.xp || 0) + xpGained,
            games_played: (profile.games_played || 0) + 1
          })
          .eq('id', user.id)
        
        if (updateError) {
          console.error('Erreur update profil Supabase:', updateError)
        } else {
          console.log(`Supabase mis à jour: +${xpGained} XP, +1 participation`)
        }
      }
    } catch (err) {
      console.error('Erreur critique Supabase:', err)
    }
  })()

  // On attend les deux (ou au moins que le score soit "soumis" pour la logique UI)
  const [score] = await Promise.all([apiPromise, supabasePromise])
  
  return score || ({} as Score)
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
