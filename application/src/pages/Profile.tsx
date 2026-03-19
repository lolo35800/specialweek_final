import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Profile as ProfileType, Post } from '../lib/supabase'
import { getProfileByUsername } from '../services/profileService'
import { getPostsByUser } from '../services/postService'
import { PostCard } from '../components/cards/PostCard'
import { MasonryGrid } from '../components/masonry/MasonryGrid'
import { BadgeGrid } from '../components/badges/BadgeGrid'
import { BadgeUnlockModal } from '../components/badges/BadgeUnlockModal'
import { unlockCommunityBadges, type Badge } from '../data/badges'
import { useAuth } from '../contexts/AuthContext'
import { submitRoleRequest, getUserRoleRequest, type UserRole } from '../services/adminService'
import './Profile.css'

const ROLE_OPTIONS: { value: UserRole; label: string; emoji: string }[] = [
  { value: 'etudiant', label: 'Étudiant', emoji: '🎒' },
  { value: 'expert_ia', label: 'Expert en IA', emoji: '🤖' },
  { value: 'professeur', label: 'Professeur', emoji: '📚' },
]

const ROLE_LABELS: Record<string, string> = {
  user: 'Utilisateur',
  admin: 'Admin',
  etudiant: 'Étudiant',
  expert_ia: 'Expert en IA',
  professeur: 'Professeur',
}

const ROLE_COLORS: Record<string, string> = {
  admin: '#f43f5e',
  etudiant: '#3b82f6',
  expert_ia: '#14b8a6',
  professeur: '#a855f7',
}

type PostWithProfile = Post & {
  profiles: { username: string; avatar_url: string | null }
}

export default function Profile() {
  const { username } = useParams<{ username: string }>()
  const { profile: currentUserProfile } = useAuth()
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [newBadges, setNewBadges] = useState<Badge[]>([])
  const [selectedRole, setSelectedRole] = useState<UserRole>('etudiant')
  const [roleRequestSent, setRoleRequestSent] = useState(false)
  const [pendingRequest, setPendingRequest] = useState<UserRole | null>(null)
  const [roleRequestLoading, setRoleRequestLoading] = useState(false)

  useEffect(() => {
    if (!username) return
    async function load() {
      try {
        const p = await getProfileByUsername(username!)
        if (!p) { setLoading(false); return }
        setProfile(p)
        const userPosts = await getPostsByUser(p.id)
        setPosts(userPosts as PostWithProfile[])

        // Check community badges for the current user's own profile
        if (currentUserProfile?.id === p.id) {
          const likes = userPosts.reduce((acc: number, post: Post) => acc + post.likes_count, 0)
          const plays = userPosts.reduce((acc: number, post: Post) => acc + post.plays_count, 0)
          const earned = unlockCommunityBadges(p.id, userPosts.length, likes, plays)
          if (earned.length > 0) setNewBadges(earned)

          // Check pending role request
          const req = await getUserRoleRequest(p.id)
          if (req) setPendingRequest(req.requested_role)
        }
      } catch (e) {
        console.error('Erreur chargement profil:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [username])

  if (loading) return <div className="profile-loading"><div className="feed-spinner" /></div>
  if (!profile) return (
    <div className="profile-notfound">
      <p>Profil introuvable.</p>
      <Link to="/" className="btn btn-outline">Retour</Link>
    </div>
  )

  const totalLikes = posts.reduce((acc, p) => acc + p.likes_count, 0)
  const totalPlays = posts.reduce((acc, p) => acc + p.plays_count, 0)
  const isOwnProfile = currentUserProfile?.id === profile.id
  const hasSpecialRole = profile.role !== 'user'

  async function handleRoleRequest() {
    if (!currentUserProfile) return
    setRoleRequestLoading(true)
    await submitRoleRequest(currentUserProfile.id, currentUserProfile.username, selectedRole)
    setPendingRequest(selectedRole)
    setRoleRequestSent(true)
    setRoleRequestLoading(false)
  }

  return (
    <div className="profile-page">
      <BadgeUnlockModal badges={newBadges} />
      <div className="profile-hero">
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
          {hasSpecialRole && (
            <span
              className="profile-role-badge"
              style={{ background: `${ROLE_COLORS[profile.role]}22`, color: ROLE_COLORS[profile.role], borderColor: `${ROLE_COLORS[profile.role]}55` }}
            >
              {profile.role === 'admin' ? '🛡️' : profile.role === 'etudiant' ? '🎒' : profile.role === 'expert_ia' ? '🤖' : '📚'}
              {' '}{ROLE_LABELS[profile.role]}
            </span>
          )}
        </div>
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">{posts.length}</span>
            <span className="profile-stat-label">posts</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{totalLikes}</span>
            <span className="profile-stat-label">likes reçus</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{totalPlays}</span>
            <span className="profile-stat-label">parties jouées</span>
          </div>
        </div>
      </div>

      {isOwnProfile && <BadgeGrid userId={profile.id} />}

      {/* Demande de rôle — uniquement sur son propre profil, si pas encore de rôle spécial */}
      {isOwnProfile && !hasSpecialRole && (
        <div className="profile-role-request">
          <h3>Obtenir un rôle</h3>
          <p>Demande un rôle pour enrichir ton profil et accéder à des fonctionnalités supplémentaires.</p>

          {pendingRequest ? (
            <div className="profile-role-pending">
              <span>⏳</span>
              <div>
                <strong>Demande en cours</strong>
                <p>Tu as demandé le rôle <em>{ROLE_LABELS[pendingRequest]}</em>. Un test te sera envoyé pour vérifier ton profil.</p>
              </div>
            </div>
          ) : roleRequestSent ? (
            <div className="profile-role-pending">
              <span>✅</span>
              <div>
                <strong>Demande envoyée !</strong>
                <p>Un test te sera envoyé pour vérifier que tu es vraiment {ROLE_LABELS[selectedRole].toLowerCase()}.</p>
              </div>
            </div>
          ) : (
            <div className="profile-role-form">
              <div className="profile-role-options">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`profile-role-option ${selectedRole === opt.value ? 'selected' : ''}`}
                    onClick={() => setSelectedRole(opt.value)}
                  >
                    <span className="profile-role-option-emoji">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
              <button
                className="btn btn-primary"
                onClick={handleRoleRequest}
                disabled={roleRequestLoading}
              >
                {roleRequestLoading ? 'Envoi...' : 'Envoyer la demande'}
              </button>
            </div>
          )}
        </div>
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
