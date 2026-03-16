import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="page-notfound">
      <span className="notfound-emoji">🤔</span>
      <h1>404</h1>
      <p>Cette page n'existe pas… ou est-ce de la désinformation ?</p>
      <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
    </div>
  )
}
