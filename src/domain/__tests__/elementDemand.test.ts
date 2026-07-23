import { describe, expect, it } from 'vitest'
import innatePowersData from '../../data/innate-powers.json'
import powerCardsData from '../../data/power-cards.json'
import spiritsData from '../../data/spirits.json'
import { computeElementDemand, type ElementDemandSupply } from '../elementDemand'
import type { Element, InnatePower, PowerCard, Spirit } from '../types'

const SPIRITS = spiritsData as Spirit[]
const INNATE_POWERS = innatePowersData as InnatePower[]
const MINORS = (powerCardsData as PowerCard[]).filter((c) => c.kind === 'minor')

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

function innate(spiritId: string, thresholds: InnatePower['thresholds']): InnatePower {
  return { spirit: spiritId, name: `${spiritId} innate`, speed: 'Fast', thresholds, source: 'wiki+tts' }
}

function spirit(id: string, elements: Element[]): Spirit {
  return { id, name: id, expansion: 'Base', complexity: 'Low', elements, aspects: [] } as unknown as Spirit
}

/** Every case below picks a spirit that exists; `undefined` is its own test. */
function must(result: ElementDemandSupply | undefined): ElementDemandSupply {
  if (!result) throw new Error('expected a result for a known spirit')
  return result
}

function elementOf(result: ElementDemandSupply, element: Element) {
  const row = result.elements.find((e) => e.element === element)
  if (!row) throw new Error(`no row for ${element}`)
  return row
}

describe('computeElementDemand', () => {
  it('takes demand from the first rung and the ceiling from the highest', () => {
    const powers = [innate('s', [{ Fire: 3 }, { Fire: 4 }, { Fire: 5 }])]
    const result = must(computeElementDemand('s', [spirit('s', ['Fire'])], powers, [card({ name: 'A', elements: ['Fire'] })], 1))
    expect(elementOf(result, 'Fire').demand).toBe(3)
    expect(elementOf(result, 'Fire').ceiling).toBe(5)
  })

  it('gives an element demanded only at a later rung a ceiling but no demand figure', () => {
    const powers = [innate('s', [{ Fire: 3 }, { Fire: 4, Water: 1 }, { Fire: 5, Water: 2 }])]
    const result = must(computeElementDemand('s', [spirit('s', ['Fire'])], powers, [card({ name: 'A', elements: ['Water'] })], 1))
    const water = elementOf(result, 'Water')
    expect(water.demand).toBeUndefined()
    expect(water.ceiling).toBe(2)
    expect(water.demanded).toBe(true)
  })

  it('takes the lowest first-rung count when two innates both open on the same element', () => {
    const powers = [innate('s', [{ Fire: 2 }]), innate('s', [{ Fire: 3 }])]
    const result = must(computeElementDemand('s', [spirit('s', ['Fire'])], powers, [card({ name: 'A', elements: ['Fire'] })], 1))
    expect(elementOf(result, 'Fire').demand).toBe(2)
    expect(elementOf(result, 'Fire').ceiling).toBe(3)
  })

  it('returns every canonical element, flagging the undemanded rather than dropping them', () => {
    const powers = [innate('s', [{ Fire: 1 }])]
    const result = must(computeElementDemand('s', [spirit('s', ['Fire'])], powers, [card({ name: 'A', elements: ['Moon'] })], 1))
    expect(result.elements).toHaveLength(8)
    expect(elementOf(result, 'Moon').demanded).toBe(false)
    expect(elementOf(result, 'Moon').ceiling).toBeUndefined()
    expect(elementOf(result, 'Moon').supply).toBe(1)
  })

  it('marks demanded elements the spirit has no printed affinity for', () => {
    const powers = [innate('s', [{ Fire: 1, Water: 1 }])]
    const result = must(computeElementDemand('s', [spirit('s', ['Fire'])], powers, [], 1))
    expect(elementOf(result, 'Fire').affinity).toBe(true)
    expect(elementOf(result, 'Water').affinity).toBe(false)
  })

  it('buckets cards by how many demanded elements they carry', () => {
    const powers = [innate('s', [{ Fire: 1, Air: 1 }])]
    const cards = [
      card({ name: 'none', elements: ['Moon'] }),
      card({ name: 'one', elements: ['Fire', 'Moon'] }),
      card({ name: 'two', elements: ['Fire', 'Air'] }),
      card({ name: 'empty', elements: [] }),
    ]
    const result = must(computeElementDemand('s', [spirit('s', ['Fire'])], powers, cards, 4))
    expect(result.multiHit).toEqual({ none: 2, one: 1, twoPlus: 1 })
  })

  it('indexes draw odds to each element’s own demand', () => {
    const powers = [innate('s', [{ Fire: 2, Air: 1 }])]
    const cards = [
      card({ name: 'A', elements: ['Fire', 'Air'] }),
      card({ name: 'B', elements: ['Fire'] }),
      card({ name: 'C', elements: [] }),
      card({ name: 'D', elements: [] }),
    ]
    // Drawing all 4 cards: both Fire cards and the one Air card are certain.
    const result = must(computeElementDemand('s', [spirit('s', ['Fire'])], powers, cards, 4))
    expect(elementOf(result, 'Fire').odds).toBeCloseTo(1)
    expect(elementOf(result, 'Air').odds).toBeCloseTo(1)
  })

  it('returns a real probability, not undefined, when demand exceeds the draw count', () => {
    const powers = [innate('s', [{ Fire: 3 }])]
    const cards = [card({ name: 'A', elements: ['Fire'] }), card({ name: 'B', elements: ['Fire'] })]
    const result = must(computeElementDemand('s', [spirit('s', ['Fire'])], powers, cards, 1))
    expect(elementOf(result, 'Fire').odds).toBe(0)
  })

  it('leaves odds absent for an element with no first-rung demand', () => {
    const powers = [innate('s', [{ Fire: 1 }, { Water: 1 }])]
    const result = must(computeElementDemand('s', [spirit('s', ['Fire'])], powers, [card({ name: 'A', elements: ['Water'] })], 1))
    expect(elementOf(result, 'Water').odds).toBeUndefined()
  })

  it('handles a spirit with no innate powers without throwing', () => {
    const result = must(computeElementDemand('s', [spirit('s', ['Fire'])], [], [card({ name: 'A', elements: ['Fire'] })], 4))
    expect(result.elements.every((e) => !e.demanded)).toBe(true)
    expect(result.multiHit).toEqual({ none: 1, one: 0, twoPlus: 0 })
  })

  it('handles an empty card pool without throwing or producing NaN', () => {
    const powers = [innate('s', [{ Fire: 2 }])]
    const result = must(computeElementDemand('s', [spirit('s', ['Fire'])], powers, [], 4))
    expect(result.poolSize).toBe(0)
    expect(result.drawCount).toBe(0)
    expect(elementOf(result, 'Fire').supply).toBe(0)
    expect(elementOf(result, 'Fire').odds).toBe(0)
    expect(result.multiHit).toEqual({ none: 0, one: 0, twoPlus: 0 })
  })

  it('returns undefined for a spirit id the dataset does not know', () => {
    expect(computeElementDemand('nope', [spirit('s', ['Fire'])], [], [], 4)).toBeUndefined()
  })

  it('carries the aspect-modifies-innates flag through from innateThresholds, for the selected aspect', () => {
    const modified = {
      ...spirit('s', ['Fire']),
      aspects: [{ name: 'A', delta: 'Replaces its Innate power.', expansion: 'Base' }],
    } as Spirit
    const result = must(computeElementDemand('s', [modified], [innate('s', [{ Fire: 1 }])], [], 4, 'A'))
    expect(result.aspectModifiesInnates).toBe(true)
  })
})

