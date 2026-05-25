import { useEffect, useState, CSSProperties } from 'react'
import { api } from '../api'
import type { Consumer } from '../api'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })

export default function ConsumerPanel() {
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [groupId, setGroupId] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [error, setError] = useState('')

  const load = () => api.getConsumers().then(setConsumers).catch(() => {})
  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await api.createConsumer(name, topic, groupId, enabled)
      setName(''); setTopic(''); setGroupId(''); setEnabled(true)
      load()
    } catch {
      setError('Failed to create consumer')
    }
  }

  return (
    <div style={styles.panel}>
      <h2>Consumers</h2>

      <form onSubmit={submit} style={styles.form}>
        <input style={styles.input} placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input style={styles.input} placeholder="Input topic" value={topic} onChange={e => setTopic(e.target.value)} required />
        <input style={styles.input} placeholder="Group ID" value={groupId} onChange={e => setGroupId(e.target.value)} required />
        <label style={styles.toggle}>
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          Start enabled
        </label>
        <button style={styles.btn} type="submit">Create</button>
        {error && <span style={styles.error}>{error}</span>}
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th><th>Topic</th><th>Group</th><th>Status</th><th>Created</th>
          </tr>
        </thead>
        <tbody>
          {consumers
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(c => (
              <tr key={c.createdAt + c.name}>
                <td>{c.name}</td>
                <td><code>{c.topic}</code></td>
                <td>{c.groupId}</td>
                <td style={{ color: c.enabled ? '#4caf50' : '#f44336' }}>{c.enabled ? 'running' : 'stopped'}</td>
                <td style={styles.muted}>{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          {consumers.length === 0 && (
            <tr><td colSpan={5} style={styles.empty}>No consumers yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const styles = {
  panel: { display: 'flex', flexDirection: 'column', gap: 16 } as CSSProperties,
  form: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } as CSSProperties,
  input: { padding: '6px 10px', borderRadius: 4, border: '1px solid #555', background: '#1e1e1e', color: '#fff', fontSize: 14 } as CSSProperties,
  toggle: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#ccc', cursor: 'pointer' } as CSSProperties,
  btn: { padding: '6px 16px', borderRadius: 4, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', fontSize: 14 } as CSSProperties,
  error: { color: '#f44336', fontSize: 13 } as CSSProperties,
  muted: { color: '#888', fontSize: 13 } as CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 } as CSSProperties,
  empty: { textAlign: 'center', color: '#888', padding: 16 } as CSSProperties,
}
