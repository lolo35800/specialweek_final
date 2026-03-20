import { useState, useRef } from 'react'
import './Detector.css'

interface Hotspot {
  x: number
  y: number
  size: number
  color: string
}

interface TextSegment {
  text: string
  probClass: 'danger' | 'warning' | 'safe'
}

export default function Detector() {
  const [mode, setMode] = useState<'image' | 'text'>('image')
  
  // Image states
  const [preview, setPreview] = useState<string | null>(null)
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  
  // Text states
  const [textInput, setTextInput] = useState('')
  const [textSegments, setTextSegments] = useState<TextSegment[]>([])

  // Shared states
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'result'>('idle')
  const [score, setScore] = useState<number>(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setPreview(URL.createObjectURL(selected))
      setStatus('idle')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0]
      setPreview(URL.createObjectURL(selected))
      setStatus('idle')
    }
  }

  const startAnalysis = () => {
    if (mode === 'image' && !preview) return
    if (mode === 'text' && !textInput.trim()) return
    setStatus('analyzing')
    
    // Simuler le temps de traitement de l'IA
    setTimeout(() => {
      if (mode === 'image') generateImageHeatmap()
      else generateTextAnalysis()
    }, 3000)
  }

  const generateImageHeatmap = () => {
    const fakeScore = Math.floor(Math.random() * 58) + 40
    setScore(fakeScore)

    const numHotspots = Math.floor(Math.random() * 4) + 2
    const generated: Hotspot[] = []

    for (let i = 0; i < numHotspots; i++) {
        const isVeryFake = Math.random() > 0.5
        const color = isVeryFake 
            ? 'rgba(248, 113, 113, 0.7)' // Rouge fort
            : 'rgba(251, 146, 60, 0.7)'  // Orange
            
        generated.push({
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            size: Math.random() * 40 + 20,
            color
        })
    }

    setHotspots(generated)
    setStatus('result')
  }

  const generateTextAnalysis = () => {
    const fakeScore = Math.floor(Math.random() * 58) + 40
    setScore(fakeScore)

    // Split par phrase ou par mot (si le texte est très court)
    const regex = /[^.!?]+[.!?]*\s*/g;
    const wordsRegex = /\S+\s*/g;
    const parts = textInput.match(regex) || []
    
    let segments: TextSegment[] = []
    
    if (parts.length < 3) {
      const words = textInput.match(wordsRegex) || [textInput]
      segments = words.map(w => {
         const r = Math.random()
         let probClass: 'safe'|'warning'|'danger' = 'safe'
         if (r > 0.85) probClass = 'danger'
         else if (r > 0.6) probClass = 'warning'
         return { text: w, probClass }
      })
    } else {
      segments = parts.map(s => {
         const r = Math.random()
         let probClass: 'safe'|'warning'|'danger' = 'safe'
         if (r > 0.75) probClass = 'danger'
         else if (r > 0.45) probClass = 'warning'
         return { text: s, probClass }
      })
    }

    setTextSegments(segments)
    setStatus('result')
  }

  const reset = () => {
    if (mode === 'image') {
      setPreview(null)
      setHotspots([])
    } else {
      setTextInput('')
      setTextSegments([])
    }
    setStatus('idle')
    setScore(0)
  }

  const switchMode = (newMode: 'image' | 'text') => {
    if (status !== 'idle') {
      if (!window.confirm("Voulez-vous vraiment changer de mode ? L'analyse en cours sera perdue.")) return
    }
    setMode(newMode)
    setStatus('idle')
    setScore(0)
  }

  return (
    <div className="detector-page">
      <div className="page-header">
        <span className="page-emoji">🔍</span>
        <h1>Détecteur IA</h1>
        <p className="page-subtitle">Analyse tes images ou textes avec notre algorithme pour détecter la désinformation</p>
      </div>

      <div className="detector-mode-toggle">
        <button 
          className={`toggle-btn ${mode === 'image' ? 'active' : ''}`}
          onClick={() => switchMode('image')}
        >
          🖼️ Image
        </button>
        <button 
          className={`toggle-btn ${mode === 'text' ? 'active' : ''}`}
          onClick={() => switchMode('text')}
        >
          📝 Texte
        </button>
      </div>

      <div className="detector-container">
        {mode === 'image' ? (
          /* ----- IMAGE MODE ----- */
          !preview ? (
            <div 
              className="upload-zone"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
              />
              <div className="upload-icon">📸</div>
              <h3>Uploadez une image</h3>
              <p>Glissez-déposez une image ici ou cliquez pour parcourir</p>
              <button className="btn-primary" style={{ marginTop: '1rem' }}>Sélectionner un fichier</button>
            </div>
          ) : (
            <div className="analysis-zone">
              <div className="image-wrapper">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="preview-image"
                />
                
                {status === 'analyzing' && <div className="scanner-line"></div>}

                {status === 'result' && (
                    <div className="heatmap-overlay">
                      {hotspots.map((spot, i) => (
                          <div 
                              key={i} 
                              className="hotspot" 
                              style={{
                                  left: `${spot.x}%`,
                                  top: `${spot.y}%`,
                                  width: `${spot.size}%`,
                                  height: `${spot.size}%`,
                                  background: `radial-gradient(circle, ${spot.color} 0%, rgba(0,0,0,0) 70%)`
                              }}
                          />
                      ))}
                    </div>
                )}
                
                {status === 'analyzing' && (
                  <div className="analyzing-overlay">
                    <div className="spinner"></div>
                    <p>Analyse Forensique en cours...</p>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          /* ----- TEXT MODE ----- */
          <div className="analysis-zone text-mode-zone">
            {status !== 'result' ? (
              <div className="text-input-wrapper">
                <textarea 
                  className="detector-textarea"
                  placeholder="Collez ou tapez le texte douteux à analyser ici..."
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  disabled={status === 'analyzing'}
                />
                {status === 'analyzing' && (
                  <div className="analyzing-overlay">
                    <div className="spinner"></div>
                    <p>Détection des motifs IA en cours...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-result-wrapper">
                <p className="text-analysis-segments">
                  {textSegments.map((seg, i) => (
                    <span key={i} className={`text-highlight text-highlight-${seg.probClass}`}>
                      {seg.text}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </div>
        )}

        {/* COMMON ACTIONS */}
        {status === 'idle' && (
          <div className="actions">
            <button 
              className="btn-secondary" 
              onClick={reset}
              disabled={(mode === 'image' && !preview) || (mode === 'text' && !textInput)}
            >
              Annuler
            </button>
            <button 
              className="btn-primary" 
              onClick={startAnalysis}
              disabled={(mode === 'image' && !preview) || (mode === 'text' && !textInput.trim())}
            >
              {mode === 'image' ? "Lancer l'analyse IA" : "Vérifier le texte"}
            </button>
          </div>
        )}

        {/* COMMON RESULT PANEL */}
        {status === 'result' && (
          <div className="result-panel">
            <div className="score-header">
              <h3>Résultat de l'analyse</h3>
              <div className={`score-badge ${score > 70 ? 'danger' : score > 40 ? 'warning' : 'safe'}`}>
                Probabilité IA : {score}%
              </div>
            </div>
            
            <div className="explanation-box">
              <h4>💡 Interprétation de la Heatmap</h4>
              <ul style={{ textAlign: 'left', marginTop: '10px', marginLeft: '20px' }}>
                <li><strong style={{color: '#f87171'}}>Rouge vif</strong> : {mode === 'image' ? "Probabilité extrêmement élevée d'artefacts (mains déformées, ombres incohérentes)." : "Vocabulaire typique IA (haute perplexité, burstiness anormale)."}</li>
                <li><strong style={{color: '#fb923c'}}>Orange</strong> : {mode === 'image' ? "Zones texturées suspectes (bruit de fond asymétrique)." : "Mots prévisibles, probable intervention d'un modèle de langage."}</li>
                <li><strong style={{color: '#4ade80'}}>Vert</strong> : {mode === 'image' ? "Régions naturelles sans anomalies détectées." : "Phrasing humain naturel, lexique varié."}</li>
              </ul>
              <p style={{ marginTop: '15px' }}>
                {score >= 70 ? (
                  mode === 'image' 
                    ? "Notre modèle indique que cette photo contient de très fortes anomalies génératives. Il s'agit très probablement d'une image créée par Intelligence Artificielle (Midjourney, DALL-E, etc)." 
                    : "Ce texte présente tous les signes d'un article généré par une IA de type ChatGPT ou Claude. Il manque de variations naturelles humaines."
                ) : score >= 40 ? (
                  mode === 'image' 
                    ? "L'image présente quelques irrégularités mineures. Elle a pu être retouchée lourdement ou générée partiellement." 
                    : "Le texte contient plusieurs tournures automatisées. Il a pu être réécrit ou assisté par l'IA."
                ) : (
                  mode === 'image'
                    ? "Aucune trace flagrante de génération par IA n'a été détectée. L'image est considérée comme naturelle."
                    : "Aucune signature algorithmique évidente détectée. Ce texte est considéré comme d'origine humaine."
                )}
              </p>
            </div>
            
            <button className="btn-primary" onClick={reset} style={{ marginTop: '20px', width: '100%' }}>
              Analyser {mode === 'image' ? 'une autre image' : 'un autre texte'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
