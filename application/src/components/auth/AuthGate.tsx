import { useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { AuthModal } from './AuthModal'
import './AuthGate.css'

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [showModal, setShowModal] = useState(false)

  if (loading) {
    return (
      <div className="authgate-loading">
        <div className="authgate-spinner" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="authgate-wall">
        <div className="authgate-card">
          <div className="authgate-logo">Verif-IA</div>
          <h1 className="authgate-title">Bienvenue</h1>
          <p className="authgate-sub">
            Connecte-toi pour accéder aux quiz, clés pédagogiques et au feed de la communauté.
          </p>
          <button className="btn btn-primary authgate-btn" onClick={() => setShowModal(true)}>
            Se connecter / S'inscrire
          </button>
        </div>

        {showModal && <AuthModal onClose={() => setShowModal(false)} />}
      </div>
    )
  }

  return <>{children}</>
}
