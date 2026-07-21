import { useMemo, useState } from 'react'
import innatePowersData from '../data/innate-powers.json'
import otherCardsData from '../data/other-cards.json'
import powerCardsData from '../data/power-cards.json'
import spiritsData from '../data/spirits.json'
import { collectionStore } from '../domain/collectionStore'
import { computeDeckComposition } from '../domain/deckComposition'
import { innateThresholdsFor } from '../domain/innateThresholds'
import { groupOtherCards } from '../domain/otherCardArrange'
import { EXPANSIONS, type ExpansionName, type InnatePower, type OtherCard, type PowerCard, type Spirit } from '../domain/types'
import { normalizeExpansion } from './tagColors'
import { DeckFacets } from './DeckFacets'
import { DeckGapOdds } from './DeckGapOdds'
import { DeckPoolBreakdown } from './DeckPoolBreakdown'
import { DeckUpset, type DeckUnit } from './DeckUpset'

const powerCards = powerCardsData as PowerCard[]
const MINOR_CARDS = powerCards.filter((c) => c.kind === 'minor')
const MAJOR_CARDS = powerCards.filter((c) => c.kind === 'major')
const UNIQUE_CARDS = powerCards.filter((c) => c.kind === 'unique')

const otherCards = otherCardsData as OtherCard[]
const FEAR_CARDS = otherCards.filter((c) => c.kind === 'fear')
const EVENT_CARDS = otherCards.filter((c) => c.kind === 'event')

// deck-dashboard #10: by spirit, not Configuration — element data exists at spirit level only,
// and aspects record no element changes (PRD's explicit call, not an oversight).
const SPIRITS = (spiritsData as Spirit[]).slice().sort((a, b) => a.name.localeCompare(b.name))
const INNATE_POWERS = innatePowersData as InnatePower[]

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
 * v6 #06/#07/#08/#09/#10/#11/#12, reshaped by #03's prototype rounds (owner picked the UpSet):
 * the Dashboard tab. The Minor/Major/Fear/Event switch leads the tab — the owner's call that
 * "what deck am I looking at" outranks the expansion picker. Minor and Major render `DeckUpset`
 * (composition, hypergeometric draw odds, filterable combination matrix) plus the speed/cost
 * facets; a Counts/% unit is lifted here so the UpSet and the facets always agree. An expansion
 * picker (session-only state, no storage key) defines the set, defaulting to the Collection;
 * unowned expansions stay listed and annotated, never hidden (PRD user story 6). A single N
 * stepper (default 4, clamped to [1, deck size] by the domain module) drives both power-deck
 * segments' odds; the assumption label keeps the static dashboard from reading as live tracking
 * (PRD user story 27). An optional spirit pick (default "no spirit") highlights that spirit's own
 * recorded elements (PRD user stories 18-20), annotates the gap-odds block's rows with that
 * spirit's innate threshold requirements — captioned as base-spirit-only when an aspect changes
 * its innate(s) (#16) — and can additionally fold that spirit's unique
 * powers into the Minor pool — labelled a hypothetical, because the physical minor deck never
 * contains them (uniques start in hand). Fear and Event reuse the existing `groupOtherCards` seam
 * for their by-tag/by-class and by-expansion breakdowns and carry no valence axis — that's the
 * map's open taxonomy thread. Fear's framing copy states the pool is a hidden-subset fact, never
 * a card counter (PRD user story 25); Event's empty state (a base-game-only set) reads as a rule
 * of the game, not an error (PRD user story 26). Holds no game state — a reload always reverts to
 * the Collection default, N=4, no spirit, counts (PRD user story 28).
 */
/** `initialSegment` mirrors `TierBoard`'s `initialSubject` — lets the server-rendered smoke test
 * reach a non-default segment without simulating a click. `initialSpiritId` is the same escape
 * hatch for #16's annotated/captioned gap-odds states. */
export function DashboardTab({ initialSegment, initialSpiritId }: { initialSegment?: Segment; initialSpiritId?: string } = {}) {
  const [segment, setSegment] = useState<Segment>(initialSegment ?? 'Minor')
  const [drawCount, setDrawCount] = useState(DEFAULT_DRAW_COUNT)
  const [checkedExpansions, setCheckedExpansions] = useState<Set<ExpansionName>>(defaultCheckedExpansions)
  // '' is the default "no spirit" state (PRD user story 20) — never a storage key, never
  // persisted, so a reload always reverts to it.
  const [spiritId, setSpiritId] = useState(initialSpiritId ?? '')
  const [includeUniques, setIncludeUniques] = useState(false)
  const [unit, setUnit] = useState<DeckUnit>('count')

  const highlightElements = useMemo(() => {
    if (!spiritId) return undefined
    const spirit = SPIRITS.find((s) => s.id === spiritId)
    return spirit ? new Set(spirit.elements) : undefined
  }, [spiritId])

  const innateThresholds = useMemo(() => (spiritId ? innateThresholdsFor(spiritId, SPIRITS, INNATE_POWERS) : undefined), [spiritId])

  function toggleExpansion(expansion: ExpansionName, checked: boolean) {
    setCheckedExpansions((prev) => {
      const next = new Set(prev)
      if (checked) next.add(expansion)
      else next.delete(expansion)
      return next
    })
  }

  const spiritUniques = useMemo(
    () => (includeUniques && spiritId ? UNIQUE_CARDS.filter((c) => c.spirit === spiritId) : []),
    [includeUniques, spiritId],
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

  return (
    <section>
      <h2>Dashboard</h2>

      {/* deck-dashboard #03: the deck switch is the core "what am I looking at" control — it
       * leads the tab, above the expansion picker, at display size. */}
      <div className="dashboard-segments" role="group" aria-label="Deck">
        {SEGMENTS.map((s) => (
          <button key={s} type="button" aria-pressed={segment === s} data-active={segment === s} onClick={() => setSegment(s)}>
            {s}
          </button>
        ))}
      </div>

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

      <label className="dashboard-spirit-picker dashboard-selectpill">
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
      {spiritId && (
        <label className="dashboard-spirit-picker">
          <input type="checkbox" checked={includeUniques} onChange={(e) => setIncludeUniques(e.target.checked)} />
          Fold this spirit's unique powers into the Minor deck (hypothetical — uniques start in hand)
        </label>
      )}

      {activeComposition && (
        <div className="dashboard-deck">
          <p className="dashboard-deck-size">{activeComposition.deckSize} cards</p>
          <label className="dashboard-pill dashboard-drawpill">
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
          <DeckUpset composition={activeComposition} highlightElements={highlightElements} unit={unit} onUnitChange={setUnit} />
          <p className="dashboard-assumption">Odds assume a full deck, nothing drawn.</p>

          <h3>Facets</h3>
          <DeckFacets composition={activeComposition} unit={unit} />

          <DeckGapOdds composition={activeComposition} thresholds={innateThresholds} />
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
    </section>
  )
}
