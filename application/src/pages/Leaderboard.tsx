import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/supabase'
import './Leaderboard.css'

type RankingCategory = 'xp' | 'games_played' | 'posts_created'

const CATEGORY_LABELS: Record<RankingCategory, string> = {
  xp: 'Niveau (XP)',
  games_played: 'Participation',
  posts_created: 'Création'
}

const CATEGORY_ICONS: Record<RankingCategory, string> = {
  xp: '✨',
  games_played: '🎮',
  posts_created: '✍️'
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<RankingCategory>('xp')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      async function load() {
        setLoading(true)
        try {
          let query = supabase
            .from('profiles')
            .select('*')
            .order(activeCategory, { ascending: false })

          if (searchQuery.trim()) {
            query = query.ilike('username', `%${searchQuery.trim()}%`)
          }

          const { data, error } = await query.limit(50)

          if (error) throw error
          setProfiles(data || [])
        } catch (err) {
          console.error('Erreur chargement classement:', err)
        } finally {
          setLoading(false)
        }
      }
      load()
    }, 300)

    return () => clearTimeout(timer)
  }, [activeCategory, searchQuery])

  function getLevel(xp: number) {
    return Math.floor(Math.sqrt(xp / 100)) + 1
  }

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <span className="page-emoji">🏆</span>
        <h1>Classement Mondial</h1>
        <p className="page-subtitle">Les meilleurs esprits critiques de la communauté</p>
      </div>

      <div className="leaderboard-container">
        <div className="leaderboard-toolbar">
          <div className="leaderboard-tabs">
            {(Object.keys(CATEGORY_LABELS) as RankingCategory[]).map((id) => (
              <button
                key={id}
                className={`tab-btn ${activeCategory === id ? 'active' : ''}`}
                onClick={() => setActiveCategory(id)}
              >
                <span className="tab-icon">{CATEGORY_ICONS[id]}</span>
                {CATEGORY_LABELS[id]}
              </button>
            ))}
          </div>
          <div className="leaderboard-search">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Rechercher un pseudo..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="leaderboard-loading">
            <div className="spinner" />
            <p>Chargement des champions...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="leaderboard-empty">
            <span className="empty-icon">🏜️</span>
            <p>Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {profiles.map((profile, index) => (
              <div 
                key={profile.id} 
                className={`leaderboard-item rank-${index + 1} clickable`}
                onClick={() => navigate(`/profile/${profile.username}`)}
              >
                <div className="rank-badge">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                
                <div className="leaderboard-avatar">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" />
                  ) : (
                    <span>{profile.username[0].toUpperCase()}</span>
                  )}
                </div>

                <div className="user-info">
                  <span className="username">{profile.username}</span>
                  {activeCategory === 'xp' && (
                    <span className="level-tag">Niveau {getLevel(profile.xp || 0)}</span>
                  )}
                </div>

                <div className="score-info">
                  <div className="score-value">
                    <span className="points">
                      {activeCategory === 'xp' ? (profile.xp || 0) : 
                       activeCategory === 'games_played' ? (profile.games_played || 0) : 
                       (profile.posts_created || 0)}
                    </span>
                    <span className="total">
                      {activeCategory === 'xp' ? ' XP' : 
                       activeCategory === 'games_played' ? ' parties' : 
                       ' quizz'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="leaderboard-footer">
        <p>Gagne de l'XP en jouant aux quizz ou en créant tes propres défis pour la communauté !</p>
      </div>
    </div>
  )
}
