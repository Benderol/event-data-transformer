import { useEffect, useState, CSSProperties } from 'react'
import { api } from '../api'
import type { Transformer, FieldRule, TransformationType } from '../api'

const TYPES: TransformationType[] = ['INCLUDE', 'RENAME', 'FORMAT_DATE']

const emptyRule = (): FieldRule => ({ fieldName: '', type: 'INCLUDE' })

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })

export default function TransformerPanel() {
  const [transformers, setTransformers] = useState<Transformer[]>([])
  const [name, setName] = useState('')
  const [inputTopic, setInputTopic] = useState('')
  const [outputTopic, setOutputTopic] = useState('')
  const [rules, setRules] = useState<FieldRule[]>([])
  const [draft, setDraft] = useState<FieldRule>(emptyRule())
  const [error, setError] = useState('')

  const load = () => api.getTransformers().then(setTransformers).catch(() => {})
  useEffect(() => { load() }, [])

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
    try {
      await api.createTransformer({ name, inputTopic, outputTopic, rules })
      setName(''); setInputTopic(''); setOutputTopic(''); setRules([])
      load()
    } catch {
      setError('Failed to create transformer')
    }
  }

  return (
    <div style={styles.panel}>
      <h2>Transformers</h2>

      <form onSubmit={submit} style={styles.form}>
        <div style={styles.row}>
          <input style={styles.input} placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          <input style={styles.input} placeholder="Input topic" value={inputTopic} onChange={e => setInputTopic(e.target.value)} required />
          <input style={styles.input} placeholder="Output topic" value={outputTopic} onChange={e => setOutputTopic(e.target.value)} required />
        </div>

        <div style={styles.ruleBuilder}>
          <span style={styles.label}>Add rule</span>
          <div style={styles.row}>
            <input
              style={styles.input}
              placeholder="Field name"
              value={draft.fieldName}
              onChange={e => updateDraft({ fieldName: e.target.value })}
            />
            <select style={styles.select} value={draft.type} onChange={e => updateDraft({ type: e.target.value as TransformationType })}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {draft.type === 'RENAME' && (
              <input
                style={styles.input}
                placeholder="New name"
                value={draft.targetName ?? ''}
                onChange={e => updateDraft({ targetName: e.target.value })}
              />
            )}
            {draft.type === 'FORMAT_DATE' && (
              <>
                <input style={{ ...styles.input, width: 130 }} placeholder="From (yyyy-MM-dd)" value={draft.fromFormat ?? ''} onChange={e => updateDraft({ fromFormat: e.target.value })} />
                <input style={{ ...styles.input, width: 130 }} placeholder="To (dd/MM/yyyy)" value={draft.toFormat ?? ''} onChange={e => updateDraft({ toFormat: e.target.value })} />
              </>
            )}

            <button type="button" style={styles.addBtn} onClick={addRule}>+ Add</button>
          </div>
        </div>

        {rules.length > 0 && (
          <div style={styles.rulesList}>
            {rules.map((r, i) => (
              <div key={i} style={styles.ruleRow}>
                <span style={ruleTag(r.type)}>{r.type}</span>
                <span><code>{r.fieldName}</code></span>
                {r.type === 'RENAME' && <span style={styles.muted}>→ <code>{r.targetName}</code></span>}
                {r.type === 'FORMAT_DATE' && <span style={styles.muted}>{r.fromFormat} → {r.toFormat}</span>}
                <button type="button" style={styles.removeBtn} onClick={() => removeRule(i)}>×</button>
              </div>
            ))}
          </div>
        )}

        <div style={styles.row}>
          <button style={styles.btn} type="submit">Create transformer</button>
          {error && <span style={styles.error}>{error}</span>}
        </div>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th><th>Input</th><th>Output</th><th>Rules</th><th>Status</th><th>Created</th>
          </tr>
        </thead>
        <tbody>
          {transformers
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(t => (
              <tr key={t.createdAt + t.name}>
                <td>{t.name}</td>
                <td><code>{t.inputTopic}</code></td>
                <td><code>{t.outputTopic}</code></td>
                <td>
                  <div style={styles.ruleSummary}>
                    {t.rules.map((r, i) => (
                      <span key={i} style={ruleTag(r.type)}>
                        {r.type === 'RENAME' ? `${r.fieldName}→${r.targetName}` : r.fieldName}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ color: t.enabled ? '#4caf50' : '#f44336' }}>{t.enabled ? 'active' : 'disabled'}</td>
                <td style={styles.muted}>{formatDate(t.createdAt)}</td>
              </tr>
            ))}
          {transformers.length === 0 && (
            <tr><td colSpan={6} style={styles.empty}>No transformers yet</td></tr>
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

const styles = {
  panel: { display: 'flex', flexDirection: 'column', gap: 20 } as CSSProperties,
  form: { display: 'flex', flexDirection: 'column', gap: 12 } as CSSProperties,
  row: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } as CSSProperties,
  label: { fontSize: 12, color: '#888', marginBottom: 4, display: 'block' } as CSSProperties,
  input: { padding: '6px 10px', borderRadius: 4, border: '1px solid #555', background: '#1e1e1e', color: '#fff', fontSize: 14 } as CSSProperties,
  select: { padding: '6px 10px', borderRadius: 4, border: '1px solid #555', background: '#1e1e1e', color: '#fff', fontSize: 14 } as CSSProperties,
  addBtn: { padding: '6px 12px', borderRadius: 4, border: 'none', background: '#555', color: '#fff', cursor: 'pointer', fontSize: 14 } as CSSProperties,
  btn: { padding: '6px 16px', borderRadius: 4, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', fontSize: 14 } as CSSProperties,
  removeBtn: { padding: '2px 7px', borderRadius: 4, border: 'none', background: '#555', color: '#fff', cursor: 'pointer', fontSize: 13, marginLeft: 'auto' } as CSSProperties,
  error: { color: '#f44336', fontSize: 13 } as CSSProperties,
  muted: { color: '#888', fontSize: 13 } as CSSProperties,
  ruleBuilder: { background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 } as CSSProperties,
  rulesList: { display: 'flex', flexDirection: 'column', gap: 6 } as CSSProperties,
  ruleRow: { display: 'flex', gap: 8, alignItems: 'center', background: '#1a1a1a', borderRadius: 4, padding: '6px 10px' } as CSSProperties,
  ruleSummary: { display: 'flex', gap: 4, flexWrap: 'wrap' } as CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 } as CSSProperties,
  empty: { textAlign: 'center', color: '#888', padding: 16 } as CSSProperties,
}

function ruleTag(type: TransformationType): CSSProperties {
  const color = typeColors[type]
  return { background: color + '22', color, border: `1px solid ${color}55`, borderRadius: 3, padding: '2px 6px', fontSize: 11, fontWeight: 600 }
}
