import { useMemo, useState } from 'react'
import powerCardsData from '../data/power-cards.json'
import { collectionStore } from '../domain/collectionStore'
import { computeDeckComposition } from '../domain/deckComposition'
import type { ExpansionName, PowerCard } from '../domain/types'
import { normalizeExpansion } from './tagColors'
import { DeckElementBars } from './DeckElementBars'

const powerCards = powerCardsData as PowerCard[]
const MINOR_CARDS = powerCards.filter((c) => c.kind === 'minor')
const MAJOR_CARDS = powerCards.filter((c) => c.kind === 'major')

const SEGMENTS = ['Minor', 'Major', 'Fear', 'Event'] as const
type Segment = (typeof SEGMENTS)[number]

/** An unmappable raw expansion string reads as not-owned — absence over a guessed inclusion,
 * same discipline as `normalizeExpansion` itself; the real catalog's tripwire test keeps this
 * from ever firing in practice. */
function isOwned(expansion: string, excluded: ReadonlySet<ExpansionName>): boolean {
  const canon = normalizeExpansion(expansion)
  return canon !== undefined && !excluded.has(canon)
}

/**
 * v6 #06: the Dashboard's walking skeleton. Minor and Major show live composition against the
 * Collection's expansion set (the picker itself, and Fear/Event's own views, are #08/#11/#12).
 * Holds no game state — a reload always reverts to the Collection default (PRD user story 28).
 */
export function DashboardTab() {
  const [segment, setSegment] = useState<Segment>('Minor')
  const excluded = useMemo(() => new Set(collectionStore.getExcluded()), [])

  const minorComposition = useMemo(() => computeDeckComposition(MINOR_CARDS.filter((c) => isOwned(c.expansion, excluded))), [excluded])
  const majorComposition = useMemo(() => computeDeckComposition(MAJOR_CARDS.filter((c) => isOwned(c.expansion, excluded))), [excluded])

  return (
    <section>
      <h2>Dashboard</h2>
      <div className="card-view-switch" role="group" aria-label="Deck">
        {SEGMENTS.map((s) => (
          <button key={s} type="button" aria-pressed={segment === s} onClick={() => setSegment(s)}>
            {s}
          </button>
        ))}
      </div>

      {segment === 'Minor' && (
        <div className="dashboard-deck">
          <p className="dashboard-deck-size">{minorComposition.deckSize} cards</p>
          <DeckElementBars composition={minorComposition} />
        </div>
      )}
      {segment === 'Major' && (
        <div className="dashboard-deck">
          <p className="dashboard-deck-size">{majorComposition.deckSize} cards</p>
          <DeckElementBars composition={majorComposition} />
        </div>
      )}
      {segment === 'Fear' && <p className="dashboard-stub">Fear segment — coming soon.</p>}
      {segment === 'Event' && <p className="dashboard-stub">Event segment — coming soon.</p>}
    </section>
  )
}
