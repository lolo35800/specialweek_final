import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChallengeByCode, joinChallenge, getUserParticipation } from '../../services/challengeService'

interface Props {
  userId: string
}

export function JoinChallengeInput({ userId }: Props) {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 6) {
      setError('Le code doit contenir 6 caractères.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const challenge = await getChallengeByCode(trimmed)
      if (!challenge) {
        setError('Code invalide. Vérifie et réessaie.')
        return
      }
      if (challenge.status === 'closed') {
        setError('Ce challenge est fermé.')
        return
      }

      // Check if already participating
      const existing = await getUserParticipation(challenge.id, userId)
      if (existing) {
        // Already joined — go directly to play (or results if completed)
        if (existing.completed_at) {
          setError('Tu as déjà terminé ce challenge.')
          return
        }
        navigate(`/challenge/${challenge.id}`)
        return
      }

      await joinChallenge(challenge.id, userId)
      navigate(`/challenge/${challenge.id}`)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion au challenge.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleJoin} style={{ maxWidth: '400px' }}>
      <div className="form-group">
        <label>Code du challenge</label>
        <input
          className="input"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="Ex : AB3X7K"
          maxLength={6}
          style={{
            fontSize: '1.5rem',
            textAlign: 'center',
            letterSpacing: '0.3em',
            fontFamily: 'monospace',
            fontWeight: 'bold',
          }}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || code.trim().length !== 6}
        style={{ width: '100%' }}
      >
        {loading ? 'Connexion...' : 'Rejoindre le challenge'}
      </button>
    </form>
  )
}
