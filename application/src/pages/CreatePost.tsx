import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createPost } from '../services/postService'
import { uploadImage } from '../services/storageService'
import type { QuizQuestion, FakeOrRealContent } from '../lib/supabase'
import './CreatePost.css'

type PostType = 'quiz' | 'fake_or_real'

const EMPTY_QUESTION: QuizQuestion = {
  id: '',
  texte: '',
  options: ['', '', '', ''],
  bonne_reponse: 0,
  explication: '',
}

export default function CreatePost() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [postType, setPostType] = useState<PostType>('quiz')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { ...EMPTY_QUESTION, id: crypto.randomUUID() },
  ])

  // Fake or Real state
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isReal, setIsReal] = useState(false)
  const [explication, setExplication] = useState('')
  const [indices, setIndices] = useState(['', '', ''])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  if (!user) {
    return (
      <div className="create-gate">
        <p>Tu dois être connecté pour créer un post.</p>
        <Link to="/" className="btn btn-primary">Retour au feed</Link>
      </div>
    )
  }

  // ── Quiz helpers ──────────────────────────────────────────────────────────
  function addQuestion() {
    setQuestions(qs => [...qs, { ...EMPTY_QUESTION, id: crypto.randomUUID() }])
  }
  function removeQuestion(index: number) {
    setQuestions(qs => qs.filter((_, i) => i !== index))
  }
  function updateQuestion(index: number, updates: Partial<QuizQuestion>) {
    setQuestions(qs => qs.map((q, i) => i === index ? { ...q, ...updates } : q))
  }
  function updateOption(qIndex: number, optIndex: number, value: string) {
    setQuestions(qs => qs.map((q, i) => {
      if (i !== qIndex) return q
      const options = [...q.options]
      options[optIndex] = value
      return { ...q, options }
    }))
  }

  // ── Image upload ──────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image trop lourde (max 5 Mo)')
      return
    }
    setImageFile(file)
    setImageUrl('')
    setImagePreview(URL.createObjectURL(file))
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title.trim()) { setError('Le titre est requis'); return }

    let content: object
    if (postType === 'quiz') {
      if (questions.length === 0) { setError('Ajoute au moins une question'); return }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        if (!q.texte.trim()) { setError(`Question ${i + 1} : texte manquant`); return }
        if (q.options.some(o => !o.trim())) { setError(`Question ${i + 1} : toutes les options requises`); return }
      }
      content = { questions }
    } else {
      if (!imageFile && !imageUrl.trim()) { setError('Ajoute une image'); return }
      if (!explication.trim()) { setError('L\'explication est requise'); return }

      let finalUrl = imageUrl.trim()
      if (imageFile) {
        setUploading(true)
        try {
          finalUrl = await uploadImage(imageFile, user!.id)
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Erreur upload image')
          setUploading(false)
          setSaving(false)
          return
        }
        setUploading(false)
      }

      const fakeContent: FakeOrRealContent = {
        image_url: finalUrl,
        is_real: isReal,
        explication: explication.trim(),
        indices: indices.filter(i => i.trim()),
      }
      content = fakeContent
    }

    if (!user) return
    setSaving(true)
    try {
      const post = await createPost(user.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        type: postType,
        content,
      })
      navigate(`/post/${post.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      setError(msg)
    }
    setSaving(false)
  }

  return (
    <div className="create-page">
      <div className="create-header">
        <Link to="/" className="btn btn-ghost">← Retour</Link>
        <h1>Créer un post</h1>
      </div>

      {/* Sélecteur de type */}
      <div className="create-type-selector">
        <button
          type="button"
          className={`create-type-btn ${postType === 'quiz' ? 'active' : ''}`}
          onClick={() => setPostType('quiz')}
        >
          <span className="create-type-icon">🧠</span>
          <span className="create-type-label">Quiz</span>
          <span className="create-type-desc">Des questions avec 4 choix</span>
        </button>
        <button
          type="button"
          className={`create-type-btn ${postType === 'fake_or_real' ? 'active' : ''}`}
          onClick={() => setPostType('fake_or_real')}
        >
          <span className="create-type-icon">🕵️</span>
          <span className="create-type-label">Vrai ou IA</span>
          <span className="create-type-desc">Une image à identifier</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="create-form">
        {/* Infos générales */}
        <div className="create-section">
          <h3>Infos générales</h3>
          <div className="auth-field">
            <label>Titre *</label>
            <input
              className="input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={postType === 'quiz' ? 'Ex: Saurais-tu détecter un deepfake ?' : 'Ex: Cette photo est-elle vraie ?'}
              maxLength={100}
            />
          </div>
          <div className="auth-field">
            <label>Description (optionnel)</label>
            <textarea
              className="input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Décris ton post en quelques mots..."
              maxLength={300}
            />
          </div>
        </div>

        {/* Contenu selon le type */}
        {postType === 'quiz' ? (
          <div className="create-section">
            <div className="create-section-header">
              <h3>Questions ({questions.length})</h3>
              <button type="button" className="btn btn-outline" onClick={addQuestion}>
                + Ajouter
              </button>
            </div>

            {questions.map((q, qi) => (
              <div key={q.id} className="create-question">
                <div className="create-question-header">
                  <span className="create-question-num">Q{qi + 1}</span>
                  {questions.length > 1 && (
                    <button type="button" className="btn btn-ghost" onClick={() => removeQuestion(qi)}>
                      🗑️
                    </button>
                  )}
                </div>

                <div className="auth-field">
                  <label>Question</label>
                  <input
                    className="input"
                    value={q.texte}
                    onChange={e => updateQuestion(qi, { texte: e.target.value })}
                    placeholder="Ta question ici..."
                  />
                </div>

                <div className="create-options">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="create-option-row">
                      <button
                        type="button"
                        className={`create-option-radio ${q.bonne_reponse === oi ? 'selected' : ''}`}
                        onClick={() => updateQuestion(qi, { bonne_reponse: oi })}
                        title="Marquer comme bonne réponse"
                      >
                        {String.fromCharCode(65 + oi)}
                      </button>
                      <input
                        className="input"
                        value={opt}
                        onChange={e => updateOption(qi, oi, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="create-option-hint">
                  Bonne réponse : <strong>{String.fromCharCode(65 + q.bonne_reponse)}</strong> — clique une lettre pour changer
                </p>

                <div className="auth-field">
                  <label>Explication (optionnel)</label>
                  <input
                    className="input"
                    value={q.explication}
                    onChange={e => updateQuestion(qi, { explication: e.target.value })}
                    placeholder="Pourquoi cette réponse est correcte..."
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="create-section">
            <h3>Image à identifier</h3>

            <div className="auth-field">
              <label>Image *</label>

              {/* Zone de drop / clic */}
              <div
                className={`create-drop-zone ${imagePreview ? 'has-image' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Aperçu" className="create-image-preview" />
                ) : (
                  <div className="create-drop-placeholder">
                    <span className="create-drop-icon">📁</span>
                    <span>Clique ou glisse une image ici</span>
                    <span className="create-drop-hint">JPG, PNG, WebP — max 5 Mo</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {/* OU colle une URL */}
              <div className="create-or-divider">ou colle une URL</div>
              <input
                className="input"
                value={imageUrl}
                onChange={e => {
                  setImageUrl(e.target.value)
                  setImageFile(null)
                  setImagePreview(e.target.value)
                }}
                placeholder="https://..."
                type="url"
              />
            </div>

            <div className="create-real-toggle">
              <span>Cette image est :</span>
              <button
                type="button"
                className={`create-toggle-btn ${!isReal ? 'active-ia' : ''}`}
                onClick={() => setIsReal(false)}
              >
                🤖 Générée par IA
              </button>
              <button
                type="button"
                className={`create-toggle-btn ${isReal ? 'active-real' : ''}`}
                onClick={() => setIsReal(true)}
              >
                📷 Vraie photo
              </button>
            </div>

            <div className="auth-field">
              <label>Explication *</label>
              <textarea
                className="input"
                value={explication}
                onChange={e => setExplication(e.target.value)}
                placeholder="Comment reconnaître que cette image est vraie ou générée par IA ?"
              />
            </div>

            <div className="auth-field">
              <label>Indices (optionnel, un par ligne)</label>
              {indices.map((ind, i) => (
                <input
                  key={i}
                  className="input"
                  style={{ marginBottom: 8 }}
                  value={ind}
                  onChange={e => {
                    const next = [...indices]
                    next[i] = e.target.value
                    setIndices(next)
                  }}
                  placeholder={`Indice ${i + 1}...`}
                />
              ))}
            </div>
          </div>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn btn-primary create-submit" disabled={saving || uploading}>
          {uploading ? 'Upload image...' : saving ? 'Publication...' : `🚀 Publier le ${postType === 'quiz' ? 'quiz' : 'défi'}`}
        </button>
      </form>
    </div>
  )
}
