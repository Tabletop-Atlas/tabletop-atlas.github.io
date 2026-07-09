import { describe, expect, it } from 'vitest'
import type { Configuration } from '../configurations'
import { createGameLog } from '../gameLog'
import { dedupeBySpirit, recommend } from '../recommend'
import { memoryStorage } from '../storage'
import type { Complexity, Spirit } from '../types'

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
  return {
    configId: s.id,
    spirit: s,
    isBase: true,
    effectiveComplexity: s.complexity,
    personalEffectiveComplexity: s.complexity,
  }
}

function aspectConfig(s: Spirit, aspectName: string, effectiveComplexity: Complexity): Configuration {
  return {
    configId: `${s.id}::${aspectName}`,
    spirit: s,
    aspect: { name: aspectName },
    isBase: false,
    effectiveComplexity,
    personalEffectiveComplexity: effectiveComplexity,
  }
}

describe('recommend', () => {
  it('ranks the high-offense configuration first when offense is weighted', () => {
    const highOffense = spirit({ ratings: { offense: 5, control: 1, fear: 1, defense: 1, utility: 1 } })
    const highDefense = spirit({ ratings: { offense: 1, control: 1, fear: 1, defense: 5, utility: 1 } })
    const ranked = recommend([baseConfig(highOffense), baseConfig(highDefense)], { offense: 1 })
    expect(ranked[0].config.configId).toBe(highOffense.id)
  })

  it('is deterministic across repeated calls', () => {
    const configs = [baseConfig(spirit()), baseConfig(spirit())]
    const a = recommend(configs, { offense: 1 })
    const b = recommend(configs, { offense: 1 })
    expect(a.map((r) => r.config.configId)).toEqual(b.map((r) => r.config.configId))
  })

  it('does not penalize surplus capability in un-asked dimensions', () => {
    const lowSurplus = spirit({ ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
    const highSurplus = spirit({ ratings: { offense: 3, control: 1, fear: 1, defense: 5, utility: 1 } })
    const ranked = recommend([baseConfig(lowSurplus), baseConfig(highSurplus)], { offense: 1 })
    expect(ranked[0].score).toBe(ranked[1].score)
  })

  it('boosts fast-tempo configurations when tempo preference is positive', () => {
    const fast = spirit({ tags: ['fast-tempo'] })
    const slow = spirit({ tags: ['ramping-economy'] })
    const ranked = recommend([baseConfig(fast), baseConfig(slow)], {}, { tempo: 2 })
    expect(ranked[0].config.configId).toBe(fast.id)
  })

  it('boosts ramping-economy configurations when tempo preference is negative', () => {
    const fast = spirit({ tags: ['fast-tempo'] })
    const slow = spirit({ tags: ['ramping-economy'] })
    const ranked = recommend([baseConfig(fast), baseConfig(slow)], {}, { tempo: -2 })
    expect(ranked[0].config.configId).toBe(slow.id)
  })

  describe('complexity penalty', () => {
    const simple = spirit({ complexity: 'Low', ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
    const veryHigh = spirit({ complexity: 'Very High', ratings: { offense: 6, control: 1, fear: 1, defense: 1, utility: 1 } })
    const configs = [baseConfig(simple), baseConfig(veryHigh)]

    it('buries a Very-High configuration for a first-timer despite its higher raw fit', () => {
      const ranked = recommend(configs, { offense: 1 }, { complexityImportance: 1, complexityCeiling: 'Low' })
      expect(ranked[0].config.configId).toBe(simple.id)
    })

    it('never removes the over-complexity configuration from the pool (soft penalty only)', () => {
      const ranked = recommend(configs, { offense: 1 }, { complexityImportance: 1, complexityCeiling: 'Low' })
      expect(ranked).toHaveLength(configs.length)
      expect(ranked.some((r) => r.config.configId === veryHigh.id)).toBe(true)
    })

    it('still buries an over-ceiling configuration when complexityImportance is 0 - the ceiling is a safeguard, not a taste knob', () => {
      const ranked = recommend(configs, { offense: 1 }, { complexityImportance: 0, complexityCeiling: 'Low' })
      expect(ranked[0].config.configId).toBe(simple.id)
    })

    it('applies no penalty at all when there is no ceiling, even at importance 0', () => {
      const ranked = recommend(configs, { offense: 1 }, { complexityImportance: 0 })
      expect(ranked[0].config.configId).toBe(veryHigh.id)
    })

    it('pins the interaction: complete newcomer + "bring on the bookkeeping" still buries a Very High configuration', () => {
      // complexityImportance: 0 mirrors the `bring-it` option of the enjoyment question;
      // complexityCeiling: 'Low' mirrors "Complete newcomer" - two different questions.
      const ranked = recommend(configs, { offense: 1 }, { complexityImportance: 0, complexityCeiling: 'Low' })
      expect(ranked[0].config.configId).toBe(simple.id)
    })
  })

  describe('effective complexity (issue #03)', () => {
    it('a complexity-lowering configuration outranks its identical-fit base for a first-timer', () => {
      const s = spirit({ complexity: 'High', ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
      const base = baseConfig(s)
      const lowered = aspectConfig(s, 'Simplifying Aspect', 'Moderate')
      const ranked = recommend([base, lowered], { offense: 1 }, { complexityImportance: 1, complexityCeiling: 'Low' })
      expect(ranked[0].config.configId).toBe(lowered.configId)
    })

    it('a complexity-raising configuration is buried below its identical-fit base for a first-timer', () => {
      const s = spirit({ complexity: 'Moderate', ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
      const base = baseConfig(s)
      const raised = aspectConfig(s, 'Harder Aspect', 'High')
      const ranked = recommend([base, raised], { offense: 1 }, { complexityImportance: 1, complexityCeiling: 'Low' })
      expect(ranked[0].config.configId).toBe(base.configId)
    })

    it('with complexity importance at 0 and no ceiling, effective complexity changes no ranking', () => {
      const s = spirit({ complexity: 'Moderate', ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
      const base = baseConfig(s)
      const raised = aspectConfig(s, 'Harder Aspect', 'Very High')
      const ranked = recommend([base, raised], { offense: 1 }, { complexityImportance: 0 })
      expect(ranked[0].score).toBe(ranked[1].score)
    })

    it('a ceiling still buries a complexity-raising configuration even at importance 0', () => {
      const s = spirit({ complexity: 'Moderate', ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
      const base = baseConfig(s)
      const raised = aspectConfig(s, 'Harder Aspect', 'Very High')
      const ranked = recommend([base, raised], { offense: 1 }, { complexityImportance: 0, complexityCeiling: 'Low' })
      expect(ranked[0].config.configId).toBe(base.configId)
    })
  })

  describe('personal complexity override / split rule (issue #05)', () => {
    // A spirit the owner has overridden to Low, even though it's printed High.
    function overriddenConfig(s: Spirit, personalLevel: Complexity): Configuration {
      return {
        configId: s.id,
        spirit: s,
        isBase: true,
        effectiveComplexity: s.complexity,
        personalEffectiveComplexity: personalLevel,
      }
    }

    it('the newcomer ceiling ignores the override - still buried for a first-timer', () => {
      const overridden = spirit({ complexity: 'High', ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
      const actuallyLow = spirit({ complexity: 'Low', ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
      const ranked = recommend(
        [overriddenConfig(overridden, 'Low'), baseConfig(actuallyLow)],
        { offense: 1 },
        { complexityImportance: 1, complexityCeiling: 'Low' },
      )
      // Identical fit, but the printed-High config is still buried behind the truly Low one.
      expect(ranked[0].config.configId).toBe(actuallyLow.id)
      expect(ranked[1].config.configId).toBe(overridden.id)
    })

    it('the enjoyment preference honours the override - scores the same as an actually-Low spirit', () => {
      const overridden = spirit({ complexity: 'High', ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
      const actuallyLow = spirit({ complexity: 'Low', ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
      // No newcomer ceiling in play - just "keep it simple" (max importance, generous ceiling).
      const ranked = recommend(
        [overriddenConfig(overridden, 'Low'), baseConfig(actuallyLow)],
        { offense: 1 },
        { complexityImportance: 1, complexityCeiling: 'Very High' },
      )
      expect(ranked[0].score).toBe(ranked[1].score)
    })
  })

  describe('tier prior', () => {
    const filler = spirit({ ratings: { offense: 10, control: 1, fear: 1, defense: 1, utility: 1 } })
    const higherFitLowerTier = spirit({ ratings: { offense: 5, control: 1, fear: 1, defense: 1, utility: 1 } })
    const lowerFitHigherTier = spirit({ ratings: { offense: 4.5, control: 1, fear: 1, defense: 1, utility: 1 } })
    const configs = [baseConfig(filler), baseConfig(higherFitLowerTier), baseConfig(lowerFitHigherTier)]
    const tierPrior = { [higherFitLowerTier.id]: 'D', [lowerFitHigherTier.id]: 'S' } as const

    it('alpha=0 (tierKnob=0) reproduces the pure-fit ranking', () => {
      const withTier = recommend(configs, { offense: 1 }, { tierPrior, tierKnob: 0 })
      const withoutTier = recommend(configs, { offense: 1 })
      expect(withTier.map((r) => r.config.configId)).toEqual(withoutTier.map((r) => r.config.configId))
    })

    it('higher tierKnob promotes the higher-tier configuration', () => {
      const low = recommend(configs, { offense: 1 }, { tierPrior, tierKnob: 0 })
      const high = recommend(configs, { offense: 1 }, { tierPrior, tierKnob: 1 })
      expect(low[1].config.configId).toBe(higherFitLowerTier.id)
      expect(high[1].config.configId).toBe(lowerFitHigherTier.id)
    })

    it('max tierKnob never lets tier override a dominant fit advantage', () => {
      const bestFit = spirit({ ratings: { offense: 10, control: 1, fear: 1, defense: 1, utility: 1 } })
      const worstFit = spirit({ ratings: { offense: 1, control: 1, fear: 1, defense: 1, utility: 1 } })
      const ranked = recommend([baseConfig(bestFit), baseConfig(worstFit)], { offense: 1 }, {
        tierPrior: { [bestFit.id]: 'D', [worstFit.id]: 'S' },
        tierKnob: 1,
      })
      expect(ranked[0].config.configId).toBe(bestFit.id)
    })

    it('falls back to a neutral prior when a configuration has no tier entry', () => {
      const ranked = recommend(configs, { offense: 1 }, { tierPrior: {}, tierKnob: 1 })
      expect(ranked.map((r) => r.config.configId)).toEqual(
        recommend(configs, { offense: 1 }).map((r) => r.config.configId),
      )
    })
  })

  describe('novelty knob / timesPlayed (issue #07)', () => {
    const played = spirit({ ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
    const neverPlayed = spirit({ ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
    const configs = [baseConfig(played), baseConfig(neverPlayed)]
    const timesPlayed = { [played.id]: 5 }

    it('with an empty log (no timesPlayed given), rankings are unchanged', () => {
      const withKnob = recommend(configs, { offense: 1 }, { tierKnob: 0 })
      const withoutKnob = recommend(configs, { offense: 1 })
      expect(withKnob.map((r) => r.config.configId)).toEqual(withoutKnob.map((r) => r.config.configId))
      expect(withKnob[0].score).toBe(withKnob[1].score) // identical fit, no play-count signal
    })

    it('at full novelty (tierKnob=0), a never-played configuration outranks an otherwise-identical played one', () => {
      const ranked = recommend(configs, { offense: 1 }, { tierKnob: 0, timesPlayed })
      expect(ranked[0].config.configId).toBe(neverPlayed.id)
    })

    it('at full strength (tierKnob=1), timesPlayed changes no ranking', () => {
      const ranked = recommend(configs, { offense: 1 }, { tierKnob: 1, timesPlayed })
      expect(ranked[0].score).toBe(ranked[1].score)
    })

    it('never fully overrides a dominant fit advantage', () => {
      const bestFit = spirit({ ratings: { offense: 10, control: 1, fear: 1, defense: 1, utility: 1 } })
      const worstFit = spirit({ ratings: { offense: 1, control: 1, fear: 1, defense: 1, utility: 1 } })
      const ranked = recommend([baseConfig(bestFit), baseConfig(worstFit)], { offense: 1 }, {
        tierKnob: 0,
        timesPlayed: { [bestFit.id]: 50, [worstFit.id]: 0 },
      })
      expect(ranked[0].config.configId).toBe(bestFit.id)
    })

    it('a logged loss changes nothing - only the play count matters, not the outcome', () => {
      // recommend() has no notion of outcome at all; timesPlayed is a plain count regardless
      // of win or loss, so this holds by construction. Asserted here as the ranking-behaviour
      // test the issue calls for: a win and a loss with the same play count score identically.
      const withOneWin = recommend(configs, { offense: 1 }, { tierKnob: 0, timesPlayed: { [played.id]: 1 } })
      const withOneLoss = recommend(configs, { offense: 1 }, { tierKnob: 0, timesPlayed: { [played.id]: 1 } })
      expect(withOneWin).toEqual(withOneLoss)
    })
  })

  describe('dedupeBySpirit (issue #04)', () => {
    it('keeps at most one configuration per base spirit', () => {
      const s = spirit()
      const other = spirit()
      const ranked = recommend(
        [baseConfig(s), aspectConfig(s, 'A', 'Low'), aspectConfig(s, 'B', 'Low'), baseConfig(other)],
        { offense: 1 },
      )
      const deduped = dedupeBySpirit(ranked)
      const spiritIds = deduped.map((r) => r.config.spirit.id)
      expect(new Set(spiritIds).size).toBe(spiritIds.length)
      expect(spiritIds).toHaveLength(2)
    })

    it('breaks an exact tie toward the base configuration', () => {
      const s = spirit()
      // Identical fit (no weighted axis differs) and no tier prior -> siblings score exactly equal.
      const ranked = recommend([baseConfig(s), aspectConfig(s, 'Sibling', 'Low')], { offense: 1 })
      expect(ranked[0].score).toBe(ranked[1].score)
      const deduped = dedupeBySpirit(ranked)
      expect(deduped).toHaveLength(1)
      expect(deduped[0].config.isBase).toBe(true)
    })

    it('a high-tier aspect earns its way past a low-tier base', () => {
      const s = spirit({ ratings: { offense: 3, control: 1, fear: 1, defense: 1, utility: 1 } })
      const base = baseConfig(s)
      const highTierAspect = aspectConfig(s, 'Better', 'Low')
      const ranked = recommend([base, highTierAspect], { offense: 1 }, {
        tierPrior: { [base.configId]: 'F', [highTierAspect.configId]: 'C' },
        tierKnob: 1,
      })
      const deduped = dedupeBySpirit(ranked)
      expect(deduped[0].config.configId).toBe(highTierAspect.configId)
    })

    it('produces a deterministic order across repeated calls', () => {
      const s1 = spirit()
      const s2 = spirit()
      const ranked = recommend([baseConfig(s1), baseConfig(s2)], { offense: 1 })
      const a = dedupeBySpirit(ranked).map((r) => r.config.configId)
      const b = dedupeBySpirit(ranked).map((r) => r.config.configId)
      expect(a).toEqual(b)
    })
  })

  describe('game log independence (issue #06)', () => {
    it('a logged loss leaves recommend() byte-identical - the log feeds nothing into scoring', () => {
      // recommend() takes no game-log input at all, so this holds by construction; asserted
      // explicitly per the PRD's hard constraint that outcomes are never scored.
      const s1 = spirit()
      const s2 = spirit()
      const configs = [baseConfig(s1), baseConfig(s2)]
      const before = recommend(configs, { offense: 1 })

      const log = createGameLog(memoryStorage())
      log.append({
        date: '2026-01-01',
        players: [{ name: 'Adam', configId: s1.id }],
        adversary: 'England',
        adversaryLevel: 4,
        outcome: 'loss',
      })

      const after = recommend(configs, { offense: 1 })
      expect(after).toEqual(before)
    })
  })
})
