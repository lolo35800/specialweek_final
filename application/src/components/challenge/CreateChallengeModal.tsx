import { useState } from 'react'
import { createChallenge } from '../../services/challengeService'

interface Props {
  creatorId: string
  onClose: () => void
  onCreated: () => void
}

export function CreateChallengeModal({ creatorId, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'quiz' | 'fake_or_real'>('quiz')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    setError(null)
    try {
      const challenge = await createChallenge(creatorId, title.trim(), type)
      setCreatedCode(challenge.join_code)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!createdCode) return
    navigator.clipboard.writeText(createdCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDone() {
    onCreated()
    onClose()
  }

  return (
    <div className="profile-edit-overlay" onClick={onClose}>
      <div className="profile-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Créer un challenge</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        {createdCode ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              Challenge créé ! Partage ce code avec tes étudiants :
            </p>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              letterSpacing: '0.3em',
              padding: '1rem 2rem',
              background: 'var(--bg-elevated)',
              borderRadius: '12px',
              border: '2px solid var(--primary)',
              display: 'inline-block',
              marginBottom: '1.5rem',
              color: 'var(--text-h)',
              fontFamily: 'monospace'
            }}>
              {createdCode}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={handleCopy}>
                {copied ? '✓ Copié !' : 'Copier le code'}
              </button>
              <button className="btn btn-primary" onClick={handleDone}>
                Terminé
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Titre du challenge</label>
              <input
                className="input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex : Quiz Désinformation - Semaine 3"
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>Type de challenge</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className={`profile-role-option ${type === 'quiz' ? 'selected' : ''}`}
                  onClick={() => setType('quiz')}
                  style={{ flex: 1 }}
                >
                  <span className="profile-role-option-emoji">❓</span>
                  <span>Quiz</span>
                </button>
                <button
                  type="button"
                  className={`profile-role-option ${type === 'fake_or_real' ? 'selected' : ''}`}
                  onClick={() => setType('fake_or_real')}
                  style={{ flex: 1 }}
                >
                  <span className="profile-role-option-emoji">🕵️</span>
                  <span>Fake ou Réel</span>
                </button>
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={loading || !title.trim()}>
                {loading ? 'Création...' : 'Créer le challenge'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
