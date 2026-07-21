import { ELEMENTS, type Element, type PowerCard } from './types'

export interface ElementCount {
  element: Element
  count: number
  share: number
  /** deck-dashboard #07: exact hypergeometric "at least one among `drawCount` draws" chance,
   * for a full, untouched deck. Equal to `gapOdds[0]`. */
  probability: number
  /** deck-dashboard #14: exact hypergeometric "at least k among `drawCount` draws" chance for
   * k = 1, 2, 3, full deck, nothing drawn. `gapOdds[0]` === `probability`. */
  gapOdds: [number, number, number]
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

/** Exact `n choose r`, computed incrementally so every intermediate product is itself a whole
 * binomial coefficient (`result * (n-i) / (i+1)` divides evenly at each step) — no factorial
 * blowup, no precision loss, for the deck sizes this app ever sees. */
function nCr(n: number, r: number): bigint {
  if (r < 0 || r > n || n < 0) return 0n
  const k = Math.min(r, n - r)
  let result = 1n
  for (let i = 0; i < k; i++) {
    result = (result * BigInt(n - i)) / BigInt(i + 1)
  }
  return result
}

/**
 * P(at least `minHits` of the `elementCount` element-carrying cards among `n` draws from a
 * `deckSize`-card deck), without replacement (exact hypergeometric tail). Computed as
 * 1 - P(X < minHits), summing the hypergeometric pmf via exact `nCr` — safe from overflow because
 * every combinatorial call converts to `Number` only in the final ratio, not mid-computation.
 */
function probAtLeast(deckSize: number, elementCount: number, n: number, minHits: number): number {
  if (deckSize <= 0 || elementCount <= 0) return 0
  const total = nCr(deckSize, n)
  if (total === 0n) return 0
  let belowMinHits = 0n
  for (let hits = 0; hits < minHits; hits++) {
    belowMinHits += nCr(elementCount, hits) * nCr(deckSize - elementCount, n - hits)
  }
  return 1 - Number(belowMinHits) / Number(total)
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
    const gapOdds: [number, number, number] = [
      probAtLeast(deckSize, count, drawCount, 1),
      probAtLeast(deckSize, count, drawCount, 2),
      probAtLeast(deckSize, count, drawCount, 3),
    ]
    return {
      element,
      count,
      share: deckSize === 0 ? 0 : count / deckSize,
      probability: gapOdds[0],
      gapOdds,
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
