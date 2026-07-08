import { useState } from 'react'
import { Browser } from './components/Browser'
import { Recommender } from './components/Recommender'

type Tab = 'recommender' | 'browser'

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
      </nav>
      {tab === 'recommender' ? <Recommender /> : <Browser />}
    </main>
  )
}

export default App
