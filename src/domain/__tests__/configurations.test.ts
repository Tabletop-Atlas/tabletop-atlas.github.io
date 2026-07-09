import { describe, expect, it } from 'vitest'
import spiritsData from '../../data/spirits.json'
import ownersBoardData from '../../data/tier-lists/owners-board.json'
import { parse } from '../backup'
import type { KnownIds } from '../backup'
import { expand, toConfigId } from '../configurations'
import type { Spirit, TierList } from '../types'

const spirits = spiritsData as Spirit[]
const ownersBoard = ownersBoardData as TierList
const seededTiers = ownersBoard.tiers

describe('configurations', () => {
  it('produces exactly 68 configurations, 37 of them base', () => {
    const configs = expand(spirits)
    expect(configs).toHaveLength(68)
    expect(configs.filter((c) => c.isBase)).toHaveLength(37)
  })

  it('gives every configuration a stable, unique configId', () => {
    const ids = expand(spirits).map((c) => c.configId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('ids a base configuration by the spirit id alone', () => {
    const base = expand(spirits).find((c) => c.spirit.id === 'shadows-flicker-like-flame' && c.isBase)
    expect(base?.configId).toBe('shadows-flicker-like-flame')
  })

  it('ids an aspect configuration as "<spiritId>::<Aspect Name>"', () => {
    const darkFire = expand(spirits).find((c) => c.configId === toConfigId('shadows-flicker-like-flame', 'Dark Fire'))
    expect(darkFire).toBeDefined()
    expect(darkFire?.aspect?.name).toBe('Dark Fire')
    expect(darkFire?.isBase).toBe(false)
  })

  it('every configId in the seed tiers matches a produced configuration', () => {
    const ids = new Set(expand(spirits).map((c) => c.configId))
    for (const id of Object.keys(seededTiers)) {
      expect(ids, `tiers.json has an entry for unknown config "${id}"`).toContain(id)
    }
  })

  it('every produced configuration has a seed tier entry', () => {
    for (const config of expand(spirits)) {
      expect(seededTiers[config.configId], `${config.configId} has no seed tier`).toBeDefined()
    }
  })

  it('raises effective complexity for an "up" aspect, clamped at Very High', () => {
    // A hand-built fixture: no printed Very-High spirit with an "up" aspect exists yet in
    // spirits.json, but the clamp rule must hold regardless (PRD: "an up aspect on a
    // Very High spirit stays Very High, never overflows the printed scale").
    const veryHighSpirit: Spirit = {
      ...spirits[0],
      complexity: 'Very High',
      aspects: [{ name: 'Fixture Up', complexityDelta: 'up' }],
    }
    const config = expand([veryHighSpirit]).find((c) => c.aspect?.name === 'Fixture Up')
    expect(config?.effectiveComplexity).toBe('Very High')
  })

  it('lowers effective complexity for a "down" aspect on a spirit above Low', () => {
    const shroud = spirits.find((s) => s.id === 'shroud-of-silent-mist')!
    expect(shroud.complexity).toBe('High')
    const stranded = shroud.aspects.find((a) => a.name === 'Stranded')!
    expect(stranded.complexityDelta).toBe('down')
    const config = expand(spirits).find((c) => c.configId === toConfigId(shroud.id, 'Stranded'))
    expect(config?.effectiveComplexity).toBe('Moderate')
  })

  it('keeps a "down" aspect on an already-Low spirit at Low (floor, not negative)', () => {
    const shadows = spirits.find((s) => s.id === 'shadows-flicker-like-flame')!
    expect(shadows.complexity).toBe('Low')
    const config = expand(spirits).find((c) => c.configId === toConfigId(shadows.id, 'Reach'))
    expect(config?.effectiveComplexity).toBe('Low')
  })

  it('leaves effective complexity unchanged for a base configuration', () => {
    const config = expand(spirits).find((c) => c.spirit.id === 'lightnings-swift-strike' && c.isBase)
    expect(config?.effectiveComplexity).toBe(config?.spirit.complexity)
  })

  describe('personal complexity override (issue #05)', () => {
    it('defaults personalEffectiveComplexity to the printed value with no override', () => {
      const config = expand(spirits).find((c) => c.spirit.id === 'lightnings-swift-strike' && c.isBase)
      expect(config?.personalEffectiveComplexity).toBe(config?.spirit.complexity)
    })

    it('a base configuration reads the override for personalEffectiveComplexity, unmodified in effectiveComplexity', () => {
      const shroud = spirits.find((s) => s.id === 'shroud-of-silent-mist')!
      const configs = expand(spirits, { [shroud.id]: 'Low' })
      const base = configs.find((c) => c.spirit.id === shroud.id && c.isBase)!
      expect(base.effectiveComplexity).toBe(shroud.complexity) // printed complexity untouched
      expect(base.personalEffectiveComplexity).toBe('Low')
    })

    it('composes the override with the aspect arrow: override base, then delta, then clamp', () => {
      const shroud = spirits.find((s) => s.id === 'shroud-of-silent-mist')!
      const stranded = shroud.aspects.find((a) => a.name === 'Stranded')!
      expect(stranded.complexityDelta).toBe('down')
      const configs = expand(spirits, { [shroud.id]: 'Low' })
      const strandedConfig = configs.find((c) => c.configId === toConfigId(shroud.id, 'Stranded'))!
      // Override says Low; "down" would go below the floor, so it clamps at Low - not the
      // printed-base composition (High -> Moderate).
      expect(strandedConfig.personalEffectiveComplexity).toBe('Low')
      expect(strandedConfig.effectiveComplexity).toBe('Moderate')
    })

    it('spirits.json printed complexity is never mutated by an override', () => {
      const shroud = spirits.find((s) => s.id === 'shroud-of-silent-mist')!
      const before = shroud.complexity
      expand(spirits, { [shroud.id]: 'Very High' })
      expect(spirits.find((s) => s.id === shroud.id)!.complexity).toBe(before)
    })
  })
})

/**
 * The owner's TierMaker board tiers every aspect too, transcribed in the v2 PRD's "Further
 * Notes" (cross-checked art-matched against the board). A deliberate duplication, same
 * discipline as aspectCanon.test.ts's spirit-to-aspect mapping: this is the tripwire against
 * a seed-file typo silently mistiering an aspect.
 */
const ASPECT_TIER: Record<string, string> = {
  Regrowth: 'X',
  Intensify: 'S',
  Nourishing: 'S',
  Travel: 'A',
  Sparking: 'A',
  Tangles: 'A',
  Encircle: 'B',
  Unconstrained: 'B',
  Transforming: 'B',
  Enticing: 'B',
  Violence: 'B',
  Stranded: 'B',
  Lair: 'B',
  Haven: 'B',
  'Spreading Hostility': 'B',
  Locus: 'C',
  Might: 'C',
  Deeps: 'C',
  Wind: 'C',
  Pandemonium: 'C',
  Mentor: 'C',
  'Dark Fire': 'C',
  Warrior: 'D',
  Tactician: 'D',
  Immense: 'D',
  Resilience: 'D',
  Foreboding: 'D',
  Amorphous: 'F',
  Reach: 'F',
  Madness: 'F',
  Sunshine: 'F',
}

describe('seed growth regression (issue #01 -> #02 ordering)', () => {
  it('a v1 backup exported against the old 37-key (spirit-only) seed imports losslessly into the 68-key seed', () => {
    // Simulates a real backup taken before this seed grew: only base-spirit keys, no aspect
    // configs, and schema v1 (predates the TierList entity). Every key must still resolve, and
    // nothing should be reported unresolved - the exact scenario .scratch/v2/README.md's hard
    // sequencing constraint protects, now carried forward through the v1 -> v2 migration.
    const oldEditedTiers: Record<string, string> = {
      'lightnings-swift-strike': 'S',
      'river-surges-in-sunlight': 'A',
    }
    const json = JSON.stringify({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      tiers: oldEditedTiers,
      complexityOverrides: {},
      answers: {},
      log: [],
    })

    const currentSeed: KnownIds = {
      tierIds: new Set(expand(spirits).map((c) => c.configId)),
      listIds: new Set([ownersBoard.id]),
      complexityIds: new Set(spirits.map((s) => s.id)),
      questionIds: new Set(),
    }
    const { state, unresolved } = parse(json, currentSeed, [], ownersBoard.id)

    expect(unresolved).toEqual([])
    expect(state.tiers).toEqual({ [ownersBoard.id]: oldEditedTiers })
  })
})

describe('aspect tier canon', () => {
  it('matches the owner-transcribed aspect tier for every aspect config in the seed', () => {
    expect(Object.keys(ASPECT_TIER)).toHaveLength(31)
    for (const config of expand(spirits)) {
      if (!config.aspect) continue
      const expected = ASPECT_TIER[config.aspect.name]
      expect(expected, `no canonical tier recorded for aspect "${config.aspect.name}"`).toBeDefined()
      expect(seededTiers[config.configId], `${config.configId} seed tier mismatch`).toBe(expected)
    }
  })
})
