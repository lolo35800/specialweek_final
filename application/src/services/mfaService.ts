import { supabase } from '../lib/supabase'

export async function enrollMfa(): Promise<{ qr: string; secret: string; factorId: string; error: string | null }> {
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Verif-IA' })
  if (error || !data) return { qr: '', secret: '', factorId: '', error: error?.message ?? 'Erreur' }
  return {
    qr: data.totp.qr_code,
    secret: data.totp.secret,
    factorId: data.id,
    error: null,
  }
}

export async function verifyEnrollment(factorId: string, code: string): Promise<{ error: string | null }> {
  const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId })
  if (cErr || !challenge) return { error: cErr?.message ?? 'Erreur' }
  const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code })
  return { error: error?.message ?? null }
}

export async function unenrollMfa(factorId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  return { error: error?.message ?? null }
}

export async function verifyMfaLogin(code: string): Promise<{ error: string | null }> {
  const { data: factors, error: fErr } = await supabase.auth.mfa.listFactors()
  if (fErr || !factors?.totp?.length) return { error: 'Aucun facteur TOTP trouvé' }
  const factorId = factors.totp[0].id
  const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId })
  if (cErr || !challenge) return { error: cErr?.message ?? 'Erreur' }
  const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code })
  return { error: error?.message ?? null }
}

export async function getMfaStatus(): Promise<{ enrolled: boolean; factorId: string | null }> {
  const { data } = await supabase.auth.mfa.listFactors()
  const verified = data?.totp?.filter(f => f.status === 'verified') ?? []
  return { enrolled: verified.length > 0, factorId: verified[0]?.id ?? null }
}

export async function needsMfaVerification(): Promise<boolean> {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  return data?.nextLevel === 'aal2' && data.nextLevel !== data.currentLevel
}
