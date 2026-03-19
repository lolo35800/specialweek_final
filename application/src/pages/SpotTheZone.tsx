import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './SpotTheZone.css'
import { useAuth } from '../contexts/AuthContext'
import { unlockSpotBadges, type Badge } from '../data/badges'
import { BadgeUnlockModal } from '../components/badges/BadgeUnlockModal'
import { submitScore } from '../services/scoreService'

type Hotspot = {
  id: number
  cx: number   // % from left
  cy: number   // % from top
  radius: number  // % of image width
  label: string
  explanation: string
}

type Scene = {
  id: number
  imageUrl: string
  title: string
  hotspots: Hotspot[]
}

const scenes: Scene[] = [
  {
    id: 1,
    imageUrl: '/images/spot_car_gt3.jpg',
    title: 'Intérieur de voiture — quelque chose cloche',
    hotspots: [
      {
        id: 1,
        cx: 74, cy: 44,
        radius: 18,
        label: 'Compteurs flous',
        explanation: 'Les compteurs et instruments de bord sont anormalement flous alors que le reste du tableau de bord est net. Une IA a du mal à générer des cadrans lisibles avec des chiffres cohérents — elle les noie souvent dans le flou pour masquer les incohérences.',
      },
      {
        id: 2,
        cx: 88, cy: 60,
        radius: 10,
        label: 'Carte de navigation incohérente',
        explanation: 'La carte GPS indique la mer à droite de la route, alors qu\'on la voit clairement à gauche par le pare-brise. L\'IA a généré une navigation qui contredit la réalité visible dans l\'image — un détail de cohérence spatiale qu\'elle ne vérifie pas.',
      },
    ],
  },
  {
    id: 2,
    imageUrl: '/images/spot_gaming.jpg',
    title: 'Setup gaming — repère les 2 incohérences',
    hotspots: [
      {
        id: 1,
        cx: 67, cy: 73,
        radius: 14,
        label: 'Manette éteinte',
        explanation: 'La manette PS5 (DualSense) est tenue en main mais la barre lumineuse est éteinte. Une manette active pendant une session de jeu est toujours allumée — signe que l\'IA n\'a pas pensé à ce détail.',
      },
      {
        id: 2,
        cx: 25, cy: 40,
        radius: 20,
        label: 'Écran sans gameplay',
        explanation: 'L\'écran affiche une illustration marketing de Horizon Zero Dawn, pas un vrai gameplay. Une personne qui joue aurait un HUD, des menus ou une scène en cours — pas une jaquette promotionnelle statique.',
      },
    ],
  },
]

type ClickMark = {
  x: number
  y: number
  hit: boolean
  hotspotId?: number
}

