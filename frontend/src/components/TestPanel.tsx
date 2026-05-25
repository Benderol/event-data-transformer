import { useState, type CSSProperties } from 'react'
import { api } from '../api'

const DEFAULT_MESSAGE = JSON.stringify({ field: 'value' }, null, 2)

export default function TestPanel() {
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [sending, setSending] = useState(false)

  const send = async () => {
    if (!topic.trim()) return
    setSending(true)
    setStatus(null)
    try {
      const text = await api.testSend(topic.trim(), message)
      setStatus({ ok: true, text })
    } catch {
      setStatus({ ok: false, text: 'Failed to send message.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={styles.root}>
      <h2 style={styles.heading}>Test Send</h2>
      <p style={styles.subtitle}>Send a raw message directly to a Kafka topic.</p>

      <div style={styles.form}>
        <label style={styles.label}>Topic</label>
        <input
          style={styles.input}
          placeholder="e.g. my-input-topic"
          value={topic}
          onChange={e => setTopic(e.target.value)}
        />

        <label style={styles.label}>Message (JSON)</label>
        <textarea
          style={styles.textarea}
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={10}
          spellCheck={false}
        />

        <button
          style={{ ...styles.btn, ...(sending ? styles.btnDisabled : {}) }}
          onClick={send}
          disabled={sending}
        >
          {sending ? 'Sending…' : 'Send'}
        </button>

        {status && (
          <p style={status.ok ? styles.success : styles.error}>{status.text}</p>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  root: { maxWidth: 600 },
  heading: { margin: '0 0 4px', fontSize: 20 },
  subtitle: { margin: '0 0 24px', color: '#888', fontSize: 13 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontSize: 13, color: '#aaa', marginBottom: 2 },
  input: { padding: '8px 12px', borderRadius: 4, border: '1px solid #333', background: '#1e1e1e', color: '#fff', fontSize: 14, outline: 'none' },
  textarea: { padding: '8px 12px', borderRadius: 4, border: '1px solid #333', background: '#1e1e1e', color: '#fff', fontSize: 13, fontFamily: 'monospace', outline: 'none', resize: 'vertical' },
  btn: { alignSelf: 'flex-start', padding: '8px 24px', borderRadius: 4, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 600 },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  success: { color: '#4ade80', margin: 0, fontSize: 13 },
  error: { color: '#f87171', margin: 0, fontSize: 13 },
}
