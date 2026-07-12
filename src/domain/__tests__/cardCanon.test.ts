import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import powerCardsData from '../../data/power-cards.json'
import type { PowerCard } from '../types'

const cards = powerCardsData as PowerCard[]

/**
 * Pins the field values of a handful of cards independently spot-checked against real card art
 * during v4 #04's prototype judging (Playwright screenshots, cross-referenced by a human) — not
 * re-derived from this ticket's own extraction script, which would make the test circular.
 * Same discipline as aspectCanon.test.ts and startingCardsCanon.test.ts: a tripwire against drift.
 */
const CANONICAL_SPOT_CHECKS: Partial<PowerCard>[] = [
  { name: 'Shatter Homesteads', kind: 'unique', spirit: 'lightnings-swift-strike', cost: 2, speed: 'Slow', elements: ['Fire', 'Air'] },
  { name: 'A Year of Perfect Stillness', kind: 'unique', spirit: 'vital-strength-of-the-earth', cost: 3, speed: 'Fast', elements: ['Sun', 'Earth'] },
  { name: "Call on Midnight's Dream", kind: 'unique', spirit: 'bringer-of-dreams-and-nightmares', cost: 0, speed: 'Fast', elements: ['Moon', 'Animal'] },
  { name: 'Steam Vents', kind: 'minor', cost: 1, speed: 'Fast', elements: ['Fire', 'Air', 'Water', 'Earth'] },
  { name: 'Call to Isolation', kind: 'minor', cost: 0, speed: 'Fast', elements: ['Sun', 'Air', 'Animal'] },
  { name: 'The Jungle Hungers', kind: 'major', cost: 3, speed: 'Slow', elements: ['Moon', 'Plant'] },
  { name: 'Bloodwrack Plague', kind: 'major', cost: 4, speed: 'Fast', elements: ['Water', 'Earth', 'Animal'] },
  { name: 'Reach from the Infinite Darkness', kind: 'unique', spirit: 'breath-of-darkness-down-your-spine', cost: 0, speed: 'Fast', elements: ['Moon', 'Air', 'Animal'] },
]

describe('card canon', () => {
  it('has exactly 101 minor, 78 major, 153 unique power cards (332 total)', () => {
    const counts = { minor: 0, major: 0, unique: 0 }
    for (const card of cards) counts[card.kind]++
    expect(counts).toEqual({ minor: 101, major: 78, unique: 153 })
    expect(cards).toHaveLength(332)
  })

  it('matches independently spot-checked fields for a sample of real cards', () => {
    const byName = new Map(cards.map((c) => [c.name, c]))
    for (const expected of CANONICAL_SPOT_CHECKS) {
      const actual = byName.get(expected.name!)
      expect(actual, `${expected.name} is missing from the dataset`).toBeDefined()
      expect(actual).toMatchObject(expected)
    }
  })

  it('gives every unique power a spirit and a spirit name', () => {
    for (const card of cards) {
      if (card.kind !== 'unique') continue
      expect(card.spirit, `${card.name} has no spirit`).toBeTruthy()
      expect(card.spiritName, `${card.name} has no spiritName`).toBeTruthy()
    }
  })

  it('has globally unique card names', () => {
    const names = cards.map((c) => c.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('every card resolves to an image that exists under public/', () => {
    for (const card of cards) {
      expect(existsSync(new URL(`../../../public/${card.image}`, import.meta.url)), `${card.name} -> ${card.image} does not exist`).toBe(true)
    }
  })
})
