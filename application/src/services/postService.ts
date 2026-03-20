import { supabase } from '../lib/supabase'
import type { Post } from '../lib/supabase'

type PostWithProfile = Post & {
  profiles: { username: string; avatar_url: string | null }
}

export async function getPosts(limit = 50): Promise<PostWithProfile[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url)')
    .eq('is_published', true)
    .eq('is_flagged', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as PostWithProfile[]
}

export async function getPostById(id: string): Promise<PostWithProfile | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as PostWithProfile
}

export async function getPostsByUser(userId: string): Promise<PostWithProfile[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url)')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as PostWithProfile[]
}

export async function createPost(
  authorId: string,
  payload: {
    title: string
    description?: string
    type: 'quiz' | 'fake_or_real'
    content: object
    thumbnail_url?: string
  }
): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({ author_id: authorId, ...payload })
    .select()
    .single()

  if (error) throw error
  
  // Award XP and increment posts_created
  const { data: profile } = await supabase.from('profiles').select('xp, posts_created').eq('id', authorId).single()
  if (profile) {
    await supabase.from('profiles').update({
      xp: (profile.xp || 0) + 200,
      posts_created: (profile.posts_created || 0) + 1
    }).eq('id', authorId)
  }

  return data as Post
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) throw error
}

export async function flagPost(postId: string, flagged: boolean): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .update({ is_flagged: flagged })
    .eq('id', postId)
  if (error) throw error
}

export async function getAllPostsAdmin(): Promise<PostWithProfile[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url)')
    .order('is_flagged', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as PostWithProfile[]
}

export async function recordPlay(
  postId: string,
  score: number,
  total: number,
  userId?: string,
  durationS?: number
): Promise<void> {
  await supabase.from('play_sessions').insert({
    post_id: postId,
    score,
    total,
    user_id: userId ?? null,
    duration_s: durationS ?? null,
  })
  // Incrémenter plays_count
  await supabase.rpc('increment_plays', { post_id: postId })

  // Add XP and increment games_played for the user
  if (userId) {
    const { data: profile } = await supabase.from('profiles').select('xp, games_played').eq('id', userId).single()
    if (profile) {
      const xpGained = total * 20 // 20 XP per question
      await supabase.from('profiles').update({
        xp: (profile.xp || 0) + xpGained,
        games_played: (profile.games_played || 0) + 1
      }).eq('id', userId)
    }
  }
}
