import { describe, expect, it } from 'vitest'
import { candidatesForRecommender } from '../collectionStore'
import type { Configuration } from '../configurations'
import { recommend } from '../recommend'
import type { Spirit } from '../types'

let nextId = 0
function spirit(overrides: Partial<Spirit> = {}): Spirit {
  nextId += 1
  return {
    id: `spirit-${nextId}`,
    name: `Spirit ${nextId}`,
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
  return { configId: s.id, spirit: s, isBase: true, effectiveComplexity: s.complexity, personalEffectiveComplexity: s.complexity }
}

/**
 * v5 #07b: pins `candidatesForRecommender` - the exact function `Recommender.tsx`'s
 * `useRanking()` calls to build `recommend()`'s candidate pool, not a reimplementation of its
 * logic. Collection exclusion is applied to the candidate pool *before* recommend() runs, not to
 * recommend()'s output afterward. #06 settled the surface (annotate by default, hard-filter is
 * opt-in and "excluded exactly as if annotation had removed them first" - the same pre-filter
 * `filterOwnedConfigurations` the tier board already uses), so this is the regression test that
 * would otherwise go unnoticed if someone later moved the filter to run after `recommend()`, or
 * changed what `Recommender.tsx` passes to it.
 */
describe('candidatesForRecommender + recommend wiring', () => {
  it('an untouched collection (nothing excluded) produces a ranking identical to unfiltered recommend()', () => {
    const configs = [baseConfig(spirit({ ratings: { offense: 5, control: 1, fear: 1, defense: 1, utility: 1 } })), baseConfig(spirit())]
    const hardFilterOff = candidatesForRecommender(configs, false, new Set())
    const hardFilterOnButNothingExcluded = candidatesForRecommender(configs, true, new Set())
    const withoutFilter = recommend(configs, { offense: 1 })
    expect(recommend(hardFilterOff, { offense: 1 })).toEqual(withoutFilter)
    expect(recommend(hardFilterOnButNothingExcluded, { offense: 1 })).toEqual(withoutFilter)
  })

  it('hard-filter off still hands every configuration to recommend(), including unowned ones', () => {
    const owned = spirit({ expansion: 'Base' })
    const unowned = spirit({ expansion: 'Jagged Earth' })
    const configs = [baseConfig(owned), baseConfig(unowned)]
    const candidates = candidatesForRecommender(configs, false, new Set(['Jagged Earth']))
    expect(candidates.map((c) => c.configId).sort()).toEqual([owned.id, unowned.id].sort())
  })

  it('hard-filter on excludes every configuration from an unowned expansion from the ranking entirely', () => {
    const owned = spirit({ expansion: 'Base', ratings: { offense: 5, control: 1, fear: 1, defense: 1, utility: 1 } })
    const unowned = spirit({ expansion: 'Jagged Earth', ratings: { offense: 4, control: 1, fear: 1, defense: 1, utility: 1 } })
    const configs = [baseConfig(owned), baseConfig(unowned)]
    const candidates = candidatesForRecommender(configs, true, new Set(['Jagged Earth']))
    const ranked = recommend(candidates, { offense: 1 })
    expect(ranked.map((r) => r.config.configId)).toEqual([owned.id])
  })

  it('pins pre-filtering (not post-filtering): excluding a strong unowned competitor changes the remaining scores via renormalization', () => {
    // Three configs, offense 5/3/1. Filtering out the 5 before ranking shifts the min-max
    // normalization window (3 becomes the new top), which changes the surviving scores relative
    // to what they'd be if the 5 were ranked first and only removed from the output afterward
    // (post-filtering would leave the 3 and 1's relative scores exactly as computed against the
    // full pool). This is the concrete difference #07b's ticket says a silent flip would produce.
    const strongUnowned = spirit({ expansion: 'Jagged Earth', ratings: { offense: 5, control: 1, fear: 1, defense: 1, utility: 1 } })
    const midOwned = spirit({ expansion: 'Base', ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
    const weakOwned = spirit({ expansion: 'Base', ratings: { offense: 1, control: 1, fear: 1, defense: 1, utility: 1 } })
    const configs = [baseConfig(strongUnowned), baseConfig(midOwned), baseConfig(weakOwned)]

    const fullPoolRanked = recommend(configs, { offense: 1 })
    const postFilterScores = fullPoolRanked.filter((r) => r.config.configId !== strongUnowned.id).map((r) => r.score)

    const candidates = candidatesForRecommender(configs, true, new Set(['Jagged Earth']))
    const preFilterRanked = recommend(candidates, { offense: 1 })
    const preFilterScores = preFilterRanked.map((r) => r.score)

    expect(preFilterScores).not.toEqual(postFilterScores)
    // The pre-filtered top score is 1 (this app's normalization ceiling), proving the window
    // renormalized around the surviving pool rather than keeping the full-pool scale.
    expect(preFilterRanked[0].config.configId).toBe(midOwned.id)
    expect(preFilterRanked[0].score).toBe(1)
  })
})
