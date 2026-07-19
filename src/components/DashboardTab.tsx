import { useMemo, useState } from 'react'
import powerCardsData from '../data/power-cards.json'
import { collectionStore } from '../domain/collectionStore'
import { computeDeckComposition } from '../domain/deckComposition'
import { EXPANSIONS, type ExpansionName, type PowerCard } from '../domain/types'
import { normalizeExpansion } from './tagColors'
import { DeckElementBars } from './DeckElementBars'

const powerCards = powerCardsData as PowerCard[]
const MINOR_CARDS = powerCards.filter((c) => c.kind === 'minor')
const MAJOR_CARDS = powerCards.filter((c) => c.kind === 'major')

const SEGMENTS = ['Minor', 'Major', 'Fear', 'Event'] as const
type Segment = (typeof SEGMENTS)[number]

const DEFAULT_DRAW_COUNT = 4

/** deck-dashboard #08: what's "in the decks" for this session — defaults to the Collection's
 * owned set (PRD user story 4: zero clicks for the common case), but is its own state, never
 * written back to `collectionStore` — a reload always reverts to the default (PRD user story 7). */
function defaultCheckedExpansions(): Set<ExpansionName> {
  return new Set(EXPANSIONS.filter((expansion) => collectionStore.owns(expansion)))
}

/** An unmappable raw expansion string reads as not-checked — absence over a guessed inclusion,
 * same discipline as `normalizeExpansion` itself; the real catalog's tripwire test keeps this
 * from ever firing in practice. */
function isChecked(expansion: string, checked: ReadonlySet<ExpansionName>): boolean {
  const canon = normalizeExpansion(expansion)
  return canon !== undefined && checked.has(canon)
}

/**
 * v6 #06/#07/#08: the Dashboard tab. Minor and Major show live composition and hypergeometric
 * draw odds against the checked expansion set; Fear/Event's own views are #11/#12. An expansion
 * picker (session-only state, no storage key) defines the set, defaulting to the Collection;
 * unowned expansions stay listed and annotated, never hidden (PRD user story 6), consistent with
 * Collection treatment elsewhere (`SpiritTile`, `Recommender`'s `unowned-note`). A single N
 * stepper (default 4, clamped to [1, deck size] by the domain module) drives both power-deck
 * segments' odds; the assumption label keeps the static dashboard from reading as live tracking
 * (PRD user story 27). Holds no game state — a reload always reverts to the Collection default,
 * N=4 (PRD user story 28).
 */
export function DashboardTab() {
  const [segment, setSegment] = useState<Segment>('Minor')
  const [drawCount, setDrawCount] = useState(DEFAULT_DRAW_COUNT)
  const [checkedExpansions, setCheckedExpansions] = useState<Set<ExpansionName>>(defaultCheckedExpansions)

  function toggleExpansion(expansion: ExpansionName, checked: boolean) {
    setCheckedExpansions((prev) => {
      const next = new Set(prev)
      if (checked) next.add(expansion)
      else next.delete(expansion)
      return next
    })
  }

  const minorComposition = useMemo(
    () => computeDeckComposition(MINOR_CARDS.filter((c) => isChecked(c.expansion, checkedExpansions)), drawCount),
    [checkedExpansions, drawCount],
  )
  const majorComposition = useMemo(
    () => computeDeckComposition(MAJOR_CARDS.filter((c) => isChecked(c.expansion, checkedExpansions)), drawCount),
    [checkedExpansions, drawCount],
  )

  const activeComposition = segment === 'Minor' ? minorComposition : segment === 'Major' ? majorComposition : null

  return (
    <section>
      <h2>Dashboard</h2>

      <fieldset className="dashboard-picker">
        <legend>Expansions in play</legend>
        <ul className="collection-checklist">
          {EXPANSIONS.map((expansion) => (
            <li key={expansion}>
              <label>
                <input
                  type="checkbox"
                  checked={checkedExpansions.has(expansion)}
                  onChange={(e) => toggleExpansion(expansion, e.target.checked)}
                />
                {expansion}
                {!collectionStore.owns(expansion) && <span className="unowned-note"> · not in your collection</span>}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

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
