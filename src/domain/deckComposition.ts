import { ELEMENTS, type Element, type PowerCard } from './types'

export interface ElementCount {
  element: Element
  count: number
  share: number
  /** deck-dashboard #07: exact hypergeometric "at least one among `drawCount` draws" chance,
   * for a full, untouched deck. */
  probability: number
}

export interface ElementCombinationGroup {
  /** Canonical ELEMENTS order, regardless of the input cards' own element order. Empty means
   * the "No element" group. */
  elements: Element[]
  label: string
  count: number
}

export interface SpeedSplit {
  fast: number
  slow: number
}

export interface CostBucket {
  cost: number
  count: number
}

export interface DeckComposition {
  deckSize: number
  /** The requested N, clamped to [1, deckSize] (0 when the deck itself is empty). */
  drawCount: number
  elements: ElementCount[]
  /** deck-dashboard #09: each card's exact element set (UpSet-style dot-matrix rows), sorted by
   * frequency descending; ties keep first-seen order (stable sort). Counts sum to deckSize. */
  combinations: ElementCombinationGroup[]
  /** deck-dashboard #09: the deck's fast/slow tempo split. */
  speedSplit: SpeedSplit
  /** deck-dashboard #09: cost buckets ascending; a cost no card has gets no bucket. */
  costDistribution: CostBucket[]
}

/**
 * P(at least one of the `k` cards carrying an element among `n` draws from a `deckSize`-card
 * deck), without replacement. Computed as 1 minus the "every draw misses" product, term by term
 * (`(deckSize-k-i)/(deckSize-i)` for i in [0, n)) rather than via `nCr`, so it never overflows or
 * loses precision on real deck sizes. A negative numerator means missing entirely is already
 * impossible, so the miss-probability is 0 and this element's odds are certain (1).
 */
function probAtLeastOne(deckSize: number, k: number, n: number): number {
  if (deckSize <= 0 || k <= 0) return 0
  let missProbability = 1
  for (let i = 0; i < n; i++) {
    const numerator = deckSize - k - i
    if (numerator < 0) return 1
    missProbability *= numerator / (deckSize - i)
  }
  return 1 - missProbability
}

/** Canonical-order element set for a card, e.g. ['Air', 'Fire'] -> ['Fire', 'Air'] — the input
 * order on a card is incidental transcription order, never a fact worth preserving. */
function canonicalElementSet(card: PowerCard): Element[] {
  return ELEMENTS.filter((element) => card.elements.includes(element))
}

function combinationGroups(cards: PowerCard[]): ElementCombinationGroup[] {
  const byKey = new Map<string, ElementCombinationGroup>()
  for (const card of cards) {
    const elements = canonicalElementSet(card)
    const key = elements.join(',')
    const existing = byKey.get(key)
    if (existing) existing.count += 1
    else byKey.set(key, { elements, label: elements.length === 0 ? 'No element' : elements.join(' + '), count: 1 })
  }
  // Stable sort: Array.prototype.sort preserves relative order of ties, so first-seen order
  // survives among equal counts.
  return [...byKey.values()].sort((a, b) => b.count - a.count)
}

function speedSplit(cards: PowerCard[]): SpeedSplit {
  let fast = 0
  let slow = 0
  for (const card of cards) {
    if (card.speed === 'Fast') fast += 1
    else slow += 1
  }
  return { fast, slow }
}

function costDistribution(cards: PowerCard[]): CostBucket[] {
  const byCost = new Map<number, number>()
  for (const card of cards) byCost.set(card.cost, (byCost.get(card.cost) ?? 0) + 1)
  return [...byCost.entries()]
    .sort(([a], [b]) => a - b)
    .map(([cost, count]) => ({ cost, count }))
}

/**
 * v6 #06/#07/#09 (deck-dashboard): pure counts, draw odds, element combinations and secondary
 * facets over a power-card set the caller has already narrowed to a kind (minor/major) and an
 * expansion set. Every one of the 8 canonical ELEMENTS gets a row, zero-count included — an
 * absent element must read as a fact (PRD user story 15), never a missing row. `share` and
 * `probability` are 0 when the deck is empty, never NaN. `drawCount` is the caller's requested N
 * clamped to [1, deckSize] (PRD: "N is clamped to [1, deck size]") — the returned value is what
 * the UI's stepper and assumption label should report, not the raw request.
 */
export function computeDeckComposition(cards: PowerCard[], requestedDrawCount: number): DeckComposition {
  const deckSize = cards.length
  const drawCount = deckSize === 0 ? 0 : Math.min(Math.max(requestedDrawCount, 1), deckSize)
  const elements = ELEMENTS.map((element) => {
    const count = cards.filter((c) => c.elements.includes(element)).length
    return {
      element,
      count,
      share: deckSize === 0 ? 0 : count / deckSize,
      probability: probAtLeastOne(deckSize, count, drawCount),
    }
  })
  return {
    deckSize,
    drawCount,
    elements,
    combinations: combinationGroups(cards),
    speedSplit: speedSplit(cards),
    costDistribution: costDistribution(cards),
  }
}
