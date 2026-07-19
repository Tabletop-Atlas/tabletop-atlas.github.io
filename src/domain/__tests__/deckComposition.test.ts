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
    const result = computeDeckComposition(cards)
    expect(result.deckSize).toBe(3)
    const byElement = Object.fromEntries(result.elements.map((e) => [e.element, e.count]))
    expect(byElement).toEqual({ Sun: 0, Moon: 0, Fire: 2, Air: 1, Water: 0, Earth: 0, Plant: 0, Animal: 0 })
  })

  it('produces a row for every one of the 8 canonical elements, zero-count included', () => {
    const result = computeDeckComposition([card({ name: 'A', elements: ['Fire'] })])
    expect(result.elements).toHaveLength(8)
    expect(result.elements.map((e) => e.element)).toEqual(['Sun', 'Moon', 'Fire', 'Air', 'Water', 'Earth', 'Plant', 'Animal'])
  })

  it('shares are count / deckSize', () => {
    const cards = [card({ name: 'A', elements: ['Fire'] }), card({ name: 'B', elements: [] }), card({ name: 'C', elements: [] }), card({ name: 'D', elements: [] })]
    const result = computeDeckComposition(cards)
    expect(result.elements.find((e) => e.element === 'Fire')!.share).toBeCloseTo(0.25)
    expect(result.elements.find((e) => e.element === 'Sun')!.share).toBe(0)
  })

  it('an empty card set gives deckSize 0 and every share 0, never NaN', () => {
    const result = computeDeckComposition([])
    expect(result.deckSize).toBe(0)
    expect(result.elements.every((e) => e.count === 0 && e.share === 0)).toBe(true)
  })
})
