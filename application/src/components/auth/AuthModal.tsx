import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './AuthModal.css'

interface Props {
  onClose: () => void
}

type Mode = 'login' | 'register'

export function AuthModal({ onClose }: Props) {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
      else onClose()
    } else {
      if (username.trim().length < 3) {
        setError('Le pseudo doit faire au moins 3 caractères')
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password, username.trim())
      if (error) setError(error)
      else setSuccess(true)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error)
  }

  function switchMode() {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError(null)
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>✕</button>

        {success ? (
          <div className="auth-success">
            <div className="auth-success-icon">✉️</div>
            <h2>Vérifie tes emails !</h2>
            <p>Un lien de confirmation t'a été envoyé à <strong>{email}</strong></p>
            <button className="btn btn-primary" onClick={onClose}>OK</button>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h2>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h2>
              <p className="auth-subtitle">
                {mode === 'login'
                  ? 'Content de te revoir !'
                  : 'Rejoins la communauté Verif-IA'}
              </p>
            </div>

            <button className="btn btn-google" onClick={handleGoogle} type="button">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34 6.6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34 6.6 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.5 39.5 16.3 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C43 35.2 44 30 44 24c0-1.3-.1-2.6-.4-3.9z"/>
              </svg>
              Continuer avec Google
            </button>

            <div className="auth-divider"><span>ou</span></div>

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === 'register' && (
                <div className="auth-field">
                  <label htmlFor="username">Pseudo</label>
                  <input
                    id="username"
                    className="input"
                    type="text"
                    placeholder="ton_pseudo"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              )}
              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  placeholder="toi@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
              </button>
            </form>

            <p className="auth-switch">
              {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
              {' '}
              <button className="auth-switch-btn" onClick={switchMode}>
                {mode === 'login' ? 'S\'inscrire' : 'Se connecter'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
