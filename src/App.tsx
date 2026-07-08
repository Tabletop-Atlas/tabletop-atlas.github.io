import { useState } from 'react'
import { AppShell, type NavItem } from './components/AppShell'
import { Browser } from './components/Browser'
import { RecommenderMain, RecommenderProvider, RecommenderSide } from './components/Recommender'
import { TierBoard } from './components/TierBoard'
import { TierEditor } from './components/TierEditor'

type Tab = 'recommender' | 'browser' | 'tiers' | 'customise'

const NAV: NavItem<Tab>[] = [
  { id: 'recommender', label: 'Recommend' },
  { id: 'browser', label: 'Browse' },
  { id: 'tiers', label: 'Tier list' },
  { id: 'customise', label: 'Customise tiers' },
]

function App() {
  const [tab, setTab] = useState<Tab>('recommender')

  return (
    <RecommenderProvider>
      <AppShell nav={NAV} current={tab} onNavigate={setTab} side={tab === 'recommender' ? <RecommenderSide /> : null}>
        {tab === 'recommender' && <RecommenderMain />}
        {tab === 'browser' && <Browser />}
        {tab === 'tiers' && <TierBoard />}
        {tab === 'customise' && <TierEditor />}
      </AppShell>
    </RecommenderProvider>
  )
}

export default App
