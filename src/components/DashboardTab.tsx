import { useMemo, useState } from 'react'
import powerCardsData from '../data/power-cards.json'
import spiritsData from '../data/spirits.json'
import { collectionStore } from '../domain/collectionStore'
import { computeDeckComposition } from '../domain/deckComposition'
import { EXPANSIONS, type ExpansionName, type PowerCard, type Spirit } from '../domain/types'
import { normalizeExpansion } from './tagColors'
import { DeckCombinationMatrix } from './DeckCombinationMatrix'
import { DeckElementBars } from './DeckElementBars'
import { DeckFacets } from './DeckFacets'

const powerCards = powerCardsData as PowerCard[]
const MINOR_CARDS = powerCards.filter((c) => c.kind === 'minor')
const MAJOR_CARDS = powerCards.filter((c) => c.kind === 'major')

// deck-dashboard #10: by spirit, not Configuration — element data exists at spirit level only,
// and aspects record no element changes (PRD's explicit call, not an oversight).
const SPIRITS = (spiritsData as Spirit[]).slice().sort((a, b) => a.name.localeCompare(b.name))

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
 * v6 #06/#07/#08/#09/#10: the Dashboard tab. Minor and Major show live composition, hypergeometric
 * draw odds, an element-combination dot-matrix, and the speed/cost facets, all against the
 * checked expansion set; Fear/Event's own views are #11/#12. An expansion picker (session-only
 * state, no storage key) defines the set, defaulting to the Collection; unowned expansions stay
 * listed and annotated, never hidden (PRD user story 6), consistent with Collection treatment
 * elsewhere (`SpiritTile`, `Recommender`'s `unowned-note`). A single N stepper (default 4, clamped
 * to [1, deck size] by the domain module) drives both power-deck segments' odds; the assumption
 * label keeps the static dashboard from reading as live tracking (PRD user story 27). An optional
 * spirit pick (default "no spirit") highlights that spirit's own recorded elements in the bars and
 * combination matrix — no new data, no judgment (PRD user stories 18-20). Holds no game state — a
 * reload always reverts to the Collection default, N=4, no spirit (PRD user story 28).
 */
export function DashboardTab() {
  const [segment, setSegment] = useState<Segment>('Minor')
  const [drawCount, setDrawCount] = useState(DEFAULT_DRAW_COUNT)
  const [checkedExpansions, setCheckedExpansions] = useState<Set<ExpansionName>>(defaultCheckedExpansions)
  // '' is the default "no spirit" state (PRD user story 20) — never a storage key, never
  // persisted, so a reload always reverts to it.
  const [spiritId, setSpiritId] = useState('')

  const highlightElements = useMemo(() => {
    if (!spiritId) return undefined
    const spirit = SPIRITS.find((s) => s.id === spiritId)
    return spirit ? new Set(spirit.elements) : undefined
  }, [spiritId])

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

      <label className="dashboard-spirit-picker">
        Highlight my spirit
        <select value={spiritId} onChange={(e) => setSpiritId(e.target.value)}>
          <option value="">No spirit</option>
          {SPIRITS.map((spirit) => (
            <option key={spirit.id} value={spirit.id}>
              {spirit.name}
            </option>
          ))}
        </select>
      </label>

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
          <DeckElementBars composition={activeComposition} highlightElements={highlightElements} />
          <p className="dashboard-assumption">Odds assume a full deck, nothing drawn.</p>

          <h3>Element combinations</h3>
          <DeckCombinationMatrix combinations={activeComposition.combinations} highlightElements={highlightElements} />

          <h3>Facets</h3>
          <DeckFacets composition={activeComposition} />
        </div>
      )}
      {segment === 'Fear' && <p className="dashboard-stub">Fear segment — coming soon.</p>}
      {segment === 'Event' && <p className="dashboard-stub">Event segment — coming soon.</p>}
    </section>
  )
}
