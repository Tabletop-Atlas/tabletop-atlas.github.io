import { describe, expect, it } from 'vitest'
import { innateThresholdsFor, thresholdAnnotationsFor, thresholdElements } from '../innateThresholds'
import type { InnatePower, Spirit } from '../types'

const LIGHTNING: Spirit = {
  id: 'lightnings-swift-strike',
  name: "Lightning's Swift Strike",
  expansion: 'Base',
  complexity: 'Low',
  ratings: { offense: 3, control: 3, fear: 3, defense: 3, utility: 3 },
  elements: ['Fire', 'Air'],
  summary: '',
  tags: [],
  aspects: [{ name: 'Pandemonium', delta: 'Replaces the Thundering Destruction innate with one that adds Fear.', expansion: 'Jagged Earth' }],
}

const RIVER: Spirit = {
  id: 'river-surges-in-sunlight',
  name: 'River Surges in Sunlight',
  expansion: 'Base',
  complexity: 'Low',
  ratings: { offense: 3, control: 3, fear: 3, defense: 3, utility: 3 },
  elements: ['Sun', 'Water'],
  summary: '',
  tags: [],
  aspects: [{ name: 'Sunshine', delta: 'Grants +1 Energy.', expansion: 'Jagged Earth' }],
}

const POWERS: InnatePower[] = [
  {
    spirit: 'lightnings-swift-strike',
    name: 'Thundering Destruction',
    speed: 'Slow',
    thresholds: [{ Fire: 3, Air: 2 }, { Fire: 4, Air: 3 }],
    source: 'wiki+tts',
  },
  {
    spirit: 'river-surges-in-sunlight',
    name: 'Massive Flooding',
    speed: 'Slow',
    thresholds: [{ Sun: 1, Water: 2 }, { Sun: 2, Water: 3 }],
    source: 'wiki+tts',
  },
]

describe('innateThresholdsFor', () => {
  it('returns undefined for an unknown spirit', () => {
    expect(innateThresholdsFor('nope', [LIGHTNING, RIVER], POWERS)).toBeUndefined()
  })

  it('groups a spirit\'s own innate powers and flags an aspect whose delta mentions "innate"', () => {
    const result = innateThresholdsFor('lightnings-swift-strike', [LIGHTNING, RIVER], POWERS)
    expect(result?.powers).toEqual([POWERS[0]])
    expect(result?.aspectModifiesInnates).toBe(true)
  })

  it('does not flag a spirit whose aspects never mention "innate"', () => {
    const result = innateThresholdsFor('river-surges-in-sunlight', [LIGHTNING, RIVER], POWERS)
    expect(result?.aspectModifiesInnates).toBe(false)
  })

  it('an aspect with no delta (reviewNeeded) never counts as modifying innates', () => {
    const spirit: Spirit = { ...RIVER, aspects: [{ name: 'Mystery', expansion: 'Base', reviewNeeded: true }] }
    const result = innateThresholdsFor(spirit.id, [spirit], POWERS)
    expect(result?.aspectModifiesInnates).toBe(false)
  })
})

describe('thresholdElements', () => {
  it('collects every element referenced across all of a spirit\'s thresholds', () => {
    const result = innateThresholdsFor('lightnings-swift-strike', [LIGHTNING, RIVER], POWERS)!
    expect(thresholdElements(result)).toEqual(new Set(['Fire', 'Air']))
  })
})

describe('thresholdAnnotationsFor', () => {
  it('names every rung\'s count for a referenced element, numbered by rung', () => {
    const result = innateThresholdsFor('lightnings-swift-strike', [LIGHTNING, RIVER], POWERS)!
    expect(thresholdAnnotationsFor('Fire', result)).toEqual(['Thundering Destruction I wants 3 Fire', 'Thundering Destruction II wants 4 Fire'])
    expect(thresholdAnnotationsFor('Air', result)).toEqual(['Thundering Destruction I wants 2 Air', 'Thundering Destruction II wants 3 Air'])
  })

  it('returns no annotation for an element the innate does not reference', () => {
    const result = innateThresholdsFor('lightnings-swift-strike', [LIGHTNING, RIVER], POWERS)!
    expect(thresholdAnnotationsFor('Water', result)).toEqual([])
  })
})
