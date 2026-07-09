import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import spiritsData from '../../data/spirits.json'
import ownersBoardData from '../../data/tier-lists/owners-board.json'
import { expand } from '../configurations'
import { ELEMENTS } from '../types'
import type { Complexity, Spirit, TierList } from '../types'

const spirits = spiritsData as Spirit[]
const ownersBoard = ownersBoardData as TierList
const configurations = expand(spirits)

const COMPLEXITIES: Complexity[] = ['Low', 'Moderate', 'High', 'Very High']
const AXES = ['offense', 'control', 'fear', 'defense', 'utility'] as const

// The printed reference sheet uses a 1-6 scale (e.g. Ember-Eyed Behemoth's offense is 6).
const MIN_RATING = 0
const MAX_RATING = 6

describe('spirits.json integrity', () => {
  it('has a unique id for every spirit', () => {
    const ids = spirits.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only uses the eight canonical elements', () => {
    for (const spirit of spirits) {
      expect(spirit.elements.length, `${spirit.name} has no elements`).toBeGreaterThan(0)
      for (const element of spirit.elements) {
        expect(ELEMENTS, `${spirit.name} has unknown element "${element}"`).toContain(element)
      }
    }
  })

  it('has no duplicate elements on a spirit', () => {
    for (const spirit of spirits) {
      expect(new Set(spirit.elements).size, `${spirit.name} repeats an element`).toBe(spirit.elements.length)
    }
  })

  it('keeps every OCFDU rating within the printed scale', () => {
    for (const spirit of spirits) {
      for (const axis of AXES) {
        const value = spirit.ratings[axis]
        expect(Number.isInteger(value), `${spirit.name}.${axis} is not an integer`).toBe(true)
        expect(value, `${spirit.name}.${axis} out of range`).toBeGreaterThanOrEqual(MIN_RATING)
        expect(value, `${spirit.name}.${axis} out of range`).toBeLessThanOrEqual(MAX_RATING)
      }
    }
  })

  it('uses a valid complexity for every spirit', () => {
    for (const spirit of spirits) {
      expect(COMPLEXITIES, `${spirit.name} has bad complexity`).toContain(spirit.complexity)
    }
  })

  it('gives every spirit a non-empty summary', () => {
    for (const spirit of spirits) {
      expect(spirit.summary.trim().length, `${spirit.name} has no summary`).toBeGreaterThan(0)
    }
  })

  it('only uses known axis hints in aspect shiftsToward', () => {
    const valid = AXES.map((axis) => `+${axis}`)
    for (const spirit of spirits) {
      for (const aspect of spirit.aspects) {
        if (aspect.shiftsToward === undefined) continue
        expect(valid, `${spirit.name}/${aspect.name} has bad shiftsToward`).toContain(aspect.shiftsToward)
      }
    }
  })

  it('flags unverified ratings as estimates and vice versa', () => {
    // Every spirit still under review must declare its ratings are estimates, so a
    // fabricated number can never be mistaken for a printed one.
    for (const spirit of spirits) {
      if (spirit.reviewNeeded) {
        expect(spirit.ratingsSource, `${spirit.name} is under review but not marked an estimate`).toBe('estimate')
      }
    }
  })
})

describe('spirit artwork', () => {
  it('ships an art file for every spirit at its slug', () => {
    // SpiritArt resolves public/spirits/<image ?? id>.webp. A renamed id or a missing
    // download would otherwise degrade silently to a placeholder tile.
    for (const spirit of spirits) {
      const slug = spirit.image ?? spirit.id
      const path = new URL(`../../../public/spirits/${slug}.webp`, import.meta.url)
      expect(existsSync(path), `${spirit.name} has no artwork at public/spirits/${slug}.webp`).toBe(true)
    }
  })
})

describe("owner's board integrity", () => {
  it('assigns exactly one valid tier to every configuration (68: 37 spirits + 31 aspects)', () => {
    expect(configurations).toHaveLength(68)
    for (const config of configurations) {
      const tier = ownersBoard.tiers[config.configId]
      expect(tier, `${config.configId} has no tier entry`).toBeDefined()
      expect(ownersBoard.tierLabels, `${config.configId} has bad tier "${tier}"`).toContain(tier)
    }
  })

  it('has no tier entries for configurations that do not exist', () => {
    const ids = new Set(configurations.map((c) => c.configId))
    for (const id of Object.keys(ownersBoard.tiers)) {
      expect(ids, `owners-board.json references unknown configuration "${id}"`).toContain(id)
    }
  })

  it('has exactly 68 entries', () => {
    expect(Object.keys(ownersBoard.tiers)).toHaveLength(68)
  })
})
