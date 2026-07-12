import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import otherCardSourceText from './fixtures/otherCardSourceText.json'
import otherCardsData from '../../data/other-cards.json'
import powerCardsData from '../../data/power-cards.json'
import { classifyBlight, classifyFear } from '../otherCardClassifier'
import { BLIGHT_TAGS, EVENT_CLASSES, FEAR_TAGS } from '../types'
import type { OtherCard, PowerCard } from '../types'

const cards = powerCardsData as PowerCard[]
const otherCards = otherCardsData as OtherCard[]

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

describe('other-card canon (fear, event, blight)', () => {
  it('has exactly 50 fear, 65 event, 24 blight cards (139 total)', () => {
    const counts = { fear: 0, event: 0, blight: 0 }
    for (const card of otherCards) counts[card.kind]++
    expect(counts).toEqual({ fear: 50, event: 65, blight: 24 })
    expect(otherCards).toHaveLength(139)
  })

  it('has globally unique names', () => {
    const names = otherCards.map((c) => c.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('every card resolves to an image that exists under public/', () => {
    for (const card of otherCards) {
      expect(existsSync(new URL(`../../../public/${card.image}`, import.meta.url)), `${card.name} -> ${card.image} does not exist`).toBe(true)
    }
  })

  it('all 471 cards together (power + other) have globally unique names', () => {
    const names = [...cards.map((c) => c.name), ...otherCards.map((c) => c.name)]
    expect(names).toHaveLength(471)
    expect(new Set(names).size).toBe(471)
  })
})

/**
 * v5 #02/#03's sub-typing. Two disciplines, same as the power-card canon above:
 * (a) schema tripwires - every committed tag/class is one this repo actually decided on, never a
 * stray value a rule-set edit introduced by accident; (b) canonical spot-checks, values read by
 * hand from the real card text during #02's grilling (see .scratch/v5/issues/02-what-the-buckets-are.md),
 * not re-derived from the classifier itself - re-deriving them would make the test circular and
 * blind to a classifier regression.
 */
describe('other-card sub-type canon', () => {
  it('every event card carries one of the five upstream classes, in the counts #02 found', () => {
    const events = otherCards.filter((c) => c.kind === 'event')
    for (const card of events) {
      expect(EVENT_CLASSES, `${card.name} has an unknown eventClass`).toContain(card.eventClass)
    }
    const counts: Record<string, number> = {}
    for (const card of events) counts[card.eventClass] = (counts[card.eventClass] ?? 0) + 1
    expect(counts).toEqual({ choice: 18, healthyBlightedLand: 25, terrorLevel: 12, stage: 9, adversary: 1 })
  })

  it('every fear card only carries tags from the committed FEAR_TAGS set', () => {
    for (const card of otherCards) {
      if (card.kind !== 'fear') continue
      for (const tag of card.tags) expect(FEAR_TAGS, `${card.name} has an unknown fear tag`).toContain(tag)
    }
  })

  it('every blight card only carries tags from the committed BLIGHT_TAGS set, marked as judgment', () => {
    for (const card of otherCards) {
      if (card.kind !== 'blight') continue
      for (const tag of card.tags) expect(BLIGHT_TAGS, `${card.name} has an unknown blight tag`).toContain(tag)
      expect(card.tagsSource, `${card.name} is missing tagsSource: 'judgment'`).toBe('judgment')
    }
  })

  /**
   * #03's full-corpus tripwire: "re-running the classifier over the committed text must reproduce
   * the committed tags exactly." `otherCardSourceText.json` is the literal text each fear/blight
   * card was classified from (written by `scripts/extract-other-cards.mjs` alongside the tags
   * themselves), so this re-runs the same pure functions against every card, not a hand-picked
   * sample - a rule-set edit that silently changes a card's tags fails here even if that card
   * isn't one of the spot-checks below.
   */
  it('re-running the classifier over the committed source text reproduces every committed tag exactly', () => {
    const byName = new Map(otherCards.map((c) => [c.name, c]))
    for (const { name, kind, text } of otherCardSourceText) {
      const card = byName.get(name)
      expect(card, `${name} is missing from other-cards.json`).toBeDefined()
      const expectedTags = kind === 'fear' ? classifyFear(text) : classifyBlight(text)
      expect((card as { tags: string[] }).tags, name).toEqual(expectedTags)
    }
  })

  it('matches independently spot-checked fear/blight tags for a sample of real cards', () => {
    const byName = new Map(otherCards.map((c) => [c.name, c]))
    const expected: [string, string[]][] = [
      // "Defend 2..." at L1/L2, "removes up to 2 Health worth of Invaders" at L3.
      ['Belief Takes Root', ['removal', 'defensive']],
      // "destroy 1 Explorer" — removal only.
      ['Angry Mobs', ['removal']],
      // "Invaders do not Explore.../do not Build..." — disruption only.
      ['Avoid the Dahan', ['disruption']],
      // "Each player adds 1 Strife..." — weaken only.
      ['Civil Unrest', ['weaken']],
      // "Each player may Push up to 2 Explorer..." — displacement only.
      ['Retreat!', ['displacement']],
      // direct Damage with no remove/defend/strife/isolate/push wording — genuinely unclassified.
      ['Dahan Raid', []],
      // "each Spirit destroys 1 of their Presence" — presenceLoss only.
      ['Downward Spiral', ['presenceLoss']],
      // "Add 1 Town and 1 City..." — boardChange only.
      ['Promising Farmlands', ['boardChange']],
      // "Invaders deal +2 Damage" during Ravage — damageBonus only.
      ['Intensifying Exploitation', ['damageBonus']],
      // "gains +1 Energy and +1 Card Play" — resourceSwing only.
      ['Back Against the Wall', ['resourceSwing']],
      // adds Fear Markers, not Energy/Card Play/Power Card/board tokens — genuinely unclassified.
      ['Invaders find the Land to their Liking', []],
    ]
    for (const [name, tags] of expected) {
      const card = byName.get(name)
      expect(card, `${name} is missing from the dataset`).toBeDefined()
      expect((card as { tags: string[] }).tags, name).toEqual(tags)
    }
  })
})
