import { useState, type CSSProperties } from 'react'
import ConsumerPanel from './components/ConsumerPanel'
import TransformerPanel from './components/TransformerPanel'
import EventLogPanel from './components/EventLogPanel'
import TestPanel from './components/TestPanel'

const tabs = ['Consumers', 'Transformers', 'Logs', 'Test'] as const
type Tab = typeof tabs[number]

export default function App() {
  const [tab, setTab] = useState<Tab>('Consumers')

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.title}>Event Data Transformer</span>
        <nav style={styles.nav}>
          {tabs.map(t => (
            <button
              key={t}
              style={{ ...styles.tabBtn, ...(tab === t ? styles.tabActive : {}) }}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <main style={styles.main}>
        {tab === 'Consumers' && <ConsumerPanel />}
        {tab === 'Transformers' && <TransformerPanel />}
        {tab === 'Logs' && <EventLogPanel />}
        {tab === 'Test' && <TestPanel />}
      </main>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  root: { minHeight: '100vh', background: '#121212', color: '#e0e0e0', fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', gap: 32, padding: '12px 32px', background: '#1e1e1e', borderBottom: '1px solid #333' },
  title: { fontWeight: 700, fontSize: 18 },
  nav: { display: 'flex', gap: 4 },
  tabBtn: { padding: '6px 18px', borderRadius: 4, border: 'none', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: 14 },
  tabActive: { background: '#333', color: '#fff' },
  main: { padding: 32 },
}
