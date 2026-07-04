import { useEffect, useState, type CSSProperties } from 'react'
import { api } from '../api'
import type { Transformer, FieldRule, TransformationType } from '../api'
import Modal from './Modal'

const TYPES: TransformationType[] = ['INCLUDE', 'RENAME', 'FORMAT_DATE']

const emptyRule = (): FieldRule => ({ fieldName: '', type: 'INCLUDE' })

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })

export default function TransformerPanel() {
  const [transformers, setTransformers] = useState<Transformer[]>([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [inputTopic, setInputTopic] = useState('')
  const [outputTopic, setOutputTopic] = useState('')
  const [rules, setRules] = useState<FieldRule[]>([])
  const [draft, setDraft] = useState<FieldRule>(emptyRule())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => api.getTransformers().then(setTransformers).catch(() => {})

  const deleteTransformer = (id: number) => api.deleteTransformer(id).then(load).catch(() => {})
  const toggleTransformer = (t: Transformer) =>
    (t.enabled ? api.disableTransformer(t.id) : api.enableTransformer(t.id)).then(load).catch(() => {})
  useEffect(() => { load() }, [])

  const openModal = () => {
    setName(''); setInputTopic(''); setOutputTopic(''); setRules([]); setDraft(emptyRule()); setError('')
    setOpen(true)
  }

  const updateDraft = (patch: Partial<FieldRule>) =>
    setDraft(prev => ({ ...prev, ...patch }))

  const addRule = () => {
    if (!draft.fieldName.trim()) return
    setRules(prev => [...prev, { ...draft }])
    setDraft(emptyRule())
  }

  const removeRule = (i: number) =>
    setRules(prev => prev.filter((_, idx) => idx !== i))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (rules.length === 0) { setError('Add at least one rule'); return }
    setSubmitting(true)
    try {
      await api.createTransformer({ name, inputTopic, outputTopic, rules })
      setOpen(false)
      load()
    } catch {
      setError('Failed to create transformer')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.panel}>
      <div style={styles.toolbar}>
        <h2 style={styles.heading}>Transformers</h2>
        <button style={styles.createBtn} onClick={openModal}>+ Create</button>
      </div>

      {open && (
        <Modal title="Create Transformer" onClose={() => setOpen(false)}>
          <form onSubmit={submit} style={styles.form}>
            <label style={styles.label}>Name</label>
            <input style={styles.input} placeholder="my-transformer" value={name} onChange={e => setName(e.target.value)} required />

            <label style={styles.label}>Input topic</label>
            <input style={styles.input} placeholder="input-topic" value={inputTopic} onChange={e => setInputTopic(e.target.value)} required />

            <label style={styles.label}>Output topic</label>
            <input style={styles.input} placeholder="output-topic" value={outputTopic} onChange={e => setOutputTopic(e.target.value)} required />

            <div style={styles.ruleBuilder}>
              <span style={styles.ruleBuilderTitle}>Add rule</span>
              <div style={styles.ruleRow}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="Field name"
                  value={draft.fieldName}
                  onChange={e => updateDraft({ fieldName: e.target.value })}
                />
                <select style={styles.select} value={draft.type} onChange={e => updateDraft({ type: e.target.value as TransformationType, targetName: undefined, fromFormat: undefined, toFormat: undefined })}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {draft.type === 'RENAME' && (
                <input
                  style={styles.input}
                  placeholder="New field name"
                  value={draft.targetName ?? ''}
                  onChange={e => updateDraft({ targetName: e.target.value })}
                />
              )}
              {draft.type === 'FORMAT_DATE' && (
                <div style={styles.ruleRow}>
                  <input style={{ ...styles.input, flex: 1 }} placeholder="From format (yyyy-MM-dd)" value={draft.fromFormat ?? ''} onChange={e => updateDraft({ fromFormat: e.target.value })} />
                  <input style={{ ...styles.input, flex: 1 }} placeholder="To format (dd/MM/yyyy)" value={draft.toFormat ?? ''} onChange={e => updateDraft({ toFormat: e.target.value })} />
                </div>
              )}

              <button type="button" style={styles.addBtn} onClick={addRule}>+ Add rule</button>
            </div>

            {rules.length > 0 && (
              <div style={styles.rulesList}>
                {rules.map((r, i) => (
                  <div key={i} style={styles.ruleItem}>
                    <span style={ruleTag(r.type)}>{r.type}</span>
                    <code style={styles.ruleField}>{r.fieldName}</code>
                    {r.type === 'RENAME' && <span style={styles.muted}>→ <code>{r.targetName}</code></span>}
                    {r.type === 'FORMAT_DATE' && <span style={styles.muted}>{r.fromFormat} → {r.toFormat}</span>}
                    <button type="button" style={styles.removeBtn} onClick={() => removeRule(i)}>×</button>
                  </div>
                ))}
              </div>
            )}

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
            <th style={styles.th}>Input</th>
            <th style={styles.th}>Output</th>
            <th style={styles.th}>Rules</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Created</th>
            <th style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {transformers
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(t => (
              <tr key={t.createdAt + t.name}>
                <td style={styles.td}>{t.name}</td>
                <td style={styles.td}><code>{t.inputTopic}</code></td>
                <td style={styles.td}><code>{t.outputTopic}</code></td>
                <td style={styles.td}>
                  <div style={styles.ruleSummary}>
                    {t.rules.map((r, i) => (
                      <span key={i} style={ruleTag(r.type)}>
                        {r.type === 'RENAME' ? `${r.fieldName}→${r.targetName}` : r.fieldName}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ ...styles.td, color: t.enabled ? '#4caf50' : '#f44336' }}>{t.enabled ? 'active' : 'disabled'}</td>
                <td style={{ ...styles.td, ...styles.muted }}>{formatDate(t.createdAt)}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      style={t.enabled ? styles.stopBtn : styles.startBtn}
                      onClick={() => toggleTransformer(t)}
                    >
                      {t.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button style={styles.deleteBtn} onClick={() => deleteTransformer(t.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          {transformers.length === 0 && (
            <tr><td colSpan={7} style={styles.empty}>No transformers yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const typeColors: Record<TransformationType, string> = {
  INCLUDE: '#4caf50',
  RENAME: '#2196f3',
  FORMAT_DATE: '#ff9800',
}

function ruleTag(type: TransformationType): CSSProperties {
  const color = typeColors[type]
  return { background: color + '22', color, border: `1px solid ${color}55`, borderRadius: 3, padding: '2px 6px', fontSize: 11, fontWeight: 600 }
}

const styles: Record<string, CSSProperties> = {
  panel: { display: 'flex', flexDirection: 'column', gap: 20 },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  heading: { margin: 0, fontSize: 20 },
  createBtn: { padding: '7px 18px', borderRadius: 4, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 13, color: '#aaa', marginBottom: 2 },
  input: { padding: '8px 12px', borderRadius: 4, border: '1px solid #333', background: '#121212', color: '#fff', fontSize: 14, outline: 'none' },
  select: { padding: '8px 10px', borderRadius: 4, border: '1px solid #333', background: '#121212', color: '#fff', fontSize: 14 },
  ruleBuilder: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: 6, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  ruleBuilderTitle: { fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  ruleRow: { display: 'flex', gap: 8, alignItems: 'center' },
  addBtn: { alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 4, border: '1px solid #444', background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: 13 },
  rulesList: { display: 'flex', flexDirection: 'column', gap: 6 },
  ruleItem: { display: 'flex', gap: 8, alignItems: 'center', background: '#161616', borderRadius: 4, padding: '6px 10px' },
  ruleField: { fontSize: 13 },
  removeBtn: { marginLeft: 'auto', padding: '2px 8px', borderRadius: 4, border: 'none', background: '#333', color: '#aaa', cursor: 'pointer', fontSize: 14 },
  ruleSummary: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  error: { color: '#f44336', fontSize: 13 },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  cancelBtn: { padding: '7px 18px', borderRadius: 4, border: '1px solid #333', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: 14 },
  submitBtn: { padding: '7px 20px', borderRadius: 4, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
  muted: { color: '#888', fontSize: 13 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', padding: '8px 12px', background: '#1e1e1e', color: '#aaa', borderBottom: '1px solid #333', fontWeight: 600 },
  td: { padding: '8px 12px', borderBottom: '1px solid #2a2a2a' },
  empty: { textAlign: 'center', color: '#888', padding: 16 },
  deleteBtn: { padding: '4px 10px', borderRadius: 4, border: 'none', background: '#f4433622', color: '#f44336', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  startBtn: { padding: '4px 10px', borderRadius: 4, border: 'none', background: '#4caf5022', color: '#4caf50', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  stopBtn: { padding: '4px 10px', borderRadius: 4, border: 'none', background: '#ff980022', color: '#ff9800', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
}
