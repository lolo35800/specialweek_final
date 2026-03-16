import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile, isUsernameAvailable } from '../services/profileService'
import { uploadImage } from '../services/storageService'
import { supabase } from '../lib/supabase'
import './EditProfile.css'

export default function EditProfile() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState(profile?.username ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url ?? '')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user || !profile) {
    return (
      <div className="create-gate">
        <p>Tu dois être connecté.</p>
        <Link to="/" className="btn btn-primary">Retour</Link>
      </div>
    )
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Photo trop lourde (max 2 Mo)'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (username.trim().length < 3) { setError('Pseudo : min 3 caractères'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) { setError('Pseudo : lettres, chiffres et _ uniquement'); return }
    if (newPassword && newPassword.length < 6) { setError('Mot de passe : min 6 caractères'); return }
    if (newPassword && newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }

    setSaving(true)

    if (!user || !profile) return

    // 1. Vérif dispo username
    if (username.trim() !== profile.username) {
      const available = await isUsernameAvailable(username.trim())
      if (!available) { setError('Ce pseudo est déjà pris'); setSaving(false); return }
    }

    // 2. Upload avatar si nouveau fichier
    let avatarUrl: string | undefined
    if (avatarFile) {
      try {
        avatarUrl = await uploadImage(avatarFile, `avatars/${user.id}`)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur upload photo')
        setSaving(false)
        return
      }
    }

    // 3. Mise à jour profil
    const updates: { username?: string; bio?: string; avatar_url?: string } = {
      username: username.trim(),
      bio: bio.trim() || undefined,
    }
    if (avatarUrl) updates.avatar_url = avatarUrl

    const { error: profileErr } = await updateProfile(user.id, updates)
    if (profileErr) { setError(profileErr); setSaving(false); return }

    // 4. Mise à jour mot de passe
    if (newPassword) {
      const { error: pwErr } = await supabase.auth.updateUser({ password: newPassword })
      if (pwErr) { setError(pwErr.message); setSaving(false); return }
    }

    setSuccess(true)
    setSaving(false)
    setTimeout(() => navigate(`/profile/${username.trim()}`), 1200)
  }

  return (
    <div className="edit-profile-page">
      <div className="create-header">
        <Link to={`/profile/${profile.username}`} className="btn btn-ghost">← Retour</Link>
        <h1>Modifier le profil</h1>
      </div>

      <form onSubmit={handleSubmit} className="edit-profile-form">

        {/* Photo de profil */}
        <div className="create-section">
          <h3>Photo de profil</h3>
          <div className="edit-avatar-row">
            <div
              className="edit-avatar-preview"
              onClick={() => fileInputRef.current?.click()}
              title="Changer la photo"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="" />
              ) : (
                <span>{username[0]?.toUpperCase() ?? '?'}</span>
              )}
              <div className="edit-avatar-overlay">📷</div>
            </div>
            <div className="edit-avatar-info">
              <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
                Changer la photo
              </button>
              <span className="edit-profile-hint">JPG, PNG — max 2 Mo</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Infos */}
        <div className="create-section">
          <h3>Informations</h3>
          <div className="auth-field">
            <label>Pseudo *</label>
            <input
              className="input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="ton_pseudo"
              maxLength={30}
            />
            <span className="edit-profile-hint">Lettres, chiffres et _ uniquement</span>
          </div>
          <div className="auth-field">
            <label>Bio</label>
            <textarea
              className="input"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Décris-toi en quelques mots..."
              maxLength={200}
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div className="create-section">
          <h3>Changer le mot de passe</h3>
          <p className="edit-profile-hint" style={{ marginBottom: 12 }}>Laisse vide pour ne pas changer</p>
          <div className="auth-field">
            <label>Nouveau mot de passe</label>
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="auth-field">
            <label>Confirmer le mot de passe</label>
            <input
              className="input"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="edit-profile-success">✅ Profil mis à jour !</p>}

        <button type="submit" className="btn btn-primary create-submit" disabled={saving}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </button>
      </form>
    </div>
  )
}
