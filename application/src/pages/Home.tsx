import { Link } from 'react-router-dom'
import { MasonryGrid } from '../components/masonry/MasonryGrid'
import './Home.css'

const CARDS = [
  {
    id: 'deepfake',
    to: '/jouer',
    tag: 'Jeu',
    title: 'Deepfake ou réel ?',
    body: 'Une image, une vidéo, un son — est-ce une création IA ou un vrai document ? Entraîne ton œil.',
    size: 'tall',
    accent: true,
  },
  {
    id: 'stats',
    to: '/comprendre/ia-generative-risques',
    tag: 'Chiffre',
    title: '500 millions de deepfakes',
    body: 'créés en 2023 à travers le monde. Un toutes les 5 minutes.',
    size: 'short',
    accent: false,
  },
  {
    id: 'biais',
    to: '/comprendre/biais-cognitifs',
    tag: 'Clé pédagogique',
    title: 'Pourquoi notre cerveau se fait piéger',
    body: "Les biais cognitifs exploités par la désinformation — et comment s'en protéger.",
    size: 'medium',
    accent: false,
  },
  {
    id: 'quiz',
    to: '/feed',
    tag: 'Quiz',
    title: 'Teste tes connaissances',
    body: "Des centaines de quiz créés par la communauté sur la désinformation, les médias et l'IA.",
    size: 'short',
    accent: false,
  },
  {
    id: 'regles',
    to: '/regles',
    tag: 'Méthode',
    title: 'Les 5 règles contre la désinformation',
    body: 'Pause. Source. Contexte. Recoupement. Slow news. Cinq habitudes qui changent tout.',
    size: 'medium',
    accent: false,
  },
  {
    id: 'reconnaitre',
    to: '/comprendre/reconnaitre-deepfakes',
    tag: 'Guide',
    title: 'Reconnaître un deepfake en 30 secondes',
    body: 'Yeux, contours, mains, lumière — les indices visuels à chercher en premier.',
    size: 'tall',
    accent: false,
  },
  {
    id: 'verifier',
    to: '/comprendre/verifier-sources',
    tag: 'Méthode',
    title: 'Vérifier une source en 3 minutes',
    body: 'La méthode SIFT expliquée simplement.',
    size: 'short',
    accent: false,
  },
  {
    id: 'create',
    to: '/create',
    tag: 'Contribuer',
    title: 'Crée ton propre quiz',
    body: "Partage tes connaissances avec la communauté. Chaque quiz créé aide quelqu'un à mieux s'informer.",
    size: 'medium',
    accent: true,
  },
]

export default function Home() {
  return (
    <div className="home-page">

      {/* === Intro de sensibilisation === */}
      <div className="home-intro">
        <div className="home-intro-tag">Sensibilisation à l'IA</div>
        <h1 className="home-intro-title">
          L'IA peut créer n'importe quoi.<br />
          <span className="gradient-text">Apprends à ne plus te faire avoir.</span>
        </h1>
        <p className="home-intro-body">
          Deepfakes, faux articles, citations inventées, images générées — les contenus fabriqués par l'IA inondent internet.
          VériIA te donne les outils pour les reconnaître, les décrypter et développer ton esprit critique.
        </p>
        <div className="home-intro-cta">
          <Link to="/comprendre" className="btn btn-primary">Commencer</Link>
          <Link to="/jouer" className="btn btn-outline">Jouer directement</Link>
        </div>
      </div>

      {/* === Grille masonry === */}
      <div className="home-grid-label">Explorer</div>
      <MasonryGrid columns={3}>
        {CARDS.map(card => (
          <Link
            key={card.id}
            to={card.to}
            className={`home-card home-card--${card.size} ${card.accent ? 'home-card--accent' : ''}`}
          >
            <span className="home-card-tag">{card.tag}</span>
            <h2 className="home-card-title">{card.title}</h2>
            <p className="home-card-body">{card.body}</p>
            <span className="home-card-arrow">→</span>
          </Link>
        ))}
      </MasonryGrid>

    </div>
  )
}
