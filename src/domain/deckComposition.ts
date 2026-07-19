import { ELEMENTS, type Element, type PowerCard } from './types'

export interface ElementCount {
  element: Element
  count: number
  share: number
}

export interface DeckComposition {
  deckSize: number
  elements: ElementCount[]
}

/**
 * v6 #06 (deck-dashboard walking skeleton): pure counts over a power-card set the caller has
 * already narrowed to a kind (minor/major) and an expansion set. Every one of the 8 canonical
 * ELEMENTS gets a row, zero-count included — an absent element must read as a fact (PRD user
 * story 15), never a missing row. `share` is 0 when the deck is empty, never NaN.
 */
export function computeDeckComposition(cards: PowerCard[]): DeckComposition {
  const deckSize = cards.length
  const elements = ELEMENTS.map((element) => {
    const count = cards.filter((c) => c.elements.includes(element)).length
    return { element, count, share: deckSize === 0 ? 0 : count / deckSize }
  })
  return { deckSize, elements }
}
