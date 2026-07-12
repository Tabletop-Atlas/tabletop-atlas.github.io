import { useState } from 'react'
import { AppShell, type NavItem } from './components/AppShell'
import { Browser } from './components/Browser'
import { CardsTab } from './components/CardsTab'
import { GameLog } from './components/GameLog'
import { RecommenderMain, RecommenderProvider, RecommenderSide } from './components/Recommender'
import { TierBoard } from './components/TierBoard'
import { TierEditor } from './components/TierEditor'

type Tab = 'recommender' | 'browser' | 'cards' | 'tiers' | 'customise' | 'log'

const NAV: NavItem<Tab>[] = [
  { id: 'recommender', label: 'Recommend' },
  { id: 'browser', label: 'Browse' },
  { id: 'cards', label: 'Cards' },
  { id: 'tiers', label: 'Tier list' },
  { id: 'customise', label: 'Customise tiers' },
  { id: 'log', label: 'Log' },
]

function App() {
  const [tab, setTab] = useState<Tab>('recommender')

  return (
    <RecommenderProvider>
      <AppShell nav={NAV} current={tab} onNavigate={setTab} side={tab === 'recommender' ? <RecommenderSide /> : null}>
        {tab === 'recommender' && <RecommenderMain />}
        {tab === 'browser' && <Browser />}
        {tab === 'cards' && <CardsTab />}
        {tab === 'tiers' && <TierBoard />}
        {tab === 'customise' && <TierEditor />}
        {tab === 'log' && <GameLog />}
      </AppShell>
    </RecommenderProvider>
  )
}

export default App
