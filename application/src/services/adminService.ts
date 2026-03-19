import { supabase } from '../lib/supabase'

export type UserRole = 'user' | 'admin' | 'etudiant' | 'expert_ia' | 'professeur'

export type RoleRequest = {
  id: string
  user_id: string
  username: string
  requested_role: UserRole
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

// ─── Users ───────────────────────────────────────────────

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function updateUserRole(userId: string, role: UserRole) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (error) throw error
}

export async function deleteUserAccount(userId: string) {
  // Supprime le profil (cascade vers les posts via FK)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)
  if (error) throw error
}

// ─── Role requests ────────────────────────────────────────

export async function getRoleRequests(): Promise<RoleRequest[]> {
  const { data, error } = await supabase
    .from('role_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as RoleRequest[]
}

export async function submitRoleRequest(
  userId: string,
  username: string,
  requestedRole: UserRole
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('role_requests').insert({
    user_id: userId,
    username,
    requested_role: requestedRole,
    status: 'pending',
  })
  return { error: error?.message ?? null }
}

export async function getUserRoleRequest(userId: string): Promise<RoleRequest | null> {
  const { data } = await supabase
    .from('role_requests')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .maybeSingle()
  return (data as RoleRequest | null) ?? null
}

export async function approveRoleRequest(requestId: string, userId: string, role: UserRole) {
  await updateUserRole(userId, role)
  const { error } = await supabase
    .from('role_requests')
    .update({ status: 'approved' })
    .eq('id', requestId)
  if (error) throw error
}

export async function rejectRoleRequest(requestId: string) {
  const { error } = await supabase
    .from('role_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
  if (error) throw error
}
