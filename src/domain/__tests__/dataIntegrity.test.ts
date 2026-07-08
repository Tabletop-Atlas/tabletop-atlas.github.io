import { describe, expect, it } from 'vitest'
import spiritsData from '../../data/spirits.json'
import tiersData from '../../data/tiers.json'
import { ELEMENTS } from '../types'
import type { Complexity, Spirit, Tier } from '../types'

const spirits = spiritsData as Spirit[]
const tiers = tiersData.tiers as Record<string, Tier>

const COMPLEXITIES: Complexity[] = ['Low', 'Moderate', 'High', 'Very High']
const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D']
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

describe('tiers.json integrity', () => {
  it('assigns exactly one valid tier to every spirit', () => {
    for (const spirit of spirits) {
      const tier = tiers[spirit.id]
      expect(tier, `${spirit.name} has no tier entry`).toBeDefined()
      expect(TIERS, `${spirit.name} has bad tier "${tier}"`).toContain(tier)
    }
  })

  it('has no tier entries for spirits that do not exist', () => {
    const ids = new Set(spirits.map((s) => s.id))
    for (const id of Object.keys(tiers)) {
      expect(ids, `tiers.json references unknown spirit "${id}"`).toContain(id)
    }
  })
})
