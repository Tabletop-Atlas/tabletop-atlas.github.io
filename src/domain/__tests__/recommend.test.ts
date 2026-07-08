import { describe, expect, it } from 'vitest'
import { recommend } from '../recommend'
import type { Spirit } from '../types'

const fixtureSpirits: Spirit[] = [
  {
    id: 'high-offense',
    name: 'High Offense',
    expansion: 'Base',
    complexity: 'Low',
    ratings: { offense: 5, control: 1, fear: 1, defense: 1, utility: 1 },
    elements: [],
    summary: '',
    tags: [],
    aspects: [],
  },
  {
    id: 'high-defense',
    name: 'High Defense',
    expansion: 'Base',
    complexity: 'Low',
    ratings: { offense: 1, control: 1, fear: 1, defense: 5, utility: 1 },
    elements: [],
    summary: '',
    tags: [],
    aspects: [],
  },
]

const tempoFixtureSpirits: Spirit[] = [
  {
    id: 'fast-spirit',
    name: 'Fast Spirit',
    expansion: 'Base',
    complexity: 'Low',
    ratings: { offense: 3, control: 3, fear: 3, defense: 3, utility: 3 },
    elements: [],
    summary: '',
    tags: ['fast-tempo'],
    aspects: [],
  },
  {
    id: 'slow-spirit',
    name: 'Slow Spirit',
    expansion: 'Base',
    complexity: 'Low',
    ratings: { offense: 3, control: 3, fear: 3, defense: 3, utility: 3 },
    elements: [],
    summary: '',
    tags: ['ramping-economy'],
    aspects: [],
  },
]

