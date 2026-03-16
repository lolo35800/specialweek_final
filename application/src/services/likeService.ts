import { supabase } from '../lib/supabase'

export async function likePost(userId: string, postId: string): Promise<void> {
  await supabase.from('likes').insert({ user_id: userId, post_id: postId })
  await supabase.rpc('increment_likes', { post_id: postId })
}

export async function unlikePost(userId: string, postId: string): Promise<void> {
  await supabase.from('likes').delete().eq('user_id', userId).eq('post_id', postId)
  await supabase.rpc('decrement_likes', { post_id: postId })
}

export async function getLikedPostIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', userId)

  return (data ?? []).map(r => r.post_id)
}
