import { Link } from 'react-router-dom'
import './Home.css'

const modules = [
  {
    to: '/comprendre',
    emoji: '🧠',
    title: 'Comprendre',
    description: "C'est quoi l'IA ? Pourquoi peut-elle inventer des infos ? Qu'est-ce qu'une fake news ?",
    color: 'module-blue',
  },
  {
    to: '/illustrer',
    emoji: '🖼️',
    title: 'Illustrer',
    description: 'Explore des exemples concrets : fausses images, faux posts, textes générés par IA.',
    color: 'module-purple',
  },
  {
    to: '/jouer',
    emoji: '🎮',
    title: 'Jouer',
    description: 'Mini-jeux interactifs : "Fake ou réel ?", "Trouve les incohérences", Quiz 10 questions.',
    color: 'module-orange',
  },
  {
    to: '/regles',
    emoji: '📋',
    title: '5 Règles anti-désinfo',
    description: 'Les règles d\'or pour ne plus jamais se faire avoir par une info douteuse.',
    color: 'module-green',
  },
]

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-badge">Projet Capgemini × SupDeVinci</div>
        <h1 className="hero-title">
          L'IA peut mentir.
          <br />
          <span className="hero-accent">Apprenons à la repérer.</span>
        </h1>
        <p className="hero-subtitle">
          Un portail interactif pour sensibiliser les jeunes à la désinformation générée par l'intelligence artificielle.
        </p>
        <div className="hero-cta">
          <Link to="/comprendre" className="btn btn-primary">
            Commencer l'aventure
          </Link>
          <Link to="/jouer" className="btn btn-secondary">
            Jouer directement
          </Link>
        </div>
      </section>

      <section className="modules-grid">
        <h2 className="section-title">4 modules pour tout comprendre</h2>
        <div className="grid">
          {modules.map((mod) => (
            <Link key={mod.to} to={mod.to} className={`module-card ${mod.color}`}>
              <span className="module-emoji">{mod.emoji}</span>
              <h3 className="module-title">{mod.title}</h3>
              <p className="module-description">{mod.description}</p>
              <span className="module-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
