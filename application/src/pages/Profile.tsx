import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Profile as ProfileType, Post, Challenge } from '../lib/supabase'
import { getProfileByUsername, updateProfile } from '../services/profileService'
import { getPostsByUser } from '../services/postService'
import { getChallengesByCreator } from '../services/challengeService'
import { uploadImage } from '../services/storageService'
import { PostCard } from '../components/cards/PostCard'
import { MasonryGrid } from '../components/masonry/MasonryGrid'
import { BadgeGrid } from '../components/badges/BadgeGrid'
import { BadgeUnlockModal } from '../components/badges/BadgeUnlockModal'
import { CreateChallengeModal } from '../components/challenge/CreateChallengeModal'
import { JoinChallengeInput } from '../components/challenge/JoinChallengeInput'
import { ChallengeCard } from '../components/challenge/ChallengeCard'
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
  const { profile: currentUserProfile, refreshProfile } = useAuth()
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [newBadges, setNewBadges] = useState<Badge[]>([])
  const [selectedRole, setSelectedRole] = useState<UserRole>('etudiant')
  const [roleMessage, setRoleMessage] = useState('')
  const [roleRequestSent, setRoleRequestSent] = useState(false)
  const [pendingRequest, setPendingRequest] = useState<UserRole | null>(null)
  const [roleRequestLoading, setRoleRequestLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'challenges'>('posts')

  const load = async () => {
    if (!username) return
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

      // Load challenges if professor
      if (p.role === 'professeur') {
        const ch = await getChallengesByCreator(p.id)
        setChallenges(ch)
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
  const isOwnProfile = currentUserProfile?.id === profile.id
  const hasSpecialRole = profile.role !== 'user'

  async function handleRoleRequest() {
    if (!currentUserProfile) return
    setRoleRequestLoading(true)
    await submitRoleRequest(currentUserProfile.id, currentUserProfile.username, selectedRole, roleMessage)
    setPendingRequest(selectedRole)
    setRoleRequestSent(true)
    setRoleRequestLoading(false)
  }

  return (
    <div className="profile-page">
      <BadgeUnlockModal badges={newBadges} />
      <div className="profile-header-container">
        <div className="profile-banner">
          {profile.banner_url
            ? <img src={profile.banner_url} alt="" />
            : <div className="profile-banner-placeholder" />
          }
          <div className="profile-banner-overlay" />
        </div>

        <div className="profile-hero">
          {isOwnProfile && (
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
          <div className="profile-stat">
            <span className="profile-stat-value">{totalPlays}</span>
            <span className="profile-stat-label">Vues reçues</span>
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
              <textarea
                className="profile-role-message"
                placeholder="Explique pourquoi tu demandes ce rôle (optionnel)..."
                value={roleMessage}
                onChange={e => setRoleMessage(e.target.value)}
                rows={3}
                maxLength={500}
              />
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

      {/* Tabs for professors and students */}
      {isOwnProfile && (profile.role === 'professeur' || profile.role === 'etudiant') && (
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          {profile.role === 'professeur' && (
            <button
              className={`profile-tab ${activeTab === 'challenges' ? 'active' : ''}`}
              onClick={() => setActiveTab('challenges')}
            >
              Mes Challenges
            </button>
          )}
          {profile.role === 'etudiant' && (
            <button
              className={`profile-tab ${activeTab === 'challenges' ? 'active' : ''}`}
              onClick={() => setActiveTab('challenges')}
            >
              Rejoindre un challenge
            </button>
          )}
        </div>
      )}

      {activeTab === 'posts' && (
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
      )}

      {activeTab === 'challenges' && isOwnProfile && profile.role === 'professeur' && (
        <div className="profile-challenges">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Mes Challenges ({challenges.length})</h2>
            <button className="btn btn-primary" onClick={() => setIsCreateChallengeOpen(true)}>
              + Créer un challenge
            </button>
          </div>
          {challenges.length === 0 ? (
            <p className="profile-empty">Aucun challenge créé pour l'instant.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {challenges.map(ch => (
                <ChallengeCard key={ch.id} challenge={ch} showResults />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'challenges' && isOwnProfile && profile.role === 'etudiant' && (
        <div className="profile-challenges">
          <h2 style={{ marginBottom: '1.5rem' }}>Rejoindre un challenge</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Entre le code à 6 caractères donné par ton professeur pour accéder au challenge.
          </p>
          <JoinChallengeInput userId={profile.id} />
        </div>
      )}


      {isEditModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => { setIsEditModalOpen(false); load(); refreshProfile() }}
        />
      )}

      {isCreateChallengeOpen && (
        <CreateChallengeModal
          creatorId={profile.id}
          onClose={() => setIsCreateChallengeOpen(false)}
          onCreated={async () => {
            const ch = await getChallengesByCreator(profile.id)
            setChallenges(ch)
          }}
        />
      )}
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    try {
      // On utilise avatars/userId (avatar) ou avatars/banner-userId (bannière)
      const path = type === 'avatar' ? `avatars/${profile.id}` : `avatars/banner-${profile.id}`
      const publicUrl = await uploadImage(file, path)
      
      if (type === 'avatar') setAvatarUrl(publicUrl)
      else setBannerUrl(publicUrl)
    } catch (err: any) {
      setError("Erreur lors de l'upload: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const updates: any = {}
      if (username !== profile.username) updates.username = username
      if (bio !== (profile.bio || '')) updates.bio = bio
      if (avatarUrl !== (profile.avatar_url || '')) updates.avatar_url = avatarUrl
      if (bannerUrl !== (profile.banner_url || '')) updates.banner_url = bannerUrl

      if (Object.keys(updates).length === 0) {
        onClose()
        return
      }

      const { error } = await updateProfile(profile.id, updates)

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
            <label>Avatar</label>
            <div className="upload-field">
              {avatarUrl && <img src={avatarUrl} alt="Preview" className="upload-preview" />}
              <div className="upload-controls">
                <input 
                  className="input" 
                  value={avatarUrl} 
                  onChange={e => setAvatarUrl(e.target.value)} 
                  placeholder="URL de l'image..."
                />
                <label className="btn btn-secondary btn-upload">
                  📁 Charger un fichier
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleFileUpload(e, 'avatar')} 
                    hidden 
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Bannière</label>
            <div className="upload-field">
              {bannerUrl && <img src={bannerUrl} alt="Preview" className="upload-preview banner" />}
              <div className="upload-controls">
                <input 
                  className="input" 
                  value={bannerUrl} 
                  onChange={e => setBannerUrl(e.target.value)} 
                  placeholder="URL de la bannière..."
                />
                <label className="btn btn-secondary btn-upload">
                  📁 Charger un fichier
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleFileUpload(e, 'banner')} 
                    hidden 
                  />
                </label>
              </div>
            </div>
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
