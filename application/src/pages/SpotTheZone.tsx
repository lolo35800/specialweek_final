import { useEffect, useRef, useState } from 'react'
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
    imageUrl: '/images/fake_portrait_1773748770531.png',
    title: 'Portrait — trouve les traces de l\'IA',
    hotspots: [
      {
        id: 1,
        cx: 68, cy: 72,
        radius: 12,
        label: 'Mains déformées',
        explanation: 'Les IA peinent à générer des mains correctes : doigts surnuméraires, flous ou fusionnés sont des indices classiques.',
      },
      {
        id: 2,
        cx: 45, cy: 52,
        radius: 11,
        label: 'Textures vestimentaires',
        explanation: 'Les tissus générés par IA présentent souvent des motifs incohérents, des coutures impossibles ou des reflets mal placés.',
      },
      {
        id: 3,
        cx: 80, cy: 35,
        radius: 10,
        label: 'Arrière-plan incohérent',
        explanation: 'Les IA fondent parfois les objets de l\'arrière-plan ensemble, créant des formes impossibles ou des textures répétitives.',
      },
    ],
  },
  {
    id: 2,
    imageUrl: '/images/fake_landscape_1773748800745.png',
    title: 'Paysage — repère les artefacts IA',
    hotspots: [
      {
        id: 1,
        cx: 50, cy: 18,
        radius: 14,
        label: 'Ciel artificiel',
        explanation: 'Le ciel dans les images IA manque souvent de nuages réalistes : trop uniformes, trop symétriques ou avec des gradients anormaux.',
      },
      {
        id: 2,
        cx: 30, cy: 55,
        radius: 12,
        label: 'Végétation répétitive',
        explanation: 'Les arbres et plantes générés par IA copient souvent le même motif en miroir ou ont des feuilles qui se ressemblent trop.',
      },
      {
        id: 3,
        cx: 72, cy: 65,
        radius: 11,
        label: 'Structure impossible',
        explanation: 'Les bâtiments ou reliefs peuvent avoir des perspectives incohérentes : lignes qui ne convergent pas, proportions impossibles.',
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
          <button className="stz-btn" onClick={handleRestart}>Rejouer</button>
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
