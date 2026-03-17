import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { AuthModal } from '../auth/AuthModal'
import './BottomNav.css'

export default function BottomNav() {
  const { user, profile } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon">⌂</span>
          <span className="bottom-nav-label">Accueil</span>
        </NavLink>

        <NavLink to="/comprendre" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon">✦</span>
          <span className="bottom-nav-label">Apprendre</span>
        </NavLink>

        {user ? (
          <NavLink to="/create" className={({ isActive }) => `bottom-nav-item bottom-nav-create ${isActive ? 'active' : ''}`}>
            <span className="bottom-nav-plus">+</span>
          </NavLink>
        ) : (
          <button className="bottom-nav-item bottom-nav-create" onClick={() => setShowAuth(true)}>
            <span className="bottom-nav-plus">+</span>
          </button>
        )}

        <NavLink to="/regles" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="bottom-nav-icon">≡</span>
          <span className="bottom-nav-label">Règles</span>
        </NavLink>

        {user ? (
          <NavLink
            to={`/profile/${profile?.username}`}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="bottom-nav-avatar">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" />
                : <span>{profile?.username?.[0]?.toUpperCase() ?? '?'}</span>
              }
            </div>
            <span className="bottom-nav-label">Profil</span>
          </NavLink>
        ) : (
          <button className="bottom-nav-item" onClick={() => setShowAuth(true)}>
            <span className="bottom-nav-icon">○</span>
            <span className="bottom-nav-label">Connexion</span>
          </button>
        )}
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
