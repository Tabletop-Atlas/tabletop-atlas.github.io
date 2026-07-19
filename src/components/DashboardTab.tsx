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

const DEFAULT_DRAW_COUNT = 4

/** An unmappable raw expansion string reads as not-owned — absence over a guessed inclusion,
 * same discipline as `normalizeExpansion` itself; the real catalog's tripwire test keeps this
 * from ever firing in practice. */
function isOwned(expansion: string, excluded: ReadonlySet<ExpansionName>): boolean {
  const canon = normalizeExpansion(expansion)
  return canon !== undefined && !excluded.has(canon)
}

/**
 * v6 #06/#07: the Dashboard's walking skeleton, plus draw odds. Minor and Major show live
 * composition and hypergeometric draw odds against the Collection's expansion set (the picker
 * itself, and Fear/Event's own views, are #08/#11/#12). A single N stepper (default 4, clamped to
 * [1, deck size] by the domain module) drives both segments' odds; the assumption label keeps the
 * static dashboard from reading as live tracking (PRD user story 27). Holds no game state — a
 * reload always reverts to the Collection default and N=4 (PRD user story 28).
 */
export function DashboardTab() {
  const [segment, setSegment] = useState<Segment>('Minor')
  const [drawCount, setDrawCount] = useState(DEFAULT_DRAW_COUNT)
  const excluded = useMemo(() => new Set(collectionStore.getExcluded()), [])

  const minorComposition = useMemo(
    () => computeDeckComposition(MINOR_CARDS.filter((c) => isOwned(c.expansion, excluded)), drawCount),
    [excluded, drawCount],
  )
  const majorComposition = useMemo(
    () => computeDeckComposition(MAJOR_CARDS.filter((c) => isOwned(c.expansion, excluded)), drawCount),
    [excluded, drawCount],
  )

  const activeComposition = segment === 'Minor' ? minorComposition : segment === 'Major' ? majorComposition : null

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

      {activeComposition && (
        <div className="dashboard-deck">
          <p className="dashboard-deck-size">{activeComposition.deckSize} cards</p>
          <label className="dashboard-draw-stepper">
            Draw
            <input
              type="number"
              min={1}
              max={Math.max(1, activeComposition.deckSize)}
              // Shows the composition's own clamped drawCount, not the raw request — so a typed
              // value that overshoots the deck size snaps back to what the odds actually used,
              // rather than showing an N inconsistent with the percentages beside it.
              value={activeComposition.drawCount}
              onChange={(e) => setDrawCount(Number(e.target.value) || 1)}
            />
            <span>of {activeComposition.deckSize}</span>
          </label>
          <DeckElementBars composition={activeComposition} />
          <p className="dashboard-assumption">Odds assume a full deck, nothing drawn.</p>
        </div>
      )}
      {segment === 'Fear' && <p className="dashboard-stub">Fear segment — coming soon.</p>}
      {segment === 'Event' && <p className="dashboard-stub">Event segment — coming soon.</p>}
    </section>
  )
}
