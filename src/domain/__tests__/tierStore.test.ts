import { describe, expect, it } from 'vitest'
import { memoryStorage } from '../storage'
import { createTierStore } from '../tierStore'

describe('tierStore', () => {
  it('falls back to the seeded tier when there is no override', () => {
    const store = createTierStore(memoryStorage())
    expect(store.getTier('lightnings-swift-strike')).toBe('B')
  })

  it('round-trips setTier then getTier', () => {
    const store = createTierStore(memoryStorage())
    store.setTier('lightnings-swift-strike', 'S')
    expect(store.getTier('lightnings-swift-strike')).toBe('S')
  })

  it('reset restores the seeded default', () => {
    const store = createTierStore(memoryStorage())
    store.setTier('lightnings-swift-strike', 'S')
    store.reset()
    expect(store.getTier('lightnings-swift-strike')).toBe('B')
  })

  it('edits survive a simulated reload (same backing storage, fresh store instance)', () => {
    const storage = memoryStorage()
    createTierStore(storage).setTier('lightnings-swift-strike', 'S')
    const reloaded = createTierStore(storage)
    expect(reloaded.getTier('lightnings-swift-strike')).toBe('S')
  })

  it('getAll overlays edits on top of the full seeded set', () => {
    const store = createTierStore(memoryStorage())
    store.setTier('lightnings-swift-strike', 'S')
    const all = store.getAll()
    expect(all['lightnings-swift-strike']).toBe('S')
    expect(all['river-surges-in-sunlight']).toBe('B')
  })
})
