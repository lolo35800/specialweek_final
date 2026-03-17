import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile, isUsernameAvailable } from '../services/profileService'
import { uploadImage } from '../services/storageService'
import { enrollMfa, verifyEnrollment, unenrollMfa, getMfaStatus } from '../services/mfaService'
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

  // 2FA state
  const [mfaEnrolled, setMfaEnrolled] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [mfaStep, setMfaStep] = useState<'idle' | 'qr' | 'verify'>('idle')
  const [mfaQr, setMfaQr] = useState('')
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaTempFactorId, setMfaTempFactorId] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaError, setMfaError] = useState<string | null>(null)
  const [mfaLoading, setMfaLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getMfaStatus().then(({ enrolled, factorId }) => {
      setMfaEnrolled(enrolled)
      setMfaFactorId(factorId)
    })
  }, [])

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

  async function startMfaEnroll() {
    setMfaError(null)
    setMfaLoading(true)
    const { qr, secret, factorId, error } = await enrollMfa()
    if (error) { setMfaError(error); setMfaLoading(false); return }
    setMfaQr(qr)
    setMfaSecret(secret)
    setMfaTempFactorId(factorId)
    setMfaStep('qr')
    setMfaLoading(false)
  }

  async function confirmMfaEnroll() {
    if (mfaCode.length !== 6) return
    setMfaError(null)
    setMfaLoading(true)
    const { error } = await verifyEnrollment(mfaTempFactorId, mfaCode)
    if (error) { setMfaError(error); setMfaLoading(false); return }
    setMfaEnrolled(true)
    setMfaFactorId(mfaTempFactorId)
    setMfaStep('idle')
    setMfaCode('')
    setMfaLoading(false)
  }

  async function disableMfa() {
    if (!mfaFactorId || !confirm('Désactiver la double authentification ?')) return
    setMfaLoading(true)
    const { error } = await unenrollMfa(mfaFactorId)
    if (error) { setMfaError(error) } else { setMfaEnrolled(false); setMfaFactorId(null) }
    setMfaLoading(false)
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

        {/* Double authentification */}
        <div className="create-section">
          <h3>Double authentification (2FA)</h3>

          {mfaEnrolled ? (
            <div className="mfa-active">
              <p className="mfa-status on">🔐 2FA activée</p>
              <p className="edit-profile-hint">Ton compte est protégé par une application d'authentification.</p>
              <button type="button" className="btn btn-danger" onClick={disableMfa} disabled={mfaLoading}>
                {mfaLoading ? 'Désactivation...' : 'Désactiver la 2FA'}
              </button>
            </div>
          ) : mfaStep === 'idle' ? (
            <div className="mfa-inactive">
              <p className="mfa-status off">⚠️ 2FA désactivée</p>
              <p className="edit-profile-hint">Ajoute une couche de sécurité supplémentaire avec Google Authenticator, Authy ou similaire.</p>
              <button type="button" className="btn btn-outline" onClick={startMfaEnroll} disabled={mfaLoading}>
                {mfaLoading ? 'Chargement...' : 'Activer la 2FA'}
              </button>
            </div>
          ) : (
            <div className="mfa-setup">
              <p className="edit-profile-hint">1. Scanne ce QR code avec ton application d'authentification</p>
              {mfaQr && <img src={mfaQr} alt="QR Code 2FA" className="mfa-qr" />}
              <details className="mfa-secret-details">
                <summary>Afficher la clé manuelle</summary>
                <code className="mfa-secret">{mfaSecret}</code>
              </details>
              <p className="edit-profile-hint" style={{ marginTop: 16 }}>2. Entre le code à 6 chiffres affiché</p>
              <div className="auth-field">
                <input
                  className="input auth-mfa-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </div>
              {mfaError && <p className="auth-error">{mfaError}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-primary" onClick={confirmMfaEnroll}
                  disabled={mfaLoading || mfaCode.length !== 6}>
                  {mfaLoading ? 'Vérification...' : 'Confirmer'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setMfaStep('idle'); setMfaCode('') }}>
                  Annuler
                </button>
              </div>
            </div>
          )}
          {mfaError && mfaStep === 'idle' && <p className="auth-error">{mfaError}</p>}
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
