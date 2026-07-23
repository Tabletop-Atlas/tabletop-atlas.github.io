import { useState } from 'react'
import { AppShell, type NavItem } from './components/AppShell'
import { Browser } from './components/Browser'
import { CardsTab } from './components/CardsTab'
import { DashboardTab } from './components/DashboardTab'
import { GameLog } from './components/GameLog'
import { GlossaryTab } from './components/GlossaryTab'
import { Homepage } from './components/Homepage'
import { RecommenderMain, RecommenderProvider, RecommenderSide } from './components/Recommender'
import { Settings } from './components/Settings'
import { TierBoard } from './components/TierBoard'

/** 'home' is not a nav tab (#01 decision 3): the clickable logo is the only route home, and
 * while it is current no nav item matches it, so none shows active. */
type Tab = 'home' | 'recommender' | 'browser' | 'cards' | 'dashboard' | 'tiers' | 'log' | 'glossary' | 'settings'

/** Nav is fixed at both ends (#02 decision 4): Browse first, Settings last. Customise tiers is
 * dissolved (#15): tier editing is an edit mode on the Tier list tab. */
const NAV: NavItem<Tab>[] = [
  { id: 'browser', label: 'Browse' },
  { id: 'recommender', label: 'Recommend' },
  { id: 'cards', label: 'Archive' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tiers', label: 'Tier list' },
  { id: 'log', label: 'Log' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'settings', label: 'Settings' },
]

function App() {
  const [tab, setTab] = useState<Tab>('home')

  return (
    <RecommenderProvider>
      <AppShell
        nav={NAV}
        current={tab}
        onNavigate={setTab}
        onHome={() => setTab('home')}
        side={tab === 'recommender' ? <RecommenderSide /> : null}
      >
        {tab === 'home' && <Homepage onNavigate={setTab} />}
        {tab === 'recommender' && <RecommenderMain />}
        {tab === 'browser' && <Browser />}
        {tab === 'cards' && <CardsTab />}
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'tiers' && <TierBoard />}
        {tab === 'log' && <GameLog />}
        {tab === 'glossary' && <GlossaryTab />}
        {tab === 'settings' && <Settings />}
      </AppShell>
    </RecommenderProvider>
  )
}

export default App
