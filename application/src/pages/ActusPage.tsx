import { useState, useEffect } from 'react'
import './ActusPage.css'
import type { Actu } from '../data/actus'
import { BASE_URL } from '../services/api'

export default function ActusPage() {
  const [actus, setActus] = useState<Actu[]>([])
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingSummary, setLoadingSummary] = useState(true)
  
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Toutes')
  const [sortOrder, setSortOrder] = useState('recent')

  useEffect(() => {
    // 1. Fetch search data
    fetch(`${BASE_URL}/actus`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setActus(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Could not fetch actus:", err)
        setLoading(false)
      })

    // 2. Fetch AI summary
    fetch(`${BASE_URL}/actus-summary`)
      .then(res => res.json())
      .then(data => {
        if (data.summary) setAiSummary(data.summary)
        setLoadingSummary(false)
      })
      .catch(err => {
        console.error("Could not fetch AI summary:", err)
        setLoadingSummary(false)
      })
  }, [])

  // Derive categories dynamically from fetched data
  const availableCategories = ['Toutes', ...Array.from(new Set(actus.map(a => a.categorie)))].sort()

  const filteredActus = actus.filter(a => {
    // 1. Search text
    const textToSearch = `${a.titre} ${a.resume}`.toLowerCase()
    const matchesSearch = textToSearch.includes(search.toLowerCase())
    
    // 2. Category
    const matchesCategory = categoryFilter === 'Toutes' || a.categorie === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  // 3. Sort
  const sortedActus = [...filteredActus].sort((a, b) => {
    const tsA = Number(a.timestamp) || 0
    const tsB = Number(b.timestamp) || 0
    
    if (sortOrder === 'recent') {
      return tsB - tsA
    } else {
      return tsA - tsB
    }
  })

  return (
    <div className="actus-page">
      <header className="actus-header">
        <h1 className="actus-title">Toute l'actualité IA</h1>
        <p className="actus-sub">Suivez les dernières informations sur l'intelligence artificielle et la désinformation.</p>
        
        {/* Résumé IA */}
        {(loadingSummary || aiSummary) && (
          <div className="actus-ai-summary-box">
            <div className="actus-ai-summary-header">
              <span className="actus-ai-summary-icon">✨</span>
              <span className="actus-ai-summary-label">Flash Actu IA</span>
            </div>
            {loadingSummary ? (
              <div className="actus-ai-summary-loading">
                <div className="actus-ai-summary-skeleton"></div>
              </div>
            ) : (
              <p className="actus-ai-summary-text">{aiSummary}</p>
            )}
          </div>
        )}
      </header>
      
      <section className="actus-filters-section">
        <div className="actus-filters-container">
          <input 
            type="text" 
            placeholder="Rechercher un article..." 
            className="actus-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          
          <div className="actus-filters-controls">
            <select 
              className="actus-select"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select 
              className="actus-select"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
            >
              <option value="recent">Plus récents</option>
              <option value="oldest">Plus anciens</option>
            </select>
          </div>
        </div>
      </section>

      <section className="actus-content-section">
        {loading ? (
          <div className="actus-loading">Chargement des actualités...</div>
        ) : sortedActus.length === 0 ? (
          <div className="actus-empty">Aucun article ne correspond à votre recherche.</div>
        ) : (
          <div className="actus-grid">
            {sortedActus.map(actu => (
              <a key={actu.id} href={actu.lien} target="_blank" rel="noopener noreferrer" className="actus-card">
                <div className="actus-card-top">
                  <span className="actus-card-cat">{actu.categorie}</span>
                </div>
                <h3 className="actus-card-titre">{actu.titre}</h3>
                <p className="actus-card-resume">{actu.resume}</p>
                <div className="actus-card-footer">
                  <span className="actus-card-source">{actu.source}</span>
                  <span className="actus-card-date">{actu.date}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
