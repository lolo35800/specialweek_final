import { useMemo, useState } from 'react'
import './Quiz.css'

const hotspots = [
  { id: 1, top: '15%', left: '25%', width: '18%', height: '12%', label: 'Visage flou' },
  { id: 2, top: '45%', left: '58%', width: '12%', height: '10%', label: 'Ombre incohérente' },
  { id: 3, top: '70%', left: '30%', width: '20%', height: '10%', label: 'Texte déformé' },
]

const correctIds = [1, 2]

export default function SpotTheZone() {
  const [found, setFound] = useState<number[]>([])

  const hitCount = useMemo(() => found.filter((id) => correctIds.includes(id)).length, [found])
  const isFinished = hitCount >= correctIds.length

  function tap(id: number) {
    setFound((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  return (
    <div className="page-quiz">
      <div className="page-header">
        <span className="page-emoji">🔍</span>
        <h1>Trouve les incohérences</h1>
        <p className="page-subtitle">Clique sur les zones suspectes</p>
      </div>

      <div className="spot-container">
        <div className="spot-image" aria-label="Image factice à analyser">
          {hotspots.map((hotspot) => {
            const clicked = found.includes(hotspot.id)
            return (
              <button
                key={hotspot.id}
                type="button"
                aria-label={hotspot.label}
                className={`spot-box ${clicked ? 'found' : ''}`}
                style={{ top: hotspot.top, left: hotspot.left, width: hotspot.width, height: hotspot.height }}
                onClick={() => tap(hotspot.id)}
              ></button>
            )
          })}
        </div>
        <div className="spot-instructions">
          <p>{hitCount}/{correctIds.length} incohérences trouvées</p>
          <p>{isFinished ? 'Bravo ! Tu as repéré les principales incohérences.' : 'Cherche les éléments visuellement impossibles.'}</p>
          {isFinished && (
            <button className="btn-primary" onClick={() => setFound([])}>Recommencer</button>
          )}
        </div>
      </div>

      <div className="quiz-results">
        <h3>Rétroaction pédagogique</h3>
        <ul>
          <li>Visages déformés, proportions incohérentes = signe d’images générées par IA.</li>
          <li>Ombres non alignées ou lumières mixées indiquent composition maladroite.</li>
          <li>Texte flou/oublié est un classique pour tromper rapidement.</li>
        </ul>
      </div>
    </div>
  )
}
