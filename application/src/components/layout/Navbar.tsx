import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

import { useTheme } from '../../contexts/ThemeContext'
import { AuthModal } from '../auth/AuthModal'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, profile, signOut, isAdmin } = useAuth()
  const { theme, toggle } = useTheme()
  const [showAuth, setShowAuth] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLFormElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchExpanded])

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button 
            className={`navbar-burger ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <NavLink to="/" className="navbar-brand" onClick={() => setIsMenuOpen(false)}>
            <span className="brand-text">Verif-IA</span>
          </NavLink>

          <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
            <NavLink to="/jouer" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Jouer</NavLink>
            <NavLink to="/leaderboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Classement</NavLink>
            <NavLink to="/feed" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Communauté</NavLink>
            <NavLink to="/comprendre" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Apprendre</NavLink>
          </div>

          <form 
            ref={searchRef}
            className={`navbar-search ${isSearchExpanded ? 'expanded' : ''}`} 
            onSubmit={(e) => {
              e.preventDefault()
              if (search.trim()) {
                navigate(`/feed?q=${encodeURIComponent(search.trim())}`)
                setSearch('')
                setIsSearchExpanded(false)
              }
            }}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button 
              type="button" 
              className="search-toggle-btn"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              aria-label="Rechercher"
            >
              🔍
            </button>
          </form>
        </div>

        <div className="navbar-right">
          <div className="navbar-auth">
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
                    {isAdmin && (
                      <Link to="/admin" className="navbar-dropdown-item">
                        Admin
                      </Link>
                    )}
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
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