// Tripwire against the shipped data, per ADR 0003: these numbers are the reason the Dashboard
// stopped showing deck-wide element aggregates (ADR 0013). If they drift, the view's premise has
// changed and must be re-argued, not silently re-rendered.
describe('computeElementDemand over the shipped data', () => {
  const lightning = () => must(computeElementDemand('lightnings-swift-strike', SPIRITS, INNATE_POWERS, MINORS, 4))

  it('pins minor-deck element supply as near-uniform', () => {
    const result = lightning()
    expect(result.poolSize).toBe(101)
    for (const row of result.elements) {
      expect(row.supply).toBeGreaterThanOrEqual(38)
      expect(row.supply).toBeLessThanOrEqual(39)
    }
  })

  it('pins the multi-hit spread across the widest and narrowest spirits', () => {
    const narrow = must(computeElementDemand('sun-bright-whirlwind', SPIRITS, INNATE_POWERS, MINORS, 4))
    const wide = must(computeElementDemand('starlight-seeks-its-form', SPIRITS, INNATE_POWERS, MINORS, 4))
    expect(narrow.multiHit.twoPlus).toBe(12)
    expect(wide.multiHit.twoPlus).toBe(99)
  })

  it('pins the demand-indexed odds for a 3-of-39 element in 4 of 101 draws', () => {
    const fire = elementOf(lightning(), 'Fire')
    expect(fire.demand).toBe(3)
    expect(fire.supply).toBe(39)
    expect(fire.odds).toBeCloseTo(0.159, 3)
  })

  it('pins Water as a Lightning ceiling-only demand with no affinity', () => {
    const water = elementOf(lightning(), 'Water')
    expect(water.demanded).toBe(true)
    expect(water.demand).toBeUndefined()
    expect(water.ceiling).toBe(2)
    expect(water.affinity).toBe(false)
  })
})
