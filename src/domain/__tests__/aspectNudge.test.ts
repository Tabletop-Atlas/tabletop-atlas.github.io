import { describe, expect, it } from 'vitest'
import { findAspectNudge } from '../aspectNudge'
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
  aspects: [{ name: 'Wind', delta: 'Leans supportive instead of pure offense.', shiftsToward: '+utility' }],
}

describe('findAspectNudge', () => {
  it('fires when the base spirit is low on the top-weighted axis and a matching aspect exists', () => {
    const nudge = findAspectNudge(lightningLike, { utility: 5 })
    expect(nudge?.aspect.name).toBe('Wind')
    expect(nudge?.axis).toBe('utility')
    expect(nudge?.message).toContain('Wind')
  })

  it('does not fire when the weighted axis is not the base spirit\'s low point', () => {
    // offense is the max weight, but the spirit rates high (5) on offense -> not "low there"
    const nudge = findAspectNudge(lightningLike, { offense: 5 })
    expect(nudge).toBeUndefined()
  })

  it('does not fire when the low axis is not the user\'s top-weighted one', () => {
    // utility (rated low) is weighted, but offense is weighted higher -> utility isn't "high importance"
    const nudge = findAspectNudge(lightningLike, { offense: 5, utility: 1 })
    expect(nudge).toBeUndefined()
  })

  it('does not fire when no aspect shifts toward the relevant axis', () => {
    const noMatchingAspect: Spirit = { ...lightningLike, aspects: [] }
    const nudge = findAspectNudge(noMatchingAspect, { utility: 5 })
    expect(nudge).toBeUndefined()
  })

  it('does not fire when nothing is weighted', () => {
    expect(findAspectNudge(lightningLike, {})).toBeUndefined()
  })
})
