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

export async function deleteReport(reportId: string) {
  const { error } = await supabase
    .from('post_reports')
    .delete()
    .eq('id', reportId)
  if (error) console.error('deleteReport error:', error)
}

export async function getPostReports() {
  const { data, error } = await supabase
    .from('post_reports')
    .select('*, posts!post_id(title), profiles!user_id(username)')
    .order('created_at', { ascending: false })
  if (error) console.error('getPostReports error:', error)
  return data ?? []
}
