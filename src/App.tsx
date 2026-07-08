import { useEffect, useState } from 'react'
import { Browser } from './components/Browser'
import { Recommender } from './components/Recommender'
import { TierBoard } from './components/TierBoard'
import { TierEditor } from './components/TierEditor'
import { PrototypeApp } from './prototype/PrototypeApp'
import type { VariantKey } from './prototype/PrototypeSwitcher'

/** PROTOTYPE hook — remove with src/prototype/ once a visual direction is chosen. */
function usePrototypeVariant(): VariantKey | null {
  const read = () => new URLSearchParams(window.location.search).get('variant')
  const [raw, setRaw] = useState(read)
  useEffect(() => {
    const sync = () => setRaw(read())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])
  return raw === 'A' || raw === 'B' || raw === 'C' ? raw : null
}

type Tab = 'recommender' | 'browser' | 'tiers' | 'customise'

const TABS: { id: Tab; label: string }[] = [
  { id: 'recommender', label: 'Recommender' },
  { id: 'browser', label: 'Browser' },
  { id: 'tiers', label: 'Tier list' },
  { id: 'customise', label: 'Customise tiers' },
]

function App() {
  const [tab, setTab] = useState<Tab>('recommender')
  const variant = usePrototypeVariant()

  if (variant) return <PrototypeApp variant={variant} />

  return (
    <main>
      <h1>Spirit Island Spirit Recommender</h1>
      <nav>
        {TABS.map(({ id, label }) => (
          <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>
      {tab === 'recommender' && <Recommender />}
      {tab === 'browser' && <Browser />}
      {tab === 'tiers' && <TierBoard />}
      {tab === 'customise' && <TierEditor />}
    </main>
  )
}

export default App
