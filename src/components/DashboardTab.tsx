import { useMemo, useState } from 'react'
import otherCardsData from '../data/other-cards.json'
import powerCardsData from '../data/power-cards.json'
import spiritsData from '../data/spirits.json'
import { collectionStore } from '../domain/collectionStore'
import { computeDeckComposition } from '../domain/deckComposition'
import { groupOtherCards } from '../domain/otherCardArrange'
import { EXPANSIONS, type ExpansionName, type OtherCard, type PowerCard, type Spirit } from '../domain/types'
import { normalizeExpansion } from './tagColors'
import { DeckChartVariantSwitcher, DeckChartVariantView, readDeckChartVariant } from './DeckChartRound'
import { DeckCombinationMatrix } from './DeckCombinationMatrix'
import { DeckElementBars } from './DeckElementBars'
import { DeckFacets } from './DeckFacets'
import { DeckPoolBreakdown } from './DeckPoolBreakdown'

const powerCards = powerCardsData as PowerCard[]
const MINOR_CARDS = powerCards.filter((c) => c.kind === 'minor')
const MAJOR_CARDS = powerCards.filter((c) => c.kind === 'major')
// ROUND 03 — THROWAWAY, delete with DeckChartRound.tsx (owner asked to try folding a spirit's
// unique powers into the Minor deck's composition).
const UNIQUE_CARDS = powerCards.filter((c) => c.kind === 'unique')

const otherCards = otherCardsData as OtherCard[]
const FEAR_CARDS = otherCards.filter((c) => c.kind === 'fear')
const EVENT_CARDS = otherCards.filter((c) => c.kind === 'event')

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
 * v6 #06/#07/#08/#09/#10/#11/#12: the Dashboard tab. Minor and Major show live composition,
 * hypergeometric draw odds, an element-combination dot-matrix, and the speed/cost facets, all
 * against the checked expansion set. An expansion picker (session-only state, no storage key)
 * defines the set, defaulting to the Collection; unowned expansions stay listed and annotated,
 * never hidden (PRD user story 6), consistent with Collection treatment elsewhere (`SpiritTile`,
 * `Recommender`'s `unowned-note`). A single N stepper (default 4, clamped to [1, deck size] by the
 * domain module) drives both power-deck segments' odds; the assumption label keeps the static
 * dashboard from reading as live tracking (PRD user story 27). An optional spirit pick (default
 * "no spirit") highlights that spirit's own recorded elements in the bars and combination matrix —
 * no new data, no judgment (PRD user stories 18-20). Fear and Event both reuse the existing
 * `groupOtherCards` seam (`otherCardArrange.ts`) for their by-tag/by-class and by-expansion
 * breakdowns rather than duplicating that grouping logic, and both carry no valence axis — that's
 * the map's open taxonomy thread, explicitly out of scope here. Fear's framing copy states the
 * pool is a hidden-subset fact, never a card counter (PRD user story 25); Event's empty state
 * (a base-game-only set) reads as a rule of the game, not an error or blank screen (PRD user story
 * 26). Holds no game state — a reload always reverts to the Collection default, N=4, no spirit
 * (PRD user story 28).
 */
/** `initialSegment` mirrors `TierBoard`'s `initialSubject` — lets the server-rendered smoke test
 * reach a non-default segment without simulating a click. */
