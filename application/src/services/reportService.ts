import { supabase } from '../lib/supabase'

export async function reportPost(
  postId: string,
  userId: string,
  reason: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('post_reports').upsert(
    { post_id: postId, user_id: userId, reason },
    { onConflict: 'post_id,user_id', ignoreDuplicates: true }
  )
  return { error: error?.message ?? null }
}

export async function hasReportedPost(postId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('post_reports')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

export async function getPostReports() {
  const { data } = await supabase
    .from('post_reports')
    .select('*, posts(title), profiles(username)')
    .order('created_at', { ascending: false })
  return data ?? []
}
