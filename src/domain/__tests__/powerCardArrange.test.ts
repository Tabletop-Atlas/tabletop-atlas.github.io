import { describe, expect, it } from 'vitest'
import { groupPowerCards, sortPowerCards } from '../powerCardArrange'
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

// Costs deliberately out of order, with a tie (B and D at cost 1) to pin stability.
const cheapB = card({ name: 'B', cost: 1, speed: 'Slow', elements: ['Fire'] })
const pricey = card({ name: 'A', cost: 4, speed: 'Fast', elements: ['Sun', 'Fire'] })
const free = card({ name: 'C', cost: 0, speed: 'Fast', elements: ['Moon'] })
const cheapD = card({ name: 'D', cost: 1, speed: 'Slow', elements: [] })

const CARDS = [cheapB, pricey, free, cheapD]

describe('sortPowerCards', () => {
  it("'none' keeps input order", () => {
    expect(sortPowerCards(CARDS, 'none').map((c) => c.name)).toEqual(['B', 'A', 'C', 'D'])
  })

  it("'cost-asc' sorts ascending; ties keep input order", () => {
    expect(sortPowerCards(CARDS, 'cost-asc').map((c) => c.name)).toEqual(['C', 'B', 'D', 'A'])
  })

  it("'cost-desc' sorts descending; ties keep input order", () => {
    expect(sortPowerCards(CARDS, 'cost-desc').map((c) => c.name)).toEqual(['A', 'B', 'D', 'C'])
  })

  it('returns a copy, never mutating the input', () => {
    const input = [...CARDS]
    sortPowerCards(input, 'cost-asc')
    expect(input.map((c) => c.name)).toEqual(['B', 'A', 'C', 'D'])
  })
})

describe('groupPowerCards by cost', () => {
  it('labels groups "Cost N" ascending; cards within a group keep input order', () => {
    expect(groupPowerCards(CARDS, 'cost')).toEqual([
      { label: 'Cost 0', cards: [free] },
      { label: 'Cost 1', cards: [cheapB, cheapD] },
      { label: 'Cost 4', cards: [pricey] },
    ])
  })

  it('omits costs no card has — no empty groups', () => {
    const labels = groupPowerCards([free, pricey], 'cost').map((g) => g.label)
    expect(labels).toEqual(['Cost 0', 'Cost 4'])
  })
})

describe('groupPowerCards by speed', () => {
  it('groups Fast then Slow; cards within a group keep input order', () => {
    expect(groupPowerCards(CARDS, 'speed')).toEqual([
      { label: 'Fast', cards: [pricey, free] },
      { label: 'Slow', cards: [cheapB, cheapD] },
    ])
  })

  it('omits a speed no card has', () => {
    expect(groupPowerCards([cheapB], 'speed')).toEqual([{ label: 'Slow', cards: [cheapB] }])
  })
})

describe('groupPowerCards by element', () => {
  it('a multi-element card appears under EVERY element it carries; groups follow the canonical element order', () => {
    // Canonical order is Sun, Moon, Fire, … — pricey carries Sun+Fire so it shows up twice.
    expect(groupPowerCards([cheapB, pricey, free], 'element')).toEqual([
      { label: 'Sun', cards: [pricey] },
      { label: 'Moon', cards: [free] },
      { label: 'Fire', cards: [cheapB, pricey] },
    ])
  })

  it('cards with no elements land in a trailing "No element" group (3 such cards exist in the real deck)', () => {
    expect(groupPowerCards(CARDS, 'element')).toEqual([
      { label: 'Sun', cards: [pricey] },
      { label: 'Moon', cards: [free] },
      { label: 'Fire', cards: [cheapB, pricey] },
      { label: 'No element', cards: [cheapD] },
    ])
  })

  it('omits elements no card carries — no empty groups', () => {
    expect(groupPowerCards([free], 'element')).toEqual([{ label: 'Moon', cards: [free] }])
  })
})
