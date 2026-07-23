import { computeDeckComposition, probAtLeast } from './deckComposition'
import { innateThresholdsFor, thresholdElements, type SpiritInnateThresholds } from './innateThresholds'
import type { Element, InnatePower, PowerCard, Spirit } from './types'

export interface ElementDemandRow {
  element: Element
  /** True when any rung of any of this spirit's innates names this element. The view collapses
   * the rest into a footer line — they are returned, never dropped (same discipline as
   * `computeDeckComposition`'s zero-count rows: an absent demand is a fact). */
  demanded: boolean
  /** What the *lowest* rung naming this element asks for — "what gets an innate online at all"
   * (ADR 0013). Absent when no first rung names it, even though a later rung does: Lightning's
   * Swift Strike wants Water only from rung III, and must not read as "wants 1 Water". */
  demand?: number
  /** The most any rung asks for — the ceiling mark behind the demand bar. Absent iff undemanded.
   * Note `demand` mins across innates while this maxes: for a spirit whose two innates both open
   * on one element, the pair spans both innates and matches neither on its own. That is the
   * intent — the bar reads "cheapest thing this unlocks" to "most this spirit ever wants". */
  ceiling?: number
  /** The spirit's *printed* `elements`. Distinct from demand on purpose: 29 of 37 spirits have
   * innates demanding an element they have no affinity for, and that gap is the view's point. */
  affinity: boolean
  /** Cards in the pool carrying this element. */
  supply: number
  /** P(at least `demand` of them among `drawCount` draws), full pool, nothing drawn. Absent iff
   * `demand` is — never a fabricated stand-in for an element with nothing to reach for. */
  odds?: number
}

export interface MultiHitBuckets {
  none: number
  one: number
  twoPlus: number
}

export interface ElementDemandSupply {
  poolSize: number
  /** The caller's N clamped to [1, poolSize], 0 for an empty pool — same contract as
   * `computeDeckComposition.drawCount`, so the two never disagree about what N is. */
  drawCount: number
  /** All 8 canonical elements, in ELEMENTS order. */
  elements: ElementDemandRow[]
  /** How many pool cards carry none / exactly one / two-or-more *demanded* elements. Exact counts
   * over the pool, not a joint draw probability — joint multi-element probabilities stay rejected
   * (deck-dashboard #05). */
  multiHit: MultiHitBuckets
  /** Passed through from `innateThresholdsFor`; the view captions base-spirit-only thresholds. */
  aspectModifiesInnates: boolean
}

/** First-rung demand per element: the smallest count any innate's *opening* rung asks for. Min,
 * not max, because two innates opening on the same element are two separate things to switch on,
 * and the lower number is the one that turns something on. */
function firstRungDemand(thresholds: SpiritInnateThresholds): Map<Element, number> {
  const demand = new Map<Element, number>()
  for (const power of thresholds.powers) {
    const first = power.thresholds[0]
    if (!first) continue
    for (const [element, count] of Object.entries(first) as [Element, number][]) {
      const existing = demand.get(element)
      demand.set(element, existing === undefined ? count : Math.min(existing, count))
    }
  }
  return demand
}

/** The most any rung of any innate asks for, per element. Which elements appear at all is
 * `thresholdElements`'s job, not this one's. */
function highestRungDemand(thresholds: SpiritInnateThresholds): Map<Element, number> {
  const ceiling = new Map<Element, number>()
  for (const power of thresholds.powers) {
    for (const rung of power.thresholds) {
      for (const [element, count] of Object.entries(rung) as [Element, number][]) {
        ceiling.set(element, Math.max(ceiling.get(element) ?? 0, count))
      }
    }
  }
  return ceiling
}

function bucketByDemandedHits(cards: PowerCard[], demandedElements: ReadonlySet<Element>): MultiHitBuckets {
  const buckets: MultiHitBuckets = { none: 0, one: 0, twoPlus: 0 }
  for (const card of cards) {
    const hits = card.elements.filter((element) => demandedElements.has(element)).length
    if (hits === 0) buckets.none += 1
    else if (hits === 1) buckets.one += 1
    else buckets.twoPlus += 1
  }
  return buckets
}

/**
 * element-demand #01: what a picked spirit's innates demand, set against what a card pool supplies
 * — the Dashboard's Minor/Major subject (ADR 0013, `CONTEXT.md` → "Element demand / supply").
 *
 * Deck-wide element aggregates are uniform by design (38–39 of 101 minors per element), so nothing
 * here is meaningful unconditioned; the whole module takes a spirit or returns `undefined`. Both
 * halves are composed, not re-derived: the demand side from `innateThresholdsFor` /
 * `thresholdElements`, the supply side wholesale from `computeDeckComposition` — this module owns
 * only the join between them, and the demand-indexed reindexing of the draw odds.
 *
 * The caller narrows `cards` to a kind and expansion set first, exactly as it does for
 * `computeDeckComposition`.
 */
export function computeElementDemand(
  spiritId: string,
  spirits: Spirit[],
  innatePowers: InnatePower[],
  cards: PowerCard[],
  requestedDrawCount: number,
  aspectName?: string,
): ElementDemandSupply | undefined {
  const thresholds = innateThresholdsFor(spiritId, spirits, innatePowers, aspectName)
  if (!thresholds) return undefined

  const affinity = new Set(spirits.find((s) => s.id === spiritId)?.elements ?? [])
  const demand = firstRungDemand(thresholds)
  const ceiling = highestRungDemand(thresholds)
  const demanded = thresholdElements(thresholds)

  // Supply, the draw-count clamp and the canonical element order all come from here rather than
  // being recomputed — the two modules render the same tab and must never disagree about N.
  const { deckSize, drawCount, elements: supply } = computeDeckComposition(cards, requestedDrawCount)

  const elements = supply.map(({ element, count }): ElementDemandRow => {
    const want = demand.get(element)
    return {
      element,
      demanded: demanded.has(element),
      demand: want,
      ceiling: ceiling.get(element),
      affinity: affinity.has(element),
      supply: count,
      // Demand above `drawCount` is not an error — it is a real 0, and worth showing as one.
      odds: want === undefined ? undefined : probAtLeast(deckSize, count, drawCount, want),
    }
  })

  return {
    poolSize: deckSize,
    drawCount,
    elements,
    multiHit: bucketByDemandedHits(cards, demanded),
    aspectModifiesInnates: thresholds.aspectModifiesInnates,
  }
}
