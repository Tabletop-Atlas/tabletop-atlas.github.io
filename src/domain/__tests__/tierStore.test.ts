import { describe, expect, it } from 'vitest'
import tiersData from '../../data/tiers.json'
import { memoryStorage } from '../storage'
import type { Tier } from '../types'
import { createTierStore } from '../tierStore'

const SEED = tiersData.tiers as Record<string, Tier>
const LIGHTNING = 'lightnings-swift-strike'
const RIVER = 'river-surges-in-sunlight'

// Assert against the seed file rather than a literal, so re-tiering the seed data
// doesn't break the store's behavioural tests.
const seedOf = (id: string) => SEED[id]
const notSeedOf = (id: string): Tier => (seedOf(id) === 'S' ? 'A' : 'S')

describe('tierStore', () => {
  it('falls back to the seeded tier when there is no override', () => {
    const store = createTierStore(memoryStorage())
    expect(store.getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
  })

  it('round-trips setTier then getTier', () => {
    const store = createTierStore(memoryStorage())
    const override = notSeedOf(LIGHTNING)
    store.setTier(LIGHTNING, override)
    expect(store.getTier(LIGHTNING)).toBe(override)
  })

  it('reset restores the seeded default', () => {
    const store = createTierStore(memoryStorage())
    store.setTier(LIGHTNING, notSeedOf(LIGHTNING))
    store.reset()
    expect(store.getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
  })

  it('edits survive a simulated reload (same backing storage, fresh store instance)', () => {
    const storage = memoryStorage()
    const override = notSeedOf(LIGHTNING)
    createTierStore(storage).setTier(LIGHTNING, override)
    const reloaded = createTierStore(storage)
    expect(reloaded.getTier(LIGHTNING)).toBe(override)
  })

  it('getAll overlays edits on top of the full seeded set', () => {
    const store = createTierStore(memoryStorage())
    const override = notSeedOf(LIGHTNING)
    store.setTier(LIGHTNING, override)
    const all = store.getAll()
    expect(all[LIGHTNING]).toBe(override)
    expect(all[RIVER]).toBe(seedOf(RIVER))
  })
})
