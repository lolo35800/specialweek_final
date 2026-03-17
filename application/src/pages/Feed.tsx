import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'quiz' | 'fake_or_real'>('all')

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

  const filtered = filter === 'all' ? posts : posts.filter(p => p.type === filter)

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
          🧠 Quiz
        </button>
        <button
          className={`feed-filter-btn ${filter === 'fake_or_real' ? 'active' : ''}`}
          onClick={() => setFilter('fake_or_real')}
        >
          🕵️ Vrai ou IA
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