export function DashboardTab({ initialSegment }: { initialSegment?: Segment } = {}) {
  const [segment, setSegment] = useState<Segment>(initialSegment ?? 'Minor')
  const [drawCount, setDrawCount] = useState(DEFAULT_DRAW_COUNT)
  const [checkedExpansions, setCheckedExpansions] = useState<Set<ExpansionName>>(defaultCheckedExpansions)
  // '' is the default "no spirit" state (PRD user story 20) — never a storage key, never
  // persisted, so a reload always reverts to it.
  const [spiritId, setSpiritId] = useState('')
  // ROUND 03 (deck-dashboard #03) — THROWAWAY, delete with DeckChartRound.tsx. Null without
  // the `?deckchart=` param, so the shipped view stays byte-identical.
  const [chartVariant, setChartVariant] = useState(readDeckChartVariant)
  const [includeUniques, setIncludeUniques] = useState(false)

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

  // ROUND 03: optionally folds the picked spirit's unique powers into the Minor pool — a
  // hypothetical the owner wants to explore, clearly not how the physical deck is built
  // (uniques start in hand, they are never shuffled into the minor deck).
  const spiritUniques = useMemo(
    () => (chartVariant && includeUniques && spiritId ? UNIQUE_CARDS.filter((c) => c.spirit === spiritId) : []),
    [chartVariant, includeUniques, spiritId],
  )
  const minorComposition = useMemo(
    () => computeDeckComposition([...MINOR_CARDS.filter((c) => isChecked(c.expansion, checkedExpansions)), ...spiritUniques], drawCount),
    [checkedExpansions, drawCount, spiritUniques],
  )
  const majorComposition = useMemo(
    () => computeDeckComposition(MAJOR_CARDS.filter((c) => isChecked(c.expansion, checkedExpansions)), drawCount),
    [checkedExpansions, drawCount],
  )

  const activeComposition = segment === 'Minor' ? minorComposition : segment === 'Major' ? majorComposition : null

  const fearCardsInPlay = useMemo(() => FEAR_CARDS.filter((c) => isChecked(c.expansion, checkedExpansions)), [checkedExpansions])
  const fearByTag = useMemo(() => groupOtherCards(fearCardsInPlay, 'subtype'), [fearCardsInPlay])
  const fearByExpansion = useMemo(() => groupOtherCards(fearCardsInPlay, 'expansion'), [fearCardsInPlay])

  const eventCardsInPlay = useMemo(() => EVENT_CARDS.filter((c) => isChecked(c.expansion, checkedExpansions)), [checkedExpansions])
  const eventByClass = useMemo(() => groupOtherCards(eventCardsInPlay, 'subtype'), [eventCardsInPlay])
  const eventByExpansion = useMemo(() => groupOtherCards(eventCardsInPlay, 'expansion'), [eventCardsInPlay])

  const segmentSwitch = (
    <div className={chartVariant ? 'deckchart-b-segments' : 'card-view-switch'} role="group" aria-label="Deck">
      {SEGMENTS.map((s) => (
        <button key={s} type="button" aria-pressed={segment === s} data-active={segment === s} onClick={() => setSegment(s)}>
          {s}
        </button>
      ))}
    </div>
  )

  return (
    <section>
      <h2>Dashboard</h2>

      {/* ROUND 03: the deck switch is the core "what am I looking at" control — promoted above
       * the expansion picker and enlarged when the round is active. */}
      {chartVariant && segmentSwitch}

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

      <label className={chartVariant ? 'dashboard-spirit-picker deckchart-b-selectpill' : 'dashboard-spirit-picker'}>
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
      {chartVariant && spiritId && (
        <label className="dashboard-spirit-picker">
          <input type="checkbox" checked={includeUniques} onChange={(e) => setIncludeUniques(e.target.checked)} />
          Fold this spirit's unique powers into the Minor deck (hypothetical — uniques start in hand)
        </label>
      )}

      {!chartVariant && segmentSwitch}

      {activeComposition && (
        <div className="dashboard-deck">
          <p className="dashboard-deck-size">{activeComposition.deckSize} cards</p>
          <label className={chartVariant ? 'deckchart-b-filterpill deckchart-b-drawpill' : 'dashboard-draw-stepper'}>
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
          {chartVariant ? (
            <DeckChartVariantView variant={chartVariant} composition={activeComposition} highlightElements={highlightElements} />
          ) : (
            <DeckElementBars composition={activeComposition} highlightElements={highlightElements} />
          )}
          <p className="dashboard-assumption">Odds assume a full deck, nothing drawn.</p>

          {!chartVariant && (
            <>
              <h3>Element combinations</h3>
              <DeckCombinationMatrix combinations={activeComposition.combinations} highlightElements={highlightElements} />
            </>
          )}

          {chartVariant !== 'B' && (
            <>
              <h3>Facets</h3>
              <DeckFacets composition={activeComposition} />
            </>
          )}
        </div>
      )}
      {segment === 'Fear' && (
        <div className="dashboard-deck">
          <p className="dashboard-deck-size">{fearCardsInPlay.length} cards</p>
          <p className="dashboard-assumption">
            The in-play fear deck is a small hidden subset of this pool, built at setup — these are pool odds, never a card counter.
          </p>

          <h3>By fear tag</h3>
          <DeckPoolBreakdown groups={fearByTag} poolSize={fearCardsInPlay.length} />

          <h3>By expansion</h3>
          <DeckPoolBreakdown groups={fearByExpansion} poolSize={fearCardsInPlay.length} />
        </div>
      )}
      {segment === 'Event' && (
        <div className="dashboard-deck">
          <p className="dashboard-deck-size">{eventCardsInPlay.length} cards</p>
          {eventCardsInPlay.length === 0 ? (
            <p className="dashboard-empty-rule">No events in this set — the base game ships none; this reads as a rule of the game, not a bug.</p>
          ) : (
            <>
              <h3>By event class</h3>
              <DeckPoolBreakdown groups={eventByClass} poolSize={eventCardsInPlay.length} />

              <h3>By expansion</h3>
              <DeckPoolBreakdown groups={eventByExpansion} poolSize={eventCardsInPlay.length} />
            </>
          )}
        </div>
      )}
      {chartVariant && (
        <div className="variant-switcher-stack">
          <DeckChartVariantSwitcher current={chartVariant} onPick={setChartVariant} />
        </div>
      )}
    </section>
  )
}
