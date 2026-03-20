import { supabase } from '../lib/supabase'
import type { Challenge, ChallengeParticipation } from '../lib/supabase'

export type ChallengeWithCreator = Challenge & {
  profiles: { username: string; avatar_url: string | null }
}

export type ParticipationWithProfile = ChallengeParticipation & {
  profiles: { username: string; avatar_url: string | null }
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateJoinCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

export async function createChallenge(
  creatorId: string,
  title: string,
  type: 'quiz' | 'fake_or_real',
  config: Record<string, unknown> = {}
): Promise<Challenge> {
  // Try up to 3 times in case of join_code collision
  for (let attempt = 0; attempt < 3; attempt++) {
    const join_code = generateJoinCode()
    const { data, error } = await supabase
      .from('challenges')
      .insert({ creator_id: creatorId, title, type, join_code, config })
      .select()
      .single()

    if (!error && data) return data as Challenge
    // If error is not a unique violation, throw immediately
    if (error && !error.message.includes('unique')) throw error
  }
  throw new Error('Impossible de générer un code unique. Réessayez.')
}

export async function getChallengeByCode(code: string): Promise<ChallengeWithCreator | null> {
  const { data, error } = await supabase
    .from('challenges')
    .select('*, profiles(username, avatar_url)')
    .eq('join_code', code.toUpperCase())
    .single()

  if (error) return null
  return data as ChallengeWithCreator
}

export async function getChallengeById(id: string): Promise<ChallengeWithCreator | null> {
  const { data, error } = await supabase
    .from('challenges')
    .select('*, profiles(username, avatar_url)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as ChallengeWithCreator
}

export async function getChallengesByCreator(creatorId: string): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Challenge[]
}

export async function closeChallenge(challengeId: string): Promise<void> {
  const { error } = await supabase
    .from('challenges')
    .update({ status: 'closed' })
    .eq('id', challengeId)

  if (error) throw error
}

export async function openChallenge(challengeId: string): Promise<void> {
  const { error } = await supabase
    .from('challenges')
    .update({ status: 'open' })
    .eq('id', challengeId)

  if (error) throw error
}

export async function joinChallenge(challengeId: string, userId: string): Promise<ChallengeParticipation> {
  const { data, error } = await supabase
    .from('challenge_participations')
    .insert({ challenge_id: challengeId, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data as ChallengeParticipation
}

export async function submitChallengeResult(
  challengeId: string,
  userId: string,
  score: number,
  total: number,
  durationS?: number
): Promise<void> {
  const { error } = await supabase
    .from('challenge_participations')
    .update({
      score,
      total,
      duration_s: durationS,
      completed_at: new Date().toISOString(),
    })
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)

  if (error) throw error

  // Award XP (same formula as scoreService)
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, games_played')
    .eq('id', userId)
    .single()

  if (profile) {
    const xpGained = 50 + score * 10
    await supabase
      .from('profiles')
      .update({
        xp: (profile.xp || 0) + xpGained,
        games_played: (profile.games_played || 0) + 1,
      })
      .eq('id', userId)
  }
}

export async function getParticipations(challengeId: string): Promise<ParticipationWithProfile[]> {
  const { data, error } = await supabase
    .from('challenge_participations')
    .select('*, profiles(username, avatar_url)')
    .eq('challenge_id', challengeId)
    .order('score', { ascending: false })

  if (error) throw error
  return (data ?? []) as ParticipationWithProfile[]
}

export async function getUserParticipation(
  challengeId: string,
  userId: string
): Promise<ChallengeParticipation | null> {
  const { data, error } = await supabase
    .from('challenge_participations')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data as ChallengeParticipation
}

export async function getStudentChallenges(userId: string): Promise<(ChallengeParticipation & { challenges: ChallengeWithCreator })[]> {
  const { data, error } = await supabase
    .from('challenge_participations')
    .select('*, challenges(*, profiles(username, avatar_url))')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as any
}
