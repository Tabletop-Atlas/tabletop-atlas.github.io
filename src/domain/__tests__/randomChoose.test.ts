import { describe, expect, it } from 'vitest'
import { drawRandom, eligiblePool } from '../randomChoose'
import type { Spirit } from '../types'

function spirit(id: string, complexity: Spirit['complexity']): Spirit {
  return {
    id,
    name: id,
    expansion: 'Base',
    complexity,
    ratings: { offense: 1, control: 1, fear: 1, defense: 1, utility: 1 },
    elements: [],
    summary: '',
    tags: [],
    aspects: [],
  }
}

const pool: Spirit[] = [
  spirit('low', 'Low'),
  spirit('moderate', 'Moderate'),
  spirit('high', 'High'),
  spirit('very-high', 'Very High'),
]

describe('eligiblePool', () => {
  it('returns the full pool when there is no complexity constraint', () => {
    expect(eligiblePool(pool)).toHaveLength(4)
  })

  it('excludes spirits above the stated complexity ceiling', () => {
    const eligible = eligiblePool(pool, { complexityCeiling: 'Moderate' })
    expect(eligible.map((s) => s.id)).toEqual(['low', 'moderate'])
  })
})

describe('drawRandom', () => {
  it('draws uniformly from the eligible pool using an injectable random source', () => {
    expect(drawRandom(pool, {}, () => 0)?.id).toBe('low')
    expect(drawRandom(pool, {}, () => 0.99)?.id).toBe('very-high')
  })

  it('never draws a spirit excluded by the constraint', () => {
    const drawn = drawRandom(pool, { complexityCeiling: 'Low' }, () => 0.99)
    expect(drawn?.id).toBe('low')
  })

  it('returns undefined when the constrained pool is empty', () => {
    const empty = eligiblePool([spirit('only-very-high', 'Very High')], { complexityCeiling: 'Low' })
    expect(empty).toHaveLength(0)
    expect(drawRandom(empty)).toBeUndefined()
  })
})
