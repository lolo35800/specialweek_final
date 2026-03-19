import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/supabase'
import { verifyMfaLogin } from '../services/mfaService'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Vérifie si une session AAL1 nécessite AAL2 (MFA non complété)
async function checkNeedsMfa(): Promise<boolean> {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  return data?.nextLevel === 'aal2' && data.nextLevel !== data.currentLevel
}

// ----- MFA Gate (rendu par AuthProvider, impossible à fermer) -----
function MfaGate({ onDone, onSignOut }: { onDone: () => void; onSignOut: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await verifyMfaLogin(code)
    if (error) {
      setError(error)
    } else {
      onDone()
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 16,
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 32, width: '100%', maxWidth: 380,
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>Double authentification</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Entre le code de ton application d'authentification pour continuer
          </p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
              Code à 6 chiffres
            </label>
            <input
              className="input auth-mfa-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoFocus
              autoComplete="one-time-code"
            />
          </div>
          {error && (
            <p style={{
              fontSize: 13, color: 'var(--danger)',
              background: 'var(--danger-bg)',
              padding: '8px 12px', borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}>{error}</p>
          )}
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || code.length !== 6}
            style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 15 }}
          >
            {loading ? 'Vérification...' : 'Confirmer'}
          </button>
        </form>
        <button
          onClick={onSignOut}
          style={{
            marginTop: 16, width: '100%', background: 'none', border: 'none',
            color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', padding: 8,
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
// -----------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsMfa, setNeedsMfa] = useState(false)

  async function fetchProfile(userId: string, userEmail?: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
    } else {
      const fallbackUsername = userEmail
        ? userEmail.split('@')[0]
        : 'user_' + userId.slice(0, 8)
      const { data: created } = await supabase
        .from('profiles')
        .upsert({ id: userId, username: fallbackUsername }, { onConflict: 'id', ignoreDuplicates: false })
        .select()
        .single()
      setProfile(created)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        // Vérifie si MFA requis même après refresh de page
        const mfaRequired = await checkNeedsMfa()
        if (mfaRequired) {
          setNeedsMfa(true)
        } else {
          await fetchProfile(session.user.id, session.user.email)
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        // Defer hors du contexte du lock Navigator pour éviter le deadlock
        const userId = session.user.id
        const userEmail = session.user.email
        setTimeout(async () => {
          const mfaRequired = await checkNeedsMfa()
          if (mfaRequired) {
            setNeedsMfa(true)
          } else {
            setNeedsMfa(false)
            fetchProfile(userId, userEmail)
          }
        }, 0)
      } else {
        setProfile(null)
        setNeedsMfa(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) return { error: error.message }

    if (data.user) {
      await supabase.from('profiles').upsert(
        { id: data.user.id, username },
        { onConflict: 'id', ignoreDuplicates: true }
      )
    }
    return { error: null }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    // L'AAL check se fait dans onAuthStateChange — needsMfa sera set automatiquement
    return { error: null }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const isAdmin = profile?.role === 'admin' || user?.email === 'sebastien.ltrt@gmail.com'

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signInWithGoogle, signOut, isAdmin }}>
      {children}
      {needsMfa && (
        <MfaGate onSignOut={async () => { await supabase.auth.signOut() }} onDone={async () => {
          // Re-fetch AAL pour confirmer qu'on est bien à aal2
          const still = await checkNeedsMfa()
          if (!still) {
            setNeedsMfa(false)
            if (user) fetchProfile(user.id, user.email ?? undefined)
          }
        }} />
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
