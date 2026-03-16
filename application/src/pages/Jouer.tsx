import { Link } from 'react-router-dom'
import './Jouer.css'

const games = [
  {
    to: '/jouer/quiz',
    emoji: '❓',
    title: 'Quiz',
    description: '10 questions pour tester tes connaissances sur les fake news et l\'IA.',
    badge: 'Populaire',
  },
  {
    to: '/jouer/fake-ou-reel',
    emoji: '🕵️',
    title: 'Fake ou Réel ?',
    description: 'Image, post ou texte : est-ce réel ou généré par l\'IA ?',
    badge: null,
  },
  {
    to: '/jouer/spot-the-zone',
    emoji: '🔍',
    title: 'Trouve les incohérences',
    description: 'Clique sur les zones suspectes d\'une image pour révéler les indices.',
    badge: 'Nouveau',
  },
]

export default function Jouer() {
  return (
    <div className="page-jouer">
      <div className="page-header">
        <span className="page-emoji">🎮</span>
        <h1>Jouer</h1>
        <p className="page-subtitle">
          Teste tes réflexes face à la désinformation
        </p>
      </div>

      <div className="games-grid">
        {games.map((game) => (
          <Link key={game.to} to={game.to} className="game-card">
            {game.badge && <span className="game-badge">{game.badge}</span>}
            <span className="game-emoji">{game.emoji}</span>
            <h3 className="game-title">{game.title}</h3>
            <p className="game-description">{game.description}</p>
            <span className="game-cta">Jouer →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
