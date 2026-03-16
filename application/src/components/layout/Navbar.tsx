import { NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
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
          <NavLink to="/illustrer" className={({ isActive }) => isActive ? 'active' : ''}>
            Illustrer
          </NavLink>
        </li>
        <li>
          <NavLink to="/jouer" className={({ isActive }) => isActive ? 'active' : ''}>
            Jouer
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/regles" className={({ isActive }) => isActive ? 'active' : ''}>
            5 Règles
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