export default function SpotTheZone() {
  const { profile } = useAuth()
  const [sceneIndex, setSceneIndex] = useState(0)
  const [found, setFound] = useState<number[]>([])
  const [marks, setMarks] = useState<ClickMark[]>([])
  const [newBadges, setNewBadges] = useState<Badge[]>([])
  const [scoreSent, setScoreSent] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [totalFound, setTotalFound] = useState(0)
  const imgRef = useRef<HTMLDivElement>(null)

  const scene = scenes[sceneIndex]
  const totalHotspots = scenes.reduce((acc, s) => acc + s.hotspots.length, 0)
  const allFound = found.length === scene.hotspots.length

  useEffect(() => {
    if (allFound && profile?.id) {
      const earned = unlockSpotBadges(profile.id)
      if (earned.length > 0) setNewBadges(earned)
    }
  }, [allFound, profile?.id])

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    const yPct = ((e.clientY - rect.top) / rect.height) * 100

    // Check if click hits any unfound hotspot
    let hitHotspot: Hotspot | null = null
    for (const hs of scene.hotspots) {
      if (found.includes(hs.id)) continue
      const dx = xPct - hs.cx
      const dy = yPct - hs.cy
      // Adjust for aspect ratio (height ~= 1.33x width for portraits)
      const dist = Math.sqrt(dx * dx + (dy * dy) * 0.56)
      if (dist <= hs.radius) {
        hitHotspot = hs
        break
      }
    }

    const mark: ClickMark = {
      x: xPct,
      y: yPct,
      hit: !!hitHotspot,
      hotspotId: hitHotspot?.id,
    }
    setMarks((prev) => [...prev, mark])

    if (hitHotspot) {
      setFound((prev) => [...prev, hitHotspot!.id])
    }
  }

  function handleNextScene() {
    setTotalFound((n) => n + found.length)
    if (sceneIndex + 1 >= scenes.length) {
      handleFinish(found.length)
    } else {
      setSceneIndex((i) => i + 1)
      setFound([])
      setMarks([])
    }
  }

  async function handleFinish(lastFound: number) {
    const finalFound = totalFound + lastFound
    setShowResult(true)
    if (!scoreSent && profile?.username) {
      setScoreSent(true)
      try {
        await submitScore({
          module: 'spot_zone',
          username: profile.username,
          score: finalFound,
          total: totalHotspots,
        })
      } catch (e) {
        console.warn('Score non enregistré', e)
      }
    }
  }

  function handleRestart() {
    setSceneIndex(0)
    setFound([])
    setMarks([])
    setTotalFound(0)
    setShowResult(false)
    setScoreSent(false)
    setNewBadges([])
  }

  if (showResult) {
    const finalFound = totalFound
    return (
      <div className="stz-page">
        <BadgeUnlockModal badges={newBadges} />
        <div className="page-header">
          <span className="page-emoji">🎯</span>
          <h1>Résultats</h1>
          <p className="page-subtitle">Voici ce que tu as repéré</p>
        </div>
        <div className="stz-result-card">
          <div className="stz-final-score">
            <span className="stz-score-num">{finalFound}</span>
            <span className="stz-score-max">/ {totalHotspots} zones trouvées</span>
          </div>
          <p className="stz-score-label">
            {finalFound >= totalHotspots
              ? '🏆 Parfait ! Tu as l\'œil d\'un expert en détection IA.'
              : finalFound >= totalHotspots * 0.6
              ? '👍 Bien joué ! Quelques artefacts t\'ont échappé.'
              : '📚 Continue à t\'entraîner — repérer l\'IA ça s\'apprend !'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="stz-btn" onClick={handleRestart}>Rejouer</button>
            <Link to="/jouer" className="btn btn-outline">Retour aux jeux</Link>
          </div>
        </div>
        <div className="stz-tips">
          <h3>Les indices à toujours chercher</h3>
          <ul>
            <li><strong>Les mains</strong> — doigts difformes, surnuméraires ou flous</li>
            <li><strong>Les textes</strong> — lettres illisibles, caractères inventés</li>
            <li><strong>Les yeux</strong> — pupilles asymétriques, reflets incohérents</li>
            <li><strong>Les arrière-plans</strong> — objets fusionnés, perspectives impossibles</li>
            <li><strong>Les cheveux</strong> — mèches qui disparaissent dans le vide</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="stz-page">
      <BadgeUnlockModal badges={newBadges} />
      <div className="page-header">
        <span className="page-emoji">🔍</span>
        <h1>Spot the Zone</h1>
        <p className="page-subtitle">Clique sur les zones qui trahissent l'IA</p>
      </div>

      <div className="stz-progress">
        {scenes.map((s, i) => (
          <div
            key={s.id}
            className={`stz-dot ${i < sceneIndex ? 'done' : i === sceneIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      <div className="stz-card">
        <h2 className="stz-scene-title">{scene.title}</h2>

        <div className="stz-score-bar">
          <span>{found.length}/{scene.hotspots.length} zone{scene.hotspots.length > 1 ? 's' : ''} trouvée{scene.hotspots.length > 1 ? 's' : ''}</span>
          <div className="stz-bar-track">
            <div className="stz-bar-fill" style={{ width: `${(found.length / scene.hotspots.length) * 100}%` }} />
          </div>
        </div>

        {/* Image with click detection */}
        <div
          ref={imgRef}
          className="stz-image-wrap"
          onClick={handleImageClick}
          role="button"
          aria-label="Image à analyser — clique sur les zones suspectes"
        >
          <img
            src={scene.imageUrl}
            alt="Image générée par IA"
            className="stz-image"
            draggable={false}
          />

          {/* Markers for clicks */}
          {marks.map((m, i) => (
            <div
              key={i}
              className={`stz-mark ${m.hit ? 'stz-mark-hit' : 'stz-mark-miss'}`}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            />
          ))}

          {/* Revealed hotspot zones */}
          {scene.hotspots.map((hs) =>
            found.includes(hs.id) ? (
              <div
                key={hs.id}
                className="stz-hotspot-reveal"
                style={{
                  left: `${hs.cx}%`,
                  top: `${hs.cy}%`,
                  width: `${hs.radius * 2}%`,
                  height: `${hs.radius * 2}%`,
                }}
              >
                <span className="stz-hotspot-label">{hs.label}</span>
              </div>
            ) : null
          )}
        </div>

        <p className="stz-hint">💡 Clique directement sur l'image pour marquer une zone suspecte</p>

        {allFound && (
          <button className="stz-btn" onClick={handleNextScene}>
            {sceneIndex + 1 >= scenes.length ? 'Voir mes résultats' : 'Image suivante →'}
          </button>
        )}
      </div>

      {/* Explanations for found hotspots */}
      {found.length > 0 && (
        <div className="stz-explanations">
          <h3>Zones repérées</h3>
          {scene.hotspots
            .filter((hs) => found.includes(hs.id))
            .map((hs) => (
              <div key={hs.id} className="stz-explanation-item">
                <strong>🔍 {hs.label}</strong>
                <p>{hs.explanation}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
