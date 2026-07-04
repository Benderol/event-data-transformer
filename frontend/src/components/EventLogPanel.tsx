import { useEffect, useState, type CSSProperties } from 'react'
import { api } from '../api'
import type { EventLog, EventLogType } from '../api'

const TYPE_FILTERS = ['ALL', 'CONSUMER', 'PRODUCER'] as const
type Filter = typeof TYPE_FILTERS[number]

const PAGE_SIZE = 10

export default function EventLogPanel() {
  const [logs, setLogs] = useState<EventLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [page, setPage] = useState(0)

  const load = () => {
    setLoading(true)
    setError(null)
    api.getEventLogs()
      .then(data => setLogs([...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .catch(() => setError('Failed to load event logs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const visible = filter === 'ALL' ? logs : logs.filter(l => l.type === filter)
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const paginated = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const setFilter_ = (f: Filter) => { setFilter(f); setPage(0) }

  return (
    <div>
      <div style={styles.toolbar}>
        <h2 style={styles.heading}>Event Logs</h2>
        <div style={styles.filters}>
          {TYPE_FILTERS.map(f => (
            <button
              key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
              onClick={() => setFilter_(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button style={styles.refreshBtn} onClick={load}>Refresh</button>
      </div>

      {loading && <p style={styles.muted}>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && visible.length === 0 && (
        <p style={styles.muted}>No logs yet.</p>
      )}

      {!loading && visible.length > 0 && (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Input Topic</th>
                <th style={styles.th}>Output Topic</th>
                <th style={styles.th}>Message</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((log, i) => (
                <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td style={styles.td}>
                    <span style={typeBadge(log.type)}>{log.type}</span>
                  </td>
                  <td style={styles.td}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={styles.topic}>{log.inputTopic}</span>
                  </td>
                  <td style={styles.td}>
                    {log.outputTopic
                      ? <span style={styles.topic}>{log.outputTopic}</span>
                      : <span style={styles.muted}>—</span>}
                  </td>
                  <td style={styles.td}>
                    <pre style={styles.message}>{formatMessage(log.message)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.pagination}>
            <button
              style={{ ...styles.pageBtn, ...(page === 0 ? styles.pageBtnDisabled : {}) }}
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
            >
              ‹
            </button>
            <span style={styles.pageInfo}>Page {page + 1} of {totalPages}</span>
            <button
              style={{ ...styles.pageBtn, ...(page >= totalPages - 1 ? styles.pageBtnDisabled : {}) }}
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
            >
              ›
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function formatMessage(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

function typeBadge(type: EventLogType): CSSProperties {
  const color = type === 'CONSUMER' ? '#3b82f6' : '#a855f7'
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    background: color + '22',
    color,
    border: `1px solid ${color}55`,
  }
}

const styles: Record<string, CSSProperties> = {
  toolbar: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  heading: { margin: 0, fontSize: 20, marginRight: 4 },
  filters: { display: 'flex', gap: 4 },
  filterBtn: { padding: '5px 14px', borderRadius: 4, border: '1px solid #333', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: 13 },
  filterActive: { background: '#333', color: '#fff', borderColor: '#555' },
  refreshBtn: { padding: '6px 16px', borderRadius: 4, border: 'none', background: '#2a2a2a', color: '#fff', cursor: 'pointer', fontSize: 13, marginLeft: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '8px 12px', background: '#1e1e1e', color: '#aaa', borderBottom: '1px solid #333', fontWeight: 600 },
  td: { padding: '8px 12px', verticalAlign: 'top', borderBottom: '1px solid #2a2a2a' },
  rowEven: { background: '#1a1a1a' },
  rowOdd: { background: '#161616' },
  topic: { fontFamily: 'monospace', background: '#2a2a2a', padding: '2px 6px', borderRadius: 3, fontSize: 12 },
  message: { margin: 0, fontFamily: 'monospace', fontSize: 12, color: '#ccc', whiteSpace: 'pre-wrap', maxWidth: 500 },
  muted: { color: '#666', fontStyle: 'italic', margin: 0 },
  error: { color: '#f87171' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 16 },
  pageBtn: { width: 32, height: 32, borderRadius: 4, border: '1px solid #333', background: '#1e1e1e', color: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageBtnDisabled: { opacity: 0.3, cursor: 'not-allowed' },
  pageInfo: { fontSize: 13, color: '#aaa' },
}
