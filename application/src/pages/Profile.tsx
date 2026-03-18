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
import './Profile.css'

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
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          {profile.role === 'admin' && <span className="badge badge-admin">Admin</span>}
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
