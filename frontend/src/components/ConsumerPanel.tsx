import { useEffect, useState, type CSSProperties } from 'react'
import { api } from '../api'
import type { Consumer } from '../api'
import Modal from './Modal'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })

export default function ConsumerPanel() {
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [groupId, setGroupId] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => api.getConsumers().then(setConsumers).catch(() => {})

  const deleteConsumer = (id: number) => api.deleteConsumer(id).then(load).catch(() => {})
  const startConsumer = (id: number) => api.startConsumer(id).then(load).catch(() => {})
  const stopConsumer = (id: number) => api.stopConsumer(id).then(load).catch(() => {})
  useEffect(() => { load() }, [])

  const openModal = () => {
    setName(''); setTopic(''); setGroupId(''); setEnabled(true); setError('')
    setOpen(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.createConsumer(name, topic, groupId, enabled)
      setOpen(false)
      load()
    } catch {
      setError('Failed to create consumer')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.panel}>
      <div style={styles.toolbar}>
        <h2 style={styles.heading}>Consumers</h2>
        <button style={styles.createBtn} onClick={openModal}>+ Create</button>
      </div>

      {open && (
        <Modal title="Create Consumer" onClose={() => setOpen(false)}>
          <form onSubmit={submit} style={styles.form}>
            <label style={styles.label}>Name</label>
            <input style={styles.input} placeholder="my-consumer" value={name} onChange={e => setName(e.target.value)} required />

            <label style={styles.label}>Input topic</label>
            <input style={styles.input} placeholder="my-topic" value={topic} onChange={e => setTopic(e.target.value)} required />

            <label style={styles.label}>Group ID</label>
            <input style={styles.input} placeholder="my-group" value={groupId} onChange={e => setGroupId(e.target.value)} required />

            <label style={styles.toggle}>
              <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
              Start enabled
            </label>

            {error && <span style={styles.error}>{error}</span>}

            <div style={styles.actions}>
              <button type="button" style={styles.cancelBtn} onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" style={{ ...styles.submitBtn, ...(submitting ? styles.disabled : {}) }} disabled={submitting}>
                {submitting ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Topic</th>
            <th style={styles.th}>Group</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Created</th>
            <th style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {consumers
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(c => (
              <tr key={c.createdAt + c.name}>
                <td style={styles.td}>{c.name}</td>
                <td style={styles.td}><code>{c.topic}</code></td>
                <td style={styles.td}>{c.groupId}</td>
                <td style={{ ...styles.td, color: c.enabled ? '#4caf50' : '#f44336' }}>{c.enabled ? 'running' : 'stopped'}</td>
                <td style={{ ...styles.td, ...styles.muted }}>{formatDate(c.createdAt)}</td>
                <td style={styles.td}>
                  <div style={styles.rowActions}>
                    {c.enabled
                      ? <button style={styles.stopBtn} onClick={() => stopConsumer(c.id)}>Stop</button>
                      : <button style={styles.startBtn} onClick={() => startConsumer(c.id)}>Start</button>
                    }
                    <button style={styles.deleteBtn} onClick={() => deleteConsumer(c.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          {consumers.length === 0 && (
            <tr><td colSpan={6} style={styles.empty}>No consumers yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  panel: { display: 'flex', flexDirection: 'column', gap: 20 },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  heading: { margin: 0, fontSize: 20 },
  createBtn: { padding: '7px 18px', borderRadius: 4, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontSize: 13, color: '#aaa', marginBottom: 2 },
  input: { padding: '8px 12px', borderRadius: 4, border: '1px solid #333', background: '#121212', color: '#fff', fontSize: 14, outline: 'none' },
  toggle: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#ccc', cursor: 'pointer' },
  error: { color: '#f44336', fontSize: 13 },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  cancelBtn: { padding: '7px 18px', borderRadius: 4, border: '1px solid #333', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: 14 },
  submitBtn: { padding: '7px 20px', borderRadius: 4, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', padding: '8px 12px', background: '#1e1e1e', color: '#aaa', borderBottom: '1px solid #333', fontWeight: 600 },
  td: { padding: '8px 12px', borderBottom: '1px solid #2a2a2a' },
  muted: { color: '#888', fontSize: 13 },
  empty: { textAlign: 'center', color: '#888', padding: 16 },
  rowActions: { display: 'flex', gap: 6 },
  startBtn: { padding: '4px 10px', borderRadius: 4, border: 'none', background: '#4caf5022', color: '#4caf50', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  stopBtn: { padding: '4px 10px', borderRadius: 4, border: 'none', background: '#ff980022', color: '#ff9800', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  deleteBtn: { padding: '4px 10px', borderRadius: 4, border: 'none', background: '#f4433622', color: '#f44336', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
}
