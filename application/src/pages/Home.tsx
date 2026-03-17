import { Link } from 'react-router-dom'
import { ACTUS } from '../data/actus'
import { CLES } from '../data/cles'
import './Home.css'

const JEUX = [
  {
    to: '/jouer/quiz',
    label: 'Quiz',
    desc: '10 questions chrono sur la désinformation',
    niveau: 'Tous niveaux',
  },
  {
    to: '/jouer/fake-ou-reel',
    label: 'Fake ou réel ?',
    desc: "Image générée ou vraie photo ? À toi de juger.",
    niveau: 'Collège / Lycée',
  },
  {
    to: '/jouer/spot-the-zone',
    label: 'Spot the Zone',
    desc: "Repère les zones retouchées dans une image.",
    niveau: 'Lycée',
  },
]

export default function Home() {
  const une = ACTUS.filter(a => a.une)
  const autres = ACTUS.filter(a => !a.une)

  return (
    <div className="home-page">

      {/* ── HERO ─────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-tag">Portail pédagogique</div>
          <h1 className="home-hero-title">
            Comprends l'IA.<br />
            <span className="gradient-text">Ne te laisse plus avoir.</span>
          </h1>
          <p className="home-hero-sub">
            Cours, jeux et actus pour apprendre à détecter la désinformation —
            spécialement conçu pour les collégiens et lycéens.
          </p>
          <div className="home-hero-cta">
            <Link to="/comprendre" className="btn btn-primary home-btn-primary">Voir les cours</Link>
            <Link to="/jouer" className="btn btn-outline home-btn-outline">Jouer</Link>
          </div>
        </div>
        <div className="home-hero-stat">
          <div className="home-stat-block">
            <span className="home-stat-num">500M</span>
            <span className="home-stat-label">deepfakes créés en 2023</span>
          </div>
          <div className="home-stat-block">
            <span className="home-stat-num">76%</span>
            <span className="home-stat-label">des 15-24 ans ont partagé une fausse info</span>
          </div>
          <div className="home-stat-block">
            <span className="home-stat-num">3 min</span>
            <span className="home-stat-label">suffisent pour vérifier une source</span>
          </div>
        </div>
      </section>

      {/* ── ACTUS ────────────────────────────────── */}
      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Actus</h2>
          <span className="home-section-sub">IA & désinformation dans les médias</span>
        </div>

        {/* Cartes "à la une" — grandes, en haut */}
        <div className="home-actus-une">
          {une.map(actu => (
            <Link key={actu.id} to={actu.lien} className="home-actu-card home-actu-card--une">
              <div className="home-actu-top">
                <span className="home-actu-cat">{actu.categorie}</span>
                <span className="home-actu-une-badge">À la une</span>
              </div>
              <h3 className="home-actu-titre">{actu.titre}</h3>
              <p className="home-actu-resume">{actu.resume}</p>
              <div className="home-actu-footer">
                <span className="home-actu-source">{actu.source}</span>
                <span className="home-actu-date">{actu.date}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Autres actus — en dessous, tailles variées */}
        <div className="home-actus-autres">
          {autres.map((actu, i) => (
            <Link
              key={actu.id}
              to={actu.lien}
              className={`home-actu-card home-actu-card--other home-actu-card--s${(i % 3) + 1}`}
            >
              <div className="home-actu-top">
                <span className="home-actu-cat">{actu.categorie}</span>
              </div>
              <h3 className="home-actu-titre">{actu.titre}</h3>
              <p className="home-actu-resume">{actu.resume}</p>
              <div className="home-actu-footer">
                <span className="home-actu-source">{actu.source}</span>
                <span className="home-actu-date">{actu.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── COURS ────────────────────────────────── */}
      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Cours</h2>
          <Link to="/comprendre" className="home-section-link">Voir tout →</Link>
        </div>

        <div className="home-cours-grid">
          {CLES.map((cle, i) => (
            <Link key={cle.slug} to={`/comprendre/${cle.slug}`} className={`home-cours-card ${i === 0 ? 'home-cours-card--featured' : ''}`}>
              <div className="home-cours-top">
                <span className="home-cours-duree">{cle.duree}</span>
                <span className="home-cours-sections">{cle.sections.length} parties</span>
              </div>
              <h3 className="home-cours-titre">{cle.titre}</h3>
              <p className="home-cours-accroche">{cle.accroche}</p>
              <span className="home-cours-arrow">Lire →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── JEUX ─────────────────────────────────── */}
      <section className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Jeux</h2>
          <Link to="/jouer" className="home-section-link">Voir tout →</Link>
        </div>

        <div className="home-jeux-grid">
          {JEUX.map(jeu => (
            <Link key={jeu.to} to={jeu.to} className="home-jeu-card">
              <span className="home-jeu-niveau">{jeu.niveau}</span>
              <h3 className="home-jeu-label">{jeu.label}</h3>
              <p className="home-jeu-desc">{jeu.desc}</p>
              <span className="home-jeu-cta">Jouer →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA COMMUNAUTÉ ───────────────────────── */}
      <section className="home-community">
        <h2>Contribue à la communauté</h2>
        <p>Crée tes propres quiz et aide d'autres élèves à développer leur esprit critique.</p>
        <div className="home-community-btns">
          <Link to="/feed" className="btn btn-outline home-btn-outline">Voir le feed</Link>
          <Link to="/create" className="btn btn-primary home-btn-primary">Créer un quiz</Link>
        </div>
      </section>

    </div>
  )
}
