import { useState } from 'react'
import { Browser } from './components/Browser'
import { Recommender } from './components/Recommender'
import { TierList } from './components/TierList'

type Tab = 'recommender' | 'browser' | 'tiers'

function App() {
  const [tab, setTab] = useState<Tab>('recommender')

  return (
    <main>
      <h1>Spirit Island Spirit Recommender</h1>
      <nav>
        <button type="button" aria-pressed={tab === 'recommender'} onClick={() => setTab('recommender')}>
          Recommender
        </button>
        <button type="button" aria-pressed={tab === 'browser'} onClick={() => setTab('browser')}>
          Browser
        </button>
        <button type="button" aria-pressed={tab === 'tiers'} onClick={() => setTab('tiers')}>
          Tier list
        </button>
      </nav>
      {tab === 'recommender' && <Recommender />}
      {tab === 'browser' && <Browser />}
      {tab === 'tiers' && <TierList />}
    </main>
  )
}

export default App
