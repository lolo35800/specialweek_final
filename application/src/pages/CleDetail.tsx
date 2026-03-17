import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CLES } from '../data/cles'
import './CleDetail.css'

export default function CleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const cle = CLES.find(c => c.slug === slug)
  const [progress, setProgress] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const articleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleScroll() {
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight
      if (totalScrollable > 0) {
        setProgress(Math.min(100, (window.scrollY / totalScrollable) * 100))
      }

      // Détecter la section active
      const el = articleRef.current
      if (!el) return
      const sections = el.querySelectorAll('.cle-section')
      let active = 0
      sections.forEach((s, i) => {
        if (s.getBoundingClientRect().top < window.innerHeight * 0.4) active = i
      })
      setActiveSection(active)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!cle) {
    return (
      <div className="cle-not-found">
        <p>Clé introuvable.</p>
        <Link to="/comprendre" className="btn btn-primary">Retour</Link>
      </div>
    )
  }

  // Formatage markdown minimal (gras)
  function renderText(text: string) {
    const parts = text.split(/\*\*(.+?)\*\*/g)
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
    )
  }

  return (
    <>
      {/* Barre de progression fixe en haut */}
      <div className="read-progress-bar">
        <div className="read-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="cle-detail-page">
        {/* Header */}
        <div className="cle-detail-header">
          <Link to="/comprendre" className="cle-back-btn">
            ← Retour
          </Link>
          <span className="cle-detail-duree">{cle.duree} de lecture</span>
        </div>

        <div className="cle-detail-layout">
          {/* Sommaire latéral (desktop) */}
          <nav className="cle-sommaire">
            <p className="cle-sommaire-title">Sommaire</p>

            {/* Jauge verticale + % */}
            <div className="cle-sommaire-progress-wrap">
              <div className="cle-sommaire-track">
                <div
                  className="cle-sommaire-fill"
                  style={{ height: `${progress}%` }}
                />
                <div
                  className="cle-sommaire-pct"
                  style={{ top: `${progress}%` }}
                >
                  {Math.round(progress)}%
                </div>
              </div>

              <div className="cle-sommaire-items">
                {cle.sections.map((s, i) => (
                  <a
                    key={i}
                    href={`#section-${i}`}
                    className={`cle-sommaire-item ${activeSection === i ? 'active' : ''}`}
                  >
                    {s.titre}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          {/* Article */}
          <article className="cle-article" ref={articleRef}>
            <h1 className="cle-article-title">{cle.titre}</h1>
            <p className="cle-article-accroche">{cle.accroche}</p>

            {cle.sections.map((section, i) => (
              <div key={i} id={`section-${i}`} className="cle-section">
                <h2 className="cle-section-titre">{section.titre}</h2>
                <div className="cle-section-contenu">
                  {section.contenu.split('\n\n').map((para, j) => (
                    <p key={j}>{renderText(para)}</p>
                  ))}
                </div>
              </div>
            ))}

            <div className="cle-article-footer">
              <Link to="/comprendre" className="btn btn-outline">
                ← Toutes les clés
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
