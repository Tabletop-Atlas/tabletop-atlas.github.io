import { describe, expect, it } from 'vitest'
import { impactBreakdown, tagImpactBreakdown, type FearCard } from '../impactBreakdown'

function fear(name: string, impact: 1 | 2 | 3, tags: FearCard['tags']): FearCard {
  return { name, expansion: 'Base', kind: 'fear', image: '', tags, impact, impactSource: 'judgment' }
}

const CARDS: FearCard[] = [
  fear('A', 1, ['removal']),
  fear('B', 2, ['removal', 'defensive']),
  fear('C', 2, []),
  fear('D', 3, ['defensive']),
]

describe('impactBreakdown', () => {
  it('gives one bucket per impact level, zero-count included', () => {
    const buckets = impactBreakdown(CARDS)
    expect(buckets.map((b) => b.impact)).toEqual([1, 2, 3])
    expect(buckets.map((b) => b.cards.length)).toEqual([1, 2, 1])
  })

  it('computes each bucket\'s share of the pool', () => {
    const buckets = impactBreakdown(CARDS)
    expect(buckets.map((b) => b.share)).toEqual([0.25, 0.5, 0.25])
  })

  it('reads impact 1/2/3 as weak/solid/strong', () => {
    const buckets = impactBreakdown(CARDS)
    expect(buckets.map((b) => b.label)).toEqual(['weak', 'solid', 'strong'])
  })

  it('shares are 0, never NaN, for an empty pool', () => {
    const buckets = impactBreakdown([])
    expect(buckets.every((b) => b.share === 0)).toBe(true)
    expect(buckets.every((b) => b.cards.length === 0)).toBe(true)
  })
})

describe('tagImpactBreakdown', () => {
  it('crosses each tag group with impact, a multi-tag card counted in every tag it carries', () => {
    const groups = tagImpactBreakdown(CARDS)
    const removal = groups.find((g) => g.label === 'Removal')!
    expect(removal.cards.map((c) => c.name).sort()).toEqual(['A', 'B'])
    expect(removal.byImpact.find((b) => b.impact === 1)!.cards.map((c) => c.name)).toEqual(['A'])
    expect(removal.byImpact.find((b) => b.impact === 2)!.cards.map((c) => c.name)).toEqual(['B'])

    const defensive = groups.find((g) => g.label === 'Defensive')!
    expect(defensive.cards.map((c) => c.name).sort()).toEqual(['B', 'D'])
  })

  it('places untagged cards in a trailing Unclassified group', () => {
    const groups = tagImpactBreakdown(CARDS)
    const unclassified = groups.find((g) => g.label === 'Unclassified')
    expect(unclassified?.cards.map((c) => c.name)).toEqual(['C'])
  })
})
