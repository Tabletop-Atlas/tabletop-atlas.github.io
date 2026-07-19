import { describe, expect, it } from 'vitest'
import { computeDeckComposition } from '../deckComposition'
import type { PowerCard } from '../types'

function card(overrides: Partial<PowerCard> & Pick<PowerCard, 'name'>): PowerCard {
  return {
    kind: 'minor',
    expansion: 'Basegame',
    cost: 1,
    speed: 'Fast',
    elements: [],
    image: 'cards/minor/x.webp',
    ...overrides,
  } as PowerCard
}

describe('computeDeckComposition', () => {
  it('reports deck size and, for every card, counts it under each element it carries', () => {
    const cards = [
      card({ name: 'A', elements: ['Fire'] }),
      card({ name: 'B', elements: ['Fire', 'Air'] }),
      card({ name: 'C', elements: [] }),
    ]
    const result = computeDeckComposition(cards, 4)
    expect(result.deckSize).toBe(3)
    const byElement = Object.fromEntries(result.elements.map((e) => [e.element, e.count]))
    expect(byElement).toEqual({ Sun: 0, Moon: 0, Fire: 2, Air: 1, Water: 0, Earth: 0, Plant: 0, Animal: 0 })
  })

  it('produces a row for every one of the 8 canonical elements, zero-count included', () => {
    const result = computeDeckComposition([card({ name: 'A', elements: ['Fire'] })], 4)
    expect(result.elements).toHaveLength(8)
    expect(result.elements.map((e) => e.element)).toEqual(['Sun', 'Moon', 'Fire', 'Air', 'Water', 'Earth', 'Plant', 'Animal'])
  })

  it('shares are count / deckSize', () => {
    const cards = [card({ name: 'A', elements: ['Fire'] }), card({ name: 'B', elements: [] }), card({ name: 'C', elements: [] }), card({ name: 'D', elements: [] })]
    const result = computeDeckComposition(cards, 4)
    expect(result.elements.find((e) => e.element === 'Fire')!.share).toBeCloseTo(0.25)
    expect(result.elements.find((e) => e.element === 'Sun')!.share).toBe(0)
  })

  it('an empty card set gives deckSize 0 and every share and probability 0, never NaN', () => {
    const result = computeDeckComposition([], 4)
    expect(result.deckSize).toBe(0)
    expect(result.elements.every((e) => e.count === 0 && e.share === 0 && e.probability === 0)).toBe(true)
    expect(result.drawCount).toBe(0)
  })

  describe('draw odds (deck-dashboard #07)', () => {
    // 5-card deck, 2 carrying Fire, draw 2 -> exactly hand-checkable: 1 - C(3,2)/C(5,2) = 1 - 3/10 = 0.7
    function fiveCardDeck() {
      return [
        card({ name: 'A', elements: ['Fire'] }),
        card({ name: 'B', elements: ['Fire'] }),
        card({ name: 'C', elements: [] }),
        card({ name: 'D', elements: [] }),
        card({ name: 'E', elements: [] }),
      ]
    }

    it('is the exact hypergeometric "at least one" chance on a hand-checkable fixture', () => {
      const result = computeDeckComposition(fiveCardDeck(), 2)
      expect(result.elements.find((e) => e.element === 'Fire')!.probability).toBeCloseTo(0.7)
    })

    it('is 0 for an element no card carries (k = 0)', () => {
      const result = computeDeckComposition(fiveCardDeck(), 2)
      expect(result.elements.find((e) => e.element === 'Air')!.probability).toBe(0)
    })

    it('clamps N to 1 at the low end', () => {
      const result = computeDeckComposition(fiveCardDeck(), 0)
      expect(result.drawCount).toBe(1)
      // 1 draw, 2 of 5 carry Fire -> 2/5 = 0.4
      expect(result.elements.find((e) => e.element === 'Fire')!.probability).toBeCloseTo(0.4)
    })

    it('clamps N to the deck size at the high end', () => {
      const result = computeDeckComposition(fiveCardDeck(), 99)
      expect(result.drawCount).toBe(5)
      // drawing the whole deck guarantees every card carrying the element is seen
      expect(result.elements.find((e) => e.element === 'Fire')!.probability).toBe(1)
    })

    it('is 1 whenever a miss is impossible (N large enough that every card without the element is exhausted)', () => {
      // 5-card deck, 2 with Fire, draw 4 -> at most 3 cards can be non-Fire, so a miss is impossible
      const result = computeDeckComposition(fiveCardDeck(), 4)
      expect(result.elements.find((e) => e.element === 'Fire')!.probability).toBe(1)
    })
  })

  describe('element combinations (deck-dashboard #09)', () => {
    it('groups cards by their exact element set, sorted by frequency descending', () => {
      const cards = [
        card({ name: 'A', elements: ['Fire', 'Air'] }),
        card({ name: 'B', elements: ['Fire', 'Air'] }),
        card({ name: 'C', elements: ['Fire', 'Air'] }),
        card({ name: 'D', elements: ['Water'] }),
        card({ name: 'E', elements: ['Water'] }),
        card({ name: 'F', elements: ['Sun'] }),
      ]
      const result = computeDeckComposition(cards, 4)
      expect(result.combinations).toEqual([
        { elements: ['Fire', 'Air'], label: 'Fire + Air', count: 3 },
        { elements: ['Water'], label: 'Water', count: 2 },
        { elements: ['Sun'], label: 'Sun', count: 1 },
      ])
    })

    it('labels a card\'s element set in canonical ELEMENTS order regardless of input order', () => {
      const result = computeDeckComposition([card({ name: 'A', elements: ['Air', 'Fire'] })], 4)
      expect(result.combinations).toEqual([{ elements: ['Fire', 'Air'], label: 'Fire + Air', count: 1 }])
    })

    it('groups element-less cards under "No element", present only when such cards exist', () => {
      const withNone = computeDeckComposition([card({ name: 'A', elements: [] }), card({ name: 'B', elements: ['Fire'] })], 4)
      expect(withNone.combinations).toContainEqual({ elements: [], label: 'No element', count: 1 })

      const withoutNone = computeDeckComposition([card({ name: 'A', elements: ['Fire'] })], 4)
      expect(withoutNone.combinations.some((g) => g.label === 'No element')).toBe(false)
    })

    it('group counts sum to deck size — no card dropped, no card double-counted', () => {
      const cards = [
        card({ name: 'A', elements: ['Fire', 'Air'] }),
        card({ name: 'B', elements: ['Fire'] }),
        card({ name: 'C', elements: [] }),
        card({ name: 'D', elements: ['Sun', 'Moon', 'Fire'] }),
      ]
      const result = computeDeckComposition(cards, 4)
      expect(result.combinations.reduce((sum, g) => sum + g.count, 0)).toBe(cards.length)
    })

    it('an empty deck has no combination groups', () => {
      expect(computeDeckComposition([], 4).combinations).toEqual([])
    })
  })

  describe('speed split and cost distribution (deck-dashboard #09)', () => {
    it('splits fast vs slow', () => {
      const cards = [
        card({ name: 'A', speed: 'Fast' }),
        card({ name: 'B', speed: 'Fast' }),
        card({ name: 'C', speed: 'Slow' }),
      ]
      const result = computeDeckComposition(cards, 4)
      expect(result.speedSplit).toEqual({ fast: 2, slow: 1 })
    })

    it('buckets cost ascending, omitting costs no card has', () => {
      const cards = [card({ name: 'A', cost: 3 }), card({ name: 'B', cost: 0 }), card({ name: 'C', cost: 3 })]
      const result = computeDeckComposition(cards, 4)
      expect(result.costDistribution).toEqual([
        { cost: 0, count: 1 },
        { cost: 3, count: 2 },
      ])
    })

    it('an empty deck has a zero fast/slow split and no cost buckets', () => {
      const result = computeDeckComposition([], 4)
      expect(result.speedSplit).toEqual({ fast: 0, slow: 0 })
      expect(result.costDistribution).toEqual([])
    })
  })
})
