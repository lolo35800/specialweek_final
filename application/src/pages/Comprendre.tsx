import { Link } from 'react-router-dom'
import { CLES } from '../data/cles'
import './Comprendre.css'

export default function Comprendre() {
  return (
    <div className="page-comprendre">
      <div className="comprendre-header">
        <h1>Clés pédagogiques</h1>
        <p className="comprendre-subtitle">
          Apprends à reconnaître la désinformation et les contenus générés par l'IA
        </p>
      </div>

      <div className="cles-grid">
        {CLES.map(cle => (
          <Link key={cle.slug} to={`/comprendre/${cle.slug}`} className="cle-card">
            <div className="cle-card-top">
              <span className="cle-card-duree">{cle.duree}</span>
              <span className="cle-card-count">{cle.sections.length} sections</span>
            </div>
            <h2 className="cle-card-titre">{cle.titre}</h2>
            <p className="cle-card-accroche">{cle.accroche}</p>
            <span className="cle-card-link">Lire →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
