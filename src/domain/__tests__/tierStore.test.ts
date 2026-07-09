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

  it('discards overrides saved against a different seed', () => {
    // A saved edit from an older shipped tier list must not silently shadow the new seed.
    const storage = memoryStorage()
    storage.setItem(
      'spirit-island:tier-overrides',
      JSON.stringify({ seed: 'a-stale-fingerprint', overrides: { [LIGHTNING]: 'F' } }),
    )
    const store = createTierStore(storage)
    expect(store.getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
    expect(store.isCustomised()).toBe(false)
  })

  it('reports a discard on fingerprint mismatch, and stays reported across reads until dismissed', () => {
    const storage = memoryStorage()
    storage.setItem(
      'spirit-island:tier-overrides',
      JSON.stringify({ seed: 'a-stale-fingerprint', overrides: { [LIGHTNING]: 'F' } }),
    )
    const store = createTierStore(storage)
    expect(store.wasDiscarded()).toBe(true)
    // Storage no longer holds the stale entry, but the notice must survive further reads.
    expect(store.getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
    expect(store.wasDiscarded()).toBe(true)
    store.dismissDiscardNotice()
    expect(store.wasDiscarded()).toBe(false)
  })

  it('does not report a discard for a fresh install with nothing ever stored', () => {
    const store = createTierStore(memoryStorage())
    expect(store.wasDiscarded()).toBe(false)
  })

  it('discards overrides stored in the pre-versioning format', () => {
    const storage = memoryStorage()
    storage.setItem('spirit-island:tier-overrides', JSON.stringify({ [LIGHTNING]: 'F' }))
    const store = createTierStore(storage)
    expect(store.getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
  })

  it('survives corrupt stored JSON', () => {
    const storage = memoryStorage()
    storage.setItem('spirit-island:tier-overrides', '{not json')
    expect(createTierStore(storage).getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
  })

  it('getOverrides returns only the user edits, empty when nothing changed', () => {
    const store = createTierStore(memoryStorage())
    expect(store.getOverrides()).toEqual({})
    const override = notSeedOf(LIGHTNING)
    store.setTier(LIGHTNING, override)
    expect(store.getOverrides()).toEqual({ [LIGHTNING]: override })
  })

  it('reports whether the user has customised the list', () => {
    const store = createTierStore(memoryStorage())
    expect(store.isCustomised()).toBe(false)
    store.setTier(LIGHTNING, notSeedOf(LIGHTNING))
    expect(store.isCustomised()).toBe(true)
    store.reset()
    expect(store.isCustomised()).toBe(false)
  })
})