describe('recommend', () => {
  it('ranks the high-offense spirit first when offense is weighted', () => {
    const ranked = recommend(fixtureSpirits, { offense: 1 })
    expect(ranked[0].spirit.id).toBe('high-offense')
  })

  it('is deterministic across repeated calls', () => {
    const a = recommend(fixtureSpirits, { offense: 1 })
    const b = recommend(fixtureSpirits, { offense: 1 })
    expect(a.map((r) => r.spirit.id)).toEqual(b.map((r) => r.spirit.id))
  })

  it('does not penalize surplus capability in un-asked dimensions', () => {
    const sameWeightedAxis: Spirit[] = [
      { ...fixtureSpirits[0], id: 'low-surplus', ratings: { ...fixtureSpirits[0].ratings, offense: 3, defense: 1 } },
      { ...fixtureSpirits[0], id: 'high-surplus', ratings: { ...fixtureSpirits[0].ratings, offense: 3, defense: 5 } },
    ]
    const ranked = recommend(sameWeightedAxis, { offense: 1 })
    // identical weighted axis (offense=3) but very different un-asked defense stat -> identical score
    expect(ranked[0].score).toBe(ranked[1].score)
  })

  it('boosts fast-tempo spirits when tempo preference is positive', () => {
    const ranked = recommend(tempoFixtureSpirits, {}, { tempo: 2 })
    expect(ranked[0].spirit.id).toBe('fast-spirit')
  })

  it('boosts ramping-economy spirits when tempo preference is negative', () => {
    const ranked = recommend(tempoFixtureSpirits, {}, { tempo: -2 })
    expect(ranked[0].spirit.id).toBe('slow-spirit')
  })

  describe('complexity penalty', () => {
    const complexityFixture: Spirit[] = [
      {
        id: 'simple-low-offense',
        name: 'Simple Low Offense',
        expansion: 'Base',
        complexity: 'Low',
        ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 },
        elements: [],
        summary: '',
        tags: [],
        aspects: [],
      },
      {
        id: 'very-high-offense',
        name: 'Very High Offense',
        expansion: 'Base',
        complexity: 'Very High',
        ratings: { offense: 6, control: 1, fear: 1, defense: 1, utility: 1 },
        elements: [],
        summary: '',
        tags: [],
        aspects: [],
      },
    ]

    it("buries a Very-High spirit for a first-timer despite its higher raw fit", () => {
      const ranked = recommend(complexityFixture, { offense: 1 }, {
        complexityImportance: 1,
        complexityCeiling: 'Low',
      })
      expect(ranked[0].spirit.id).toBe('simple-low-offense')
    })

    it('never removes the over-complexity spirit from the pool (soft penalty only)', () => {
      const ranked = recommend(complexityFixture, { offense: 1 }, {
        complexityImportance: 1,
        complexityCeiling: 'Low',
      })
      expect(ranked).toHaveLength(complexityFixture.length)
      expect(ranked.some((r) => r.spirit.id === 'very-high-offense')).toBe(true)
    })

    it('applies no penalty when complexityImportance is 0', () => {
      const ranked = recommend(complexityFixture, { offense: 1 }, {
        complexityImportance: 0,
        complexityCeiling: 'Low',
      })
      expect(ranked[0].spirit.id).toBe('very-high-offense')
    })
  })

  describe('tier prior', () => {
    const tierFixture: Spirit[] = [
      {
        id: 'filler',
        name: 'Filler',
        expansion: 'Base',
        complexity: 'Low',
        ratings: { offense: 10, control: 1, fear: 1, defense: 1, utility: 1 },
        elements: [],
        summary: '',
        tags: [],
        aspects: [],
      },
      {
        id: 'higher-fit-lower-tier',
        name: 'Higher Fit Lower Tier',
        expansion: 'Base',
        complexity: 'Low',
        ratings: { offense: 5, control: 1, fear: 1, defense: 1, utility: 1 },
        elements: [],
        summary: '',
        tags: [],
        aspects: [],
      },
      {
        id: 'lower-fit-higher-tier',
        name: 'Lower Fit Higher Tier',
        expansion: 'Base',
        complexity: 'Low',
        ratings: { offense: 4.5, control: 1, fear: 1, defense: 1, utility: 1 },
        elements: [],
        summary: '',
        tags: [],
        aspects: [],
      },
    ]
    const tierPrior = { 'higher-fit-lower-tier': 'D', 'lower-fit-higher-tier': 'S' } as const

    it('alpha=0 (tierKnob=0) reproduces the pure-fit ranking', () => {
      const withTier = recommend(tierFixture, { offense: 1 }, { tierPrior, tierKnob: 0 })
      const withoutTier = recommend(tierFixture, { offense: 1 })
      expect(withTier.map((r) => r.spirit.id)).toEqual(withoutTier.map((r) => r.spirit.id))
    })

    it('higher tierKnob promotes the higher-tier spirit', () => {
      const low = recommend(tierFixture, { offense: 1 }, { tierPrior, tierKnob: 0 })
      const high = recommend(tierFixture, { offense: 1 }, { tierPrior, tierKnob: 1 })
      expect(low[1].spirit.id).toBe('higher-fit-lower-tier')
      expect(high[1].spirit.id).toBe('lower-fit-higher-tier')
    })

    it('max tierKnob never lets tier override a dominant fit advantage', () => {
      const dominant: Spirit[] = [
        { ...tierFixture[0], id: 'best-fit-worst-tier', ratings: { ...tierFixture[0].ratings, offense: 10 } },
        { ...tierFixture[0], id: 'worst-fit-best-tier', ratings: { ...tierFixture[0].ratings, offense: 1 } },
      ]
      const ranked = recommend(dominant, { offense: 1 }, {
        tierPrior: { 'best-fit-worst-tier': 'D', 'worst-fit-best-tier': 'S' },
        tierKnob: 1,
      })
      expect(ranked[0].spirit.id).toBe('best-fit-worst-tier')
    })

    it('falls back to a neutral prior when a spirit has no tier entry', () => {
      const ranked = recommend(tierFixture, { offense: 1 }, { tierPrior: {}, tierKnob: 1 })
      expect(ranked.map((r) => r.spirit.id)).toEqual(
        recommend(tierFixture, { offense: 1 }).map((r) => r.spirit.id),
      )
    })
  })
})
