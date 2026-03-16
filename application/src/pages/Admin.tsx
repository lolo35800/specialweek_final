import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Post } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getAllPostsAdmin, deletePost, flagPost } from '../services/postService'
import './Admin.css'

type PostWithProfile = Post & {
  profiles: { username: string; avatar_url: string | null }
}

export default function Admin() {
  const { isAdmin, loading } = useAuth()
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState<'all' | 'flagged'>('all')

  useEffect(() => {
    if (!isAdmin) return
    getAllPostsAdmin().then(data => {
      setPosts(data as PostWithProfile[])
      setFetching(false)
    })
  }, [isAdmin])

  async function handleDelete(postId: string) {
    if (!confirm('Supprimer ce post définitivement ?')) return
    await deletePost(postId)
    setPosts(ps => ps.filter(p => p.id !== postId))
  }

  async function handleFlag(post: PostWithProfile) {
    await flagPost(post.id, !post.is_flagged)
    setPosts(ps => ps.map(p => p.id === post.id ? { ...p, is_flagged: !p.is_flagged } : p))
  }

  if (loading) return <div className="admin-loading"><div className="feed-spinner" /></div>
  if (!isAdmin) return (
    <div className="admin-denied">
      <p>Accès refusé.</p>
      <Link to="/" className="btn btn-outline">Retour</Link>
    </div>
  )

  const displayed = filter === 'flagged' ? posts.filter(p => p.is_flagged) : posts

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Panel Admin</h1>
        <div className="admin-filters">
          <button
            className={`feed-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous ({posts.length})
          </button>
          <button
            className={`feed-filter-btn ${filter === 'flagged' ? 'active' : ''}`}
            onClick={() => setFilter('flagged')}
          >
            🚩 Signalés ({posts.filter(p => p.is_flagged).length})
          </button>
        </div>
      </div>

      {fetching ? (
        <div className="admin-loading"><div className="feed-spinner" /></div>
      ) : displayed.length === 0 ? (
        <p className="admin-empty">Aucun post.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Auteur</th>
                <th>Type</th>
                <th>Likes</th>
                <th>Parties</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(post => (
                <tr key={post.id} className={post.is_flagged ? 'flagged-row' : ''}>
                  <td>
                    <Link to={`/post/${post.id}`} className="admin-post-link">
                      {post.title}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/profile/${post.profiles?.username}`} className="admin-post-link">
                      {post.profiles?.username ?? '—'}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge ${post.type === 'quiz' ? 'badge-quiz' : 'badge-fake'}`}>
                      {post.type === 'quiz' ? 'Quiz' : 'Vrai/IA'}
                    </span>
                  </td>
                  <td>{post.likes_count}</td>
                  <td>{post.plays_count}</td>
                  <td>
                    {post.is_flagged
                      ? <span className="badge badge-admin">🚩 Signalé</span>
                      : <span className="admin-status-ok">✅ OK</span>
                    }
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className={`btn ${post.is_flagged ? 'btn-outline' : 'btn-ghost'}`}
                        onClick={() => handleFlag(post)}
                        title={post.is_flagged ? 'Retirer le signalement' : 'Signaler'}
                      >
                        {post.is_flagged ? 'Désignaler' : '🚩'}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(post.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
