import { ELEMENTS, type Element, type PowerCard } from './types'

export interface ElementCount {
  element: Element
  count: number
  share: number
  /** deck-dashboard #07: exact hypergeometric "at least one among `drawCount` draws" chance,
   * for a full, untouched deck. */
  probability: number
}

export interface DeckComposition {
  deckSize: number
  /** The requested N, clamped to [1, deckSize] (0 when the deck itself is empty). */
  drawCount: number
  elements: ElementCount[]
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

/**
 * v6 #06/#07 (deck-dashboard): pure counts and draw odds over a power-card set the caller has
 * already narrowed to a kind (minor/major) and an expansion set. Every one of the 8 canonical
 * ELEMENTS gets a row, zero-count included — an absent element must read as a fact (PRD user
 * story 15), never a missing row. `share` and `probability` are 0 when the deck is empty, never
 * NaN. `drawCount` is the caller's requested N clamped to [1, deckSize] (PRD: "N is clamped to
 * [1, deck size]") — the returned value is what the UI's stepper and assumption label should
 * report, not the raw request.
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
  return { deckSize, drawCount, elements }
}
