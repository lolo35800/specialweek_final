import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Profile as ProfileType, Post } from '../lib/supabase'
import { getProfileByUsername, updateProfile } from '../services/profileService'
import { getPostsByUser } from '../services/postService'
import { PostCard } from '../components/cards/PostCard'
import { MasonryGrid } from '../components/masonry/MasonryGrid'
import { BadgeGrid } from '../components/badges/BadgeGrid'
import { BadgeUnlockModal } from '../components/badges/BadgeUnlockModal'
import { unlockCommunityBadges, type Badge } from '../data/badges'
import { useAuth } from '../contexts/AuthContext'
import './Profile.css'

type PostWithProfile = Post & {
  profiles: { username: string; avatar_url: string | null }
}

export default function Profile() {
  const { username } = useParams<{ username: string }>()
  const { profile: currentUserProfile, refreshProfile } = useAuth()
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [newBadges, setNewBadges] = useState<Badge[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const load = async () => {
    if (!username) return
    try {
      const p = await getProfileByUsername(username!)
      if (!p) { setLoading(false); return }
      setProfile(p)
      const userPosts = await getPostsByUser(p.id)
      setPosts(userPosts as PostWithProfile[])

      if (currentUserProfile?.id === p.id) {
        const likes = userPosts.reduce((acc: number, post: Post) => acc + post.likes_count, 0)
        const plays = userPosts.reduce((acc: number, post: Post) => acc + post.plays_count, 0)
        const earned = unlockCommunityBadges(p.id, userPosts.length, likes, plays)
        if (earned.length > 0) setNewBadges(earned)
      }
    } catch (e) {
      console.error('Erreur chargement profil:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [username, currentUserProfile?.id])

  if (loading) return <div className="profile-loading"><div className="feed-spinner" /></div>
  if (!profile) return (
    <div className="profile-notfound">
      <p>Profil introuvable.</p>
      <Link to="/" className="btn btn-outline">Retour</Link>
    </div>
  )

  const totalPlays = posts.reduce((acc, p) => acc + p.plays_count, 0)

  return (
    <div className="profile-page">
      <BadgeUnlockModal badges={newBadges} />
      
      {isEditModalOpen && (
        <EditProfileModal 
          profile={profile} 
          onClose={() => setIsEditModalOpen(false)} 
          onSuccess={() => {
            setIsEditModalOpen(false)
            refreshProfile()
            load()
          }}
        />
      )}

      <div className="profile-header-container">
        <div className="profile-banner">
          {profile.banner_url ? (
            <img src={profile.banner_url} alt="Banner" />
          ) : (
            <div className="profile-banner-placeholder" />
          )}
          <div className="profile-banner-overlay" />
        </div>

        <div className="profile-hero">
          {currentUserProfile?.id === profile.id && (
            <button 
              className="btn btn-outline profile-edit-btn" 
              onClick={() => setIsEditModalOpen(true)}
            >
              Modifier le profil
            </button>
          )}

          <div className="profile-avatar-lg">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" />
              : <span>{profile.username[0].toUpperCase()}</span>
            }
          </div>
          <div className="profile-info">
            <h1>{profile.username}</h1>
            <div className="profile-level">
              <span className="level-badge">Niveau {Math.floor(Math.sqrt((profile.xp || 0) / 100)) + 1}</span>
              <div className="xp-bar-container">
                <div 
                  className="xp-bar-fill" 
                  style={{ width: `${((profile.xp || 0) % 100)}%` }} 
                />
                <span className="xp-text">{profile.xp || 0} XP</span>
              </div>
            </div>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            {profile.role === 'admin' && <span className="badge badge-admin">Admin</span>}
          </div>
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">{posts.length}</span>
              <span className="profile-stat-label">Défis créés</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{profile.games_played || 0}</span>
              <span className="profile-stat-label">Participations</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{totalPlays}</span>
              <span className="profile-stat-label">Vues reçues</span>
            </div>
          </div>
        </div>
      </div>

      {currentUserProfile?.id === profile.id && (
        <BadgeGrid userId={profile.id} />
      )}

      <div className="profile-posts">
        <h2>Posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="profile-empty">Aucun post publié pour l'instant.</p>
        ) : (
          <MasonryGrid columns={3}>
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </MasonryGrid>
        )}
      </div>
    </div>
  )
}

function EditProfileModal({ profile, onClose, onSuccess }: { profile: ProfileType, onClose: () => void, onSuccess: () => void }) {
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await updateProfile(profile.id, {
        username,
        bio,
        avatar_url: avatarUrl,
        banner_url: bannerUrl
      })

      if (error) throw new Error(error)
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-edit-overlay" onClick={onClose}>
      <div className="profile-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Modifier le profil</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pseudo</label>
            <input 
              className="input" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Pseudo"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Bio</label>
            <textarea 
              className="input" 
              value={bio} 
              onChange={e => setBio(e.target.value)} 
              placeholder="Raconte-nous quelque chose sur toi..."
            />
          </div>

          <div className="form-group">
            <label>URL de l'avatar</label>
            <input 
              className="input" 
              value={avatarUrl} 
              onChange={e => setAvatarUrl(e.target.value)} 
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>URL de la bannière</label>
            <input 
              className="input" 
              value={bannerUrl} 
              onChange={e => setBannerUrl(e.target.value)} 
              placeholder="https://..."
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
