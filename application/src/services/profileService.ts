import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/supabase'

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  return data
}

export async function updateProfile(
  userId: string,
  updates: { username?: string; bio?: string; avatar_url?: string }
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  return { error: error?.message ?? null }
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()
  return !data
}
