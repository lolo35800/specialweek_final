import { useMemo, useState } from 'react'
import './Quiz.css'

interface Item {
  id: number
  label: string
  isReal: boolean
  explanation: string
}

const items: Item[] = [
  { id: 1, label: 'Une capture d’écran Instagram annonçant un vaccin miracle derrière un paywall.', isReal: false, explanation: 'Les vaccins ne sont pas vendus secrètement sur des stories ; méfie-toi des titres sensationnalistes.' },
  { id: 2, label: 'Un tweet d’un compte certifié du ministère de la Santé annonçant une alerte canicule.', isReal: true, explanation: 'Sources officielles certifiées sont fiables. Vérifie la présente.' },
  { id: 3, label: 'Une image avec un ciel vert intense et des visages flous partagée comme photo d’ovni.', isReal: false, explanation: 'Les anomalies visuelles et la saturation extrême indiquent souvent une génération IA.' },
  { id: 4, label: 'Une information partagée par plusieurs médias reconnus sur un accord international.', isReal: true, explanation: 'La concordance dans plusieurs médias sérieux est un bon signe.' },
]

export default function FakeOrReal() {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [answers, setAnswers] = useState<{ id: number; ok: boolean; choice: boolean }[]>([])

  const item = items[index]
  const score = useMemo(() => answers.filter((a) => a.ok).length, [answers])

  if (index >= items.length) {
    return (
      <div className="page-quiz">
        <div className="page-header">
          <span className="page-emoji">🕵️</span>
          <h1>Fake ou Réel ?</h1>
          <p className="page-subtitle">Score {score}/{items.length}</p>
        </div>
        <div className="quiz-results">
          {answers.map((a, i) => {
            const it = items[i]
            return (
              <div key={it.id} className="quiz-result-item">
                <p><strong>{it.label}</strong></p>
                <p>Ta réponse : {a.choice ? 'Réel' : 'Faux'} - <strong>{a.ok ? 'Correct' : 'Incorrect'}</strong></p>
                <p>Explication : {it.explanation}</p>
              </div>
            )
          })}
          <button className="btn-primary" onClick={() => {
            setIndex(0); setChosen(null); setAnswers([])
          }}>Rejouer</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-quiz">
      <div className="page-header">
        <span className="page-emoji">🕵️</span>
        <h1>Fake ou Réel ?</h1>
        <p className="page-subtitle">Détecte la désinformation</p>
      </div>

      <div className="quiz-card">
        <h2>{item.label}</h2>

        <div className="quiz-options">
          <button
            className={`quiz-option ${chosen === 1 ? 'selected' : ''}`}
            onClick={() => setChosen(1)}
          >Réel</button>
          <button
            className={`quiz-option ${chosen === 0 ? 'selected' : ''}`}
            onClick={() => setChosen(0)}
          >Faux</button>
        </div>

        <button
          className="btn-primary"
          disabled={chosen === null}
          onClick={() => {
            const guessed = Boolean(chosen)
            const ok = guessed === item.isReal
            setAnswers((prev) => [...prev, { id: item.id, ok, choice: guessed }])
            setIndex((prev) => prev + 1)
            setChosen(null)
          }}
        >Valider</button>

        {chosen !== null && (
          <p className="question-hint">Explication : {item.explanation}</p>
        )}
      </div>
    </div>
  )
}
