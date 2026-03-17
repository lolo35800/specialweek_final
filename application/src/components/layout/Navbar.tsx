import { useState, useRef, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { AuthModal } from '../auth/AuthModal'
import './Navbar.css'

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [showBurger, setShowBurger] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const burgerRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Ferme les dropdowns si clic en dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (burgerRef.current && !burgerRef.current.contains(e.target as Node)) {
        setShowBurger(false)
      }
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
        {/* Gauche — burger */}
        <div className="navbar-burger-wrap" ref={burgerRef}>
          <button
            className="navbar-burger-btn"
            onClick={() => setShowBurger(v => !v)}
            aria-label="Menu"
          >
            <span className={`navbar-burger-icon ${showBurger ? 'open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>

          {showBurger && (
            <div className="navbar-burger-dropdown" onClick={() => setShowBurger(false)}>
              <NavLink to="/" end className={({ isActive }) => `navbar-burger-item ${isActive ? 'active' : ''}`}>
                Feed
              </NavLink>
              <NavLink to="/comprendre" className={({ isActive }) => `navbar-burger-item ${isActive ? 'active' : ''}`}>
                Comprendre
              </NavLink>
              <NavLink to="/jouer" className={({ isActive }) => `navbar-burger-item ${isActive ? 'active' : ''}`}>
                Jouer
              </NavLink>
              <NavLink to="/regles" className={({ isActive }) => `navbar-burger-item ${isActive ? 'active' : ''}`}>
                5 Règles
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => `navbar-burger-item ${isActive ? 'active' : ''}`}>
                  Admin
                </NavLink>
              )}
              {user && (
                <>
                  <hr className="navbar-burger-divider" />
                  <NavLink to="/create" className={({ isActive }) => `navbar-burger-item ${isActive ? 'active' : ''}`}>
                    Créer un post
                  </NavLink>
                </>
              )}
            </div>
          )}
        </div>

        {/* Centre — logo */}
        <NavLink to="/" className="navbar-brand">
          <span className="brand-text">VériIA</span>
        </NavLink>

        {/* Droite — profil / connexion */}
        <div className="navbar-auth">
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
