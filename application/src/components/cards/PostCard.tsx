import { Link } from 'react-router-dom'
import type { Post } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { likePost, unlikePost } from '../../services/likeService'
import { deletePost, flagPost } from '../../services/postService'
import { useState } from 'react'
import './PostCard.css'

interface Props {
  post: Post & { profiles?: { username: string; avatar_url: string | null } }
  likedByMe?: boolean
  onLikeToggle?: (postId: string, liked: boolean) => void
  onDelete?: (postId: string) => void
}

export function PostCard({ post, likedByMe = false, onLikeToggle, onDelete }: Props) {
  const { user, isAdmin } = useAuth()
  const [liked, setLiked] = useState(likedByMe)
  const [flagged, setFlagged] = useState(post.is_flagged)
  const [deleted, setDeleted] = useState(false)
  // Si likedByMe=true mais likes_count=0, le RPC DB n'a pas encore mis à jour → affiche au moins 1
  const [likesCount, setLikesCount] = useState(
    likedByMe && post.likes_count === 0 ? 1 : post.likes_count
  )
  const [loading, setLoading] = useState(false)

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault()
    if (!user || loading) return
    setLoading(true)
    if (liked) {
      await unlikePost(user.id, post.id)
      setLiked(false)
      setLikesCount(c => c - 1)
      onLikeToggle?.(post.id, false)
    } else {
      await likePost(user.id, post.id)
      setLiked(true)
      setLikesCount(c => c + 1)
      onLikeToggle?.(post.id, true)
    }
    setLoading(false)
  }

  async function handleAdminDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Supprimer ce post définitivement ?')) return
    await deletePost(post.id)
    setDeleted(true)
    onDelete?.(post.id)
  }

  async function handleAdminFlag(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await flagPost(post.id, !flagged)
    setFlagged(f => !f)
  }

  const isQuiz = post.type === 'quiz'
  const questionCount = isQuiz
    ? (post.content as { questions: unknown[] }).questions?.length ?? 0
    : 0

  if (deleted) return null

  return (
    <Link to={`/post/${post.id}`} className={`post-card ${flagged ? 'post-card-flagged' : ''}`}>
      {isAdmin && (
        <div className="post-card-admin-bar" onClick={e => e.preventDefault()}>
          <button
            className={`post-card-admin-btn ${flagged ? 'unflag' : 'flag'}`}
            onClick={handleAdminFlag}
            title={flagged ? 'Retirer le signalement' : 'Signaler'}
          >
            {flagged ? '🚩 Signalé' : '🚩 Signaler'}
          </button>
          <button
            className="post-card-admin-btn delete"
            onClick={handleAdminDelete}
            title="Supprimer"
          >
            🗑️ Supprimer
          </button>
        </div>
      )}

      {post.thumbnail_url && (
        <div className="post-card-image">
          <img src={post.thumbnail_url} alt={post.title} loading="lazy" />
          <div className="post-card-overlay" />
        </div>
      )}

      <div className="post-card-body">
        <div className="post-card-type-row">
          <span className={`badge ${isQuiz ? 'badge-quiz' : 'badge-fake'}`}>
            {isQuiz ? '🧠 Quiz' : '🕵️ Vrai ou IA'}
          </span>
          {isQuiz && questionCount > 0 && (
            <span className="post-card-meta">{questionCount} questions</span>
          )}
        </div>

        <h3 className="post-card-title">{post.title}</h3>

        {post.description && (
          <p className="post-card-desc">{post.description}</p>
        )}

        <div className="post-card-footer">
          <div className="post-card-author">
            <div className="post-card-avatar">
              {post.profiles?.avatar_url ? (
                <img src={post.profiles.avatar_url} alt="" />
              ) : (
                <span>{post.profiles?.username?.[0]?.toUpperCase() ?? '?'}</span>
              )}
            </div>
            <span className="post-card-username">{post.profiles?.username ?? 'Anonyme'}</span>
          </div>

          <div className="post-card-stats">
            <button
              className={`post-card-like ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={!user || loading}
              title={user ? (liked ? 'Retirer like' : 'Liker') : 'Connecte-toi pour liker'}
            >
              {liked ? '❤️' : '🤍'} {likesCount}
            </button>
            <span className="post-card-plays">▶ {post.plays_count}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
