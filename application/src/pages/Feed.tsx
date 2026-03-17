import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Post } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getPosts } from '../services/postService'
import { getLikedPostIds } from '../services/likeService'
import { MasonryGrid } from '../components/masonry/MasonryGrid'
import { PostCard } from '../components/cards/PostCard'
import './Feed.css'

type PostWithProfile = Post & {
  profiles: { username: string; avatar_url: string | null }
}

export default function Feed() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'quiz' | 'fake_or_real'>('all')
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [postsData, likedData] = await Promise.all([
          getPosts(),
          user ? getLikedPostIds(user.id) : Promise.resolve([]),
        ])
        setPosts(postsData as PostWithProfile[])
        setLikedIds(new Set(likedData))
      } catch (e) {
        console.error('Erreur chargement posts:', e)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  function handleLikeToggle(postId: string, liked: boolean) {
    setLikedIds(prev => {
      const next = new Set(prev)
      if (liked) next.add(postId)
      else next.delete(postId)
      return next
    })
  }

  const filtered = posts
    .filter(p => filter === 'all' || p.type === filter)
    .filter(p => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        p.profiles.username.toLowerCase().includes(q)
      )
    })

  return (
    <div className="feed-page">
      <div className="feed-hero">
        <h1>
          Teste ton <span className="gradient-text">esprit critique</span>
        </h1>
        <p className="feed-hero-sub">
          Des quiz et mini-jeux créés par la communauté pour apprendre à repérer la désinformation
        </p>
        {user && (
          <Link to="/create" className="btn btn-primary">
            + Créer un post
          </Link>
        )}
      </div>

      <div className="feed-search-wrap">
        <div className="feed-search">
          <svg className="feed-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="feed-search-input"
            type="text"
            placeholder="Rechercher un post, un auteur..."
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setSearchParams(e.target.value ? { q: e.target.value } : {}, { replace: true })
            }}
          />
          {search && (
            <button className="feed-search-clear" onClick={() => { setSearch(''); setSearchParams({}, { replace: true }) }}>✕</button>
          )}
        </div>
      </div>

      <div className="feed-filters">
        <button
          className={`feed-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tout
        </button>
        <button
          className={`feed-filter-btn ${filter === 'quiz' ? 'active' : ''}`}
          onClick={() => setFilter('quiz')}
        >
          Quiz
        </button>
        <button
          className={`feed-filter-btn ${filter === 'fake_or_real' ? 'active' : ''}`}
          onClick={() => setFilter('fake_or_real')}
        >
          Vrai ou IA
        </button>
      </div>

      {loading ? (
        <div className="feed-loading">
          <div className="feed-spinner" />
          <p>Chargement des posts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="feed-empty">
          <p>Aucun post pour l'instant.</p>
          {user ? (
            <Link to="/create" className="btn btn-primary">
              Sois le premier à en créer un !
            </Link>
          ) : (
            <p className="feed-empty-sub">Connecte-toi pour créer des posts.</p>
          )}
        </div>
      ) : (
        <MasonryGrid columns={3}>
          {filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              likedByMe={likedIds.has(post.id)}
              onLikeToggle={handleLikeToggle}
            />
          ))}
        </MasonryGrid>
      )}
    </div>
  )
}
