import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { AuthModal } from '../auth/AuthModal'
import './Navbar.css'

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-icon">🛡️</span>
          <span className="brand-text">VériIA</span>
        </NavLink>

        <ul className="navbar-links">
          <li>
            <NavLink to="/comprendre" className={({ isActive }) => isActive ? 'active' : ''}>
              Comprendre
            </NavLink>
          </li>
          <li>
            <NavLink to="/jouer" className={({ isActive }) => isActive ? 'active' : ''}>
              Jouer
            </NavLink>
          </li>
          <li>
            <NavLink to="/regles" className={({ isActive }) => isActive ? 'active' : ''}>
              5 Règles
            </NavLink>
          </li>
          {isAdmin && (
            <li>
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
                Admin
              </NavLink>
            </li>
          )}
        </ul>

        <div className="navbar-auth">
          {user ? (
            <div className="navbar-user">
              <button
                className="navbar-avatar-btn"
                onClick={() => setShowMenu(m => !m)}
              >
                <div className="navbar-avatar">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" />
                  ) : (
                    <span>{profile?.username?.[0]?.toUpperCase() ?? '?'}</span>
                  )}
                </div>
                <span className="navbar-username">{profile?.username ?? '...'}</span>
                <span className="navbar-chevron">{showMenu ? '▲' : '▼'}</span>
              </button>

              {showMenu && (
                <div className="navbar-dropdown" onClick={() => setShowMenu(false)}>
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
            <button className="btn btn-primary" onClick={() => setShowAuth(true)}>
              Se connecter
            </button>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
