import { describe, expect, it } from 'vitest'
import { aspectShiftsToward, topWeightedLowAxis } from '../aspectNudge'
import type { Spirit } from '../types'

const lightningLike: Spirit = {
  id: 'lightning-like',
  name: 'Lightning-Like',
  expansion: 'Base',
  complexity: 'Low',
  ratings: { offense: 5, control: 2, fear: 3, defense: 1, utility: 2 },
  elements: [],
  summary: '',
  tags: [],
  aspects: [{ name: 'Wind', delta: 'Leans supportive instead of pure offense.', shiftsToward: '+utility', expansion: 'Jagged Earth' }],
}

describe('topWeightedLowAxis', () => {
  it('returns the axis when it is both top-weighted and the spirit rates low there', () => {
    expect(topWeightedLowAxis(lightningLike, { utility: 5 })).toBe('utility')
  })

  it("returns undefined when the weighted axis is not the base spirit's low point", () => {
    // offense is the max weight, but the spirit rates high (5) on offense -> not "low there"
    expect(topWeightedLowAxis(lightningLike, { offense: 5 })).toBeUndefined()
  })

  it("returns undefined when the low axis is not the user's top-weighted one", () => {
    // utility (rated low) is weighted, but offense is weighted higher -> utility isn't "high importance"
    expect(topWeightedLowAxis(lightningLike, { offense: 5, utility: 1 })).toBeUndefined()
  })

  it('returns undefined when nothing is weighted', () => {
    expect(topWeightedLowAxis(lightningLike, {})).toBeUndefined()
  })
})

describe('aspectShiftsToward', () => {
  const [wind] = lightningLike.aspects

  it('is true when the aspect\'s hint points at the given axis', () => {
    expect(aspectShiftsToward(wind, 'utility')).toBe(true)
  })

  it('is false when the aspect\'s hint points at a different axis', () => {
    expect(aspectShiftsToward(wind, 'offense')).toBe(false)
  })

  it('is false when there is no axis to match', () => {
    expect(aspectShiftsToward(wind, undefined)).toBe(false)
  })

  it('is false when there is no aspect (a base configuration)', () => {
    expect(aspectShiftsToward(undefined, 'utility')).toBe(false)
  })

  it('is false for an aspect with no shiftsToward hint at all', () => {
    expect(aspectShiftsToward({ name: 'Sparking', expansion: 'Nature Incarnate' }, 'utility')).toBe(false)
  })
})
