import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Post } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getAllPostsAdmin, deletePost, flagPost } from '../services/postService'
import {
  getAllUsers, updateUserRole, deleteUserAccount, banUser,
  getRoleRequests, approveRoleRequest, rejectRoleRequest,
  type UserRole, type RoleRequest,
} from '../services/adminService'
import { getPostReports, deleteReport } from '../services/reportService'
import './Admin.css'

type PostWithProfile = Post & {
  profiles: { username: string; avatar_url: string | null }
}

type Tab = 'posts' | 'users' | 'roles' | 'reports'

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Utilisateur',
  admin: 'Admin',
  etudiant: 'Étudiant',
  expert_ia: 'Expert IA',
  professeur: 'Professeur',
}

const ROLE_COLORS: Record<UserRole, string> = {
  user: '#71717a',
  admin: '#f43f5e',
  etudiant: '#3b82f6',
  expert_ia: '#14b8a6',
  professeur: '#a855f7',
}

export default function Admin() {
  const { isAdmin, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('posts')

  // Posts
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [postFilter, setPostFilter] = useState<'all' | 'flagged'>('all')
  const [fetchingPosts, setFetchingPosts] = useState(true)

  // Users
  const [users, setUsers] = useState<any[]>([])
  const [fetchingUsers, setFetchingUsers] = useState(false)
  const [userSearch, setUserSearch] = useState('')

  // Role requests
  const [requests, setRequests] = useState<RoleRequest[]>([])
  const [fetchingRequests, setFetchingRequests] = useState(false)

  // Reports
  const [reports, setReports] = useState<any[]>([])
  const [fetchingReports, setFetchingReports] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    getAllPostsAdmin().then(data => {
      setPosts(data as PostWithProfile[])
      setFetchingPosts(false)
    })
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin || tab !== 'users' || users.length > 0) return
    setFetchingUsers(true)
    getAllUsers().then(data => { setUsers(data); setFetchingUsers(false) })
  }, [tab, isAdmin])

  useEffect(() => {
    if (!isAdmin || tab !== 'roles') return
    setFetchingRequests(true)
    getRoleRequests().then(data => { setRequests(data); setFetchingRequests(false) })
  }, [tab, isAdmin])

  useEffect(() => {
    if (!isAdmin || tab !== 'reports') return
    setFetchingReports(true)
    getPostReports().then(data => { setReports(data); setFetchingReports(false) })
  }, [tab, isAdmin])

  // ─── Posts handlers ───────────────────────────────────────
  async function handleDeletePost(postId: string) {
    if (!confirm('Supprimer ce post définitivement ?')) return
    await deletePost(postId)
    setPosts(ps => ps.filter(p => p.id !== postId))
  }

  async function handleFlag(post: PostWithProfile) {
    await flagPost(post.id, !post.is_flagged)
    setPosts(ps => ps.map(p => p.id === post.id ? { ...p, is_flagged: !p.is_flagged } : p))
  }

  // ─── Users handlers ───────────────────────────────────────
  async function handleRoleChange(userId: string, role: UserRole) {
    await updateUserRole(userId, role)
    setUsers(us => us.map(u => u.id === userId ? { ...u, role } : u))
  }

  async function handleBan(userId: string, currentBanned: boolean) {
    await banUser(userId, !currentBanned)
    setUsers(us => us.map(u => u.id === userId ? { ...u, is_banned: !currentBanned } : u))
  }

  async function handleDeleteUser(userId: string, username: string) {
    if (!confirm(`Supprimer le compte de ${username} définitivement ?`)) return
    await deleteUserAccount(userId)
    setUsers(us => us.filter(u => u.id !== userId))
  }

  // ─── Role requests handlers ───────────────────────────────
  async function handleApprove(req: RoleRequest) {
    await approveRoleRequest(req.id, req.user_id, req.requested_role)
    setRequests(rs => rs.filter(r => r.id !== req.id))
    setUsers([]) // reset pour forcer rechargement
  }

  async function handleReject(req: RoleRequest) {
    await rejectRoleRequest(req.id)
    setRequests(rs => rs.filter(r => r.id !== req.id))
  }

  if (loading) return <div className="admin-loading"><div className="feed-spinner" /></div>
  if (!isAdmin) return (
    <div className="admin-denied">
      <p>Accès refusé.</p>
      <Link to="/" className="btn btn-outline">Retour</Link>
    </div>
  )

  const displayedPosts = postFilter === 'flagged' ? posts.filter(p => p.is_flagged) : posts
  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(userSearch.toLowerCase())
  )
  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Panel Admin</h1>
          <p className="admin-subtitle">Gestion de la plateforme Verif-IA</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
          📝 Posts ({posts.length})
        </button>
        <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          👥 Utilisateurs ({users.length})
        </button>
        <button className={`admin-tab ${tab === 'roles' ? 'active' : ''}`} onClick={() => setTab('roles')}>
          🎓 Demandes de rôle
          {pendingCount > 0 && <span className="admin-badge">{pendingCount}</span>}
        </button>
        <button className={`admin-tab ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>
          ⚑ Signalements
          {reports.length > 0 && <span className="admin-badge">{reports.length}</span>}
        </button>
      </div>

      {/* ── POSTS ── */}
      {tab === 'posts' && (
        <div>
          <div className="admin-filters">
            <button className={`feed-filter-btn ${postFilter === 'all' ? 'active' : ''}`} onClick={() => setPostFilter('all')}>
              Tous ({posts.length})
            </button>
            <button className={`feed-filter-btn ${postFilter === 'flagged' ? 'active' : ''}`} onClick={() => setPostFilter('flagged')}>
              🚩 Signalés ({posts.filter(p => p.is_flagged).length})
            </button>
          </div>

          {fetchingPosts ? (
            <div className="admin-loading"><div className="feed-spinner" /></div>
          ) : displayedPosts.length === 0 ? (
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
                  {displayedPosts.map(post => (
                    <tr key={post.id} className={post.is_flagged ? 'flagged-row' : ''}>
                      <td><Link to={`/post/${post.id}`} className="admin-post-link">{post.title}</Link></td>
                      <td><Link to={`/profile/${post.profiles?.username}`} className="admin-post-link">{post.profiles?.username ?? '—'}</Link></td>
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
                          : <span className="admin-status-ok">✅ OK</span>}
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button className={`btn ${post.is_flagged ? 'btn-outline' : 'btn-ghost'}`} onClick={() => handleFlag(post)}>
                            {post.is_flagged ? 'Désignaler' : '🚩'}
                          </button>
                          <button className="btn btn-danger" onClick={() => handleDeletePost(post.id)}>Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div>
          <input
            className="admin-search"
            placeholder="Rechercher un utilisateur..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
          />
          {fetchingUsers ? (
            <div className="admin-loading"><div className="feed-spinner" /></div>
          ) : filteredUsers.length === 0 ? (
            <p className="admin-empty">Aucun utilisateur trouvé.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Rôle actuel</th>
                    <th>XP</th>
                    <th>Parties</th>
                    <th>Changer le rôle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-user-avatar">
                            {u.avatar_url
                              ? <img src={u.avatar_url} alt="" />
                              : <span>{u.username?.[0]?.toUpperCase()}</span>}
                          </div>
                          <Link to={`/profile/${u.username}`} className="admin-post-link">{u.username}</Link>
                        </div>
                      </td>
                      <td>
                        <span className="admin-role-chip" style={{ background: `${ROLE_COLORS[u.role as UserRole]}22`, color: ROLE_COLORS[u.role as UserRole], borderColor: `${ROLE_COLORS[u.role as UserRole]}55` }}>
                          {ROLE_LABELS[u.role as UserRole] ?? u.role}
                        </span>
                      </td>
                      <td>{u.xp ?? 0}</td>
                      <td>{u.games_played ?? 0}</td>
                      <td>
                        <select
                          className="admin-role-select"
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className={`btn ${u.is_banned ? 'btn-outline' : 'btn-warning'}`}
                            onClick={() => handleBan(u.id, u.is_banned)}
                          >
                            {u.is_banned ? '✅ Débannir' : '🚫 Bannir'}
                          </button>
                          <button className="btn btn-danger" onClick={() => handleDeleteUser(u.id, u.username)}>
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
      )}

      {/* ── REPORTS ── */}
      {tab === 'reports' && (
        <div>
          {fetchingReports ? (
            <div className="admin-loading"><div className="feed-spinner" /></div>
          ) : reports.length === 0 ? (
            <div className="admin-empty-requests"><p>✅ Aucun signalement.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Post signalé</th>
                    <th>Signalé par</th>
                    <th>Raison</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r: any) => (
                    <tr key={r.id}>
                      <td>
                        <Link to={`/post/${r.post_id}`} className="admin-post-link">
                          {r.posts?.title ?? r.post_id}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/profile/${r.profiles?.username}`} className="admin-post-link">
                          {r.profiles?.username ?? '—'}
                        </Link>
                      </td>
                      <td className="admin-report-reason">{r.reason}</td>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: 13 }}>
                        {new Date(r.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button className="btn btn-danger" onClick={async () => {
                            if (!confirm('Supprimer ce post définitivement ?')) return
                            await deletePost(r.post_id)
                            setReports(rs => rs.filter(rep => rep.id !== r.id))
                            setPosts(ps => ps.filter(p => p.id !== r.post_id))
                          }}>
                            Supprimer le post
                          </button>
                          <button className="btn btn-outline" onClick={async () => {
                            await deleteReport(r.id)
                            setReports(rs => rs.filter(rep => rep.id !== r.id))
                          }}>
                            Ignorer
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
      )}

      {/* ── ROLE REQUESTS ── */}
      {tab === 'roles' && (
        <div>
          {fetchingRequests ? (
            <div className="admin-loading"><div className="feed-spinner" /></div>
          ) : requests.length === 0 ? (
            <div className="admin-empty-requests">
              <p>✅ Aucune demande de rôle en attente.</p>
            </div>
          ) : (
            <div className="admin-requests-list">
              {requests.map(req => (
                <div key={req.id} className="admin-request-card">
                  <div className="admin-request-info">
                    <div className="admin-request-user">
                      <span className="admin-request-avatar">{req.username?.[0]?.toUpperCase()}</span>
                      <div>
                        <Link to={`/profile/${req.username}`} className="admin-post-link">
                          <strong>{req.username}</strong>
                        </Link>
                        <p className="admin-request-date">
                          {new Date(req.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="admin-request-role">
                      <span>demande le rôle</span>
                      <span
                        className="admin-role-chip"
                        style={{
                          background: `${ROLE_COLORS[req.requested_role]}22`,
                          color: ROLE_COLORS[req.requested_role],
                          borderColor: `${ROLE_COLORS[req.requested_role]}55`,
                        }}
                      >
                        🎓 {ROLE_LABELS[req.requested_role]}
                      </span>
                    </div>
                  </div>
                  <div className="admin-request-actions">
                    <button className="btn btn-primary" onClick={() => handleApprove(req)}>
                      ✅ Approuver
                    </button>
                    <button className="btn btn-danger" onClick={() => handleReject(req)}>
                      ❌ Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
