import { describe, expect, it } from 'vitest'
import type { Configuration } from '../configurations'
import { recommend } from '../recommend'
import type { Spirit } from '../types'
import { selectWildcard } from '../wildcard'

function spirit(overrides: Partial<Spirit> & Pick<Spirit, 'id' | 'name'>): Spirit {
  return {
    expansion: 'Base',
    complexity: 'Low',
    ratings: { offense: 1, control: 1, fear: 1, defense: 1, utility: 1 },
    elements: [],
    summary: '',
    tags: [],
    aspects: [],
    ...overrides,
  }
}

function baseConfig(s: Spirit): Configuration {
  return {
    configId: s.id,
    spirit: s,
    isBase: true,
    effectiveComplexity: s.complexity,
    personalEffectiveComplexity: s.complexity,
  }
}

describe('selectWildcard', () => {
  const pool: Configuration[] = [
    baseConfig(spirit({ id: 'top1', name: 'Top1', ratings: { offense: 6, control: 1, fear: 1, defense: 1, utility: 1 } })),
    baseConfig(spirit({ id: 'top2', name: 'Top2', ratings: { offense: 5, control: 1, fear: 1, defense: 1, utility: 1 } })),
    baseConfig(spirit({ id: 'top3', name: 'Top3', ratings: { offense: 4, control: 1, fear: 1, defense: 1, utility: 1 } })),
    baseConfig(
      spirit({
        id: 'over-cap',
        name: 'OverCap',
        complexity: 'Very High',
        ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 },
      }),
    ),
    baseConfig(
      spirit({
        id: 'off-profile-utility',
        name: 'OffProfileUtility',
        ratings: { offense: 1, control: 1, fear: 1, defense: 1, utility: 6 },
      }),
    ),
  ]
  const weights = { offense: 1 }

  it('never picks a configuration already in the top-3', () => {
    const ranked = recommend(pool, weights)
    const wildcard = selectWildcard(ranked, weights, undefined)
    const top3Ids = ranked.slice(0, 3).map((r) => r.config.configId)
    expect(top3Ids).not.toContain(wildcard!.configId)
  })

  it('prefers an above-complexity-cap configuration when one exists among the remainder', () => {
    const ranked = recommend(pool, weights)
    const wildcard = selectWildcard(ranked, weights, 'Moderate')
    expect(wildcard!.configId).toBe('over-cap')
  })

  it('falls back to the best off-profile pick on the least-weighted axis', () => {
    const ranked = recommend(pool, weights)
    const wildcard = selectWildcard(ranked, weights, undefined)
    expect(wildcard!.configId).toBe('off-profile-utility')
  })

  it('cycles through candidates via offset (for reroll)', () => {
    const ranked = recommend(pool, weights)
    const first = selectWildcard(ranked, weights, undefined, 0)
    const second = selectWildcard(ranked, weights, undefined, 1)
    expect(first!.configId).not.toBe(second!.configId)
  })
})
