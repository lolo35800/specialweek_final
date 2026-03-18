import { useEffect, useRef, useState } from 'react'
import { sendMessage, type ChatMessage } from '../services/aiChatService'
import './AiChat.css'

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Salut ! Je suis l\'assistant VériIA. Pose-moi tes questions sur la désinformation, les fake news, l\'IA générative ou l\'esprit critique. Je suis là pour t\'aider à y voir plus clair !',
}

export default function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const res = await sendMessage(text, messages)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Oups, une erreur est survenue. Réessaie dans un instant.' },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="aichat-page">
      <div className="page-header">
        <span className="page-emoji">🤖</span>
        <h1>Assistant IA</h1>
        <p className="page-subtitle">Pose tes questions sur la désinformation et l'IA</p>
      </div>

      <div className="aichat-container">
        <div className="aichat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`aichat-bubble ${msg.role}`}>
              {msg.role === 'assistant' && <span className="aichat-avatar">🤖</span>}
              <div className="aichat-text">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="aichat-bubble assistant">
              <span className="aichat-avatar">🤖</span>
              <div className="aichat-text">
                <span className="aichat-typing">
                  <span /><span /><span />
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form className="aichat-input-bar" onSubmit={(e) => { e.preventDefault(); handleSend() }}>
          <input
            ref={inputRef}
            type="text"
            className="aichat-input"
            placeholder="Écris ton message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            type="submit"
            className="aichat-send-btn"
            disabled={!input.trim() || loading}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  )
}
