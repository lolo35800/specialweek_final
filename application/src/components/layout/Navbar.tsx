import { useState, useRef, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { AuthModal } from '../auth/AuthModal'
import './Navbar.css'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [showAuth, setShowAuth] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-text">VériIA</span>
        </NavLink>

        <div className="navbar-auth" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="navbar-theme-btn" onClick={toggle} aria-label="Changer de thème">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user ? (
            <div className="navbar-user" ref={profileRef}>
              <button
                className="navbar-avatar-btn"
                onClick={() => setShowProfile(v => !v)}
              >
                <div className="navbar-avatar">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" />
                  ) : (
                    <span>{profile?.username?.[0]?.toUpperCase() ?? '?'}</span>
                  )}
                </div>
                <span className="navbar-username">{profile?.username ?? '...'}</span>
                <span className="navbar-chevron">{showProfile ? '▲' : '▼'}</span>
              </button>

              {showProfile && (
                <div className="navbar-dropdown" onClick={() => setShowProfile(false)}>
                  <Link to={`/profile/${profile?.username}`} className="navbar-dropdown-item">
                    Mon profil
                  </Link>
                  <Link to="/create" className="navbar-dropdown-item">
                    Créer un post
                  </Link>
                  <Link to="/settings" className="navbar-dropdown-item">
                    Modifier le profil
                  </Link>
                  <hr className="navbar-dropdown-divider" />
                  <button className="navbar-dropdown-item danger" onClick={signOut}>
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-outline navbar-signin-btn" onClick={() => setShowAuth(true)}>
              Se connecter
            </button>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
