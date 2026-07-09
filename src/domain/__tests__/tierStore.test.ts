import { describe, expect, it } from 'vitest'
import ownersBoardData from '../../data/tier-lists/owners-board.json'
import { memoryStorage } from '../storage'
import type { TierList } from '../types'
import { createTierStore, groupByTier } from '../tierStore'
import type { Configuration } from '../configurations'

const OWNERS_BOARD = ownersBoardData as TierList
const LIGHTNING = 'lightnings-swift-strike'
const RIVER = 'river-surges-in-sunlight'

const seedOf = (id: string) => OWNERS_BOARD.tiers[id]
const notSeedOf = (id: string): string => (seedOf(id) === 'S' ? 'A' : 'S')

const CITED_LIST: TierList = {
  id: 'cited-fixture',
  name: 'A Cited List',
  type: 'strength',
  players: 1,
  origin: 'cited',
  tierLabels: ['S', 'A', 'B', 'C', 'D', 'F'],
  methodology: 'test fixture',
  source: {
    author: 'Someone',
    title: 'A video',
    url: 'https://example.com',
    retrievedAt: '2026-01-01',
    method: 'llm-transcript-scrape',
  },
  verified: false,
  tiers: { [LIGHTNING]: 'S' },
}

const SIX_BAND_LIST: TierList = {
  id: 'six-band-fixture',
  name: 'Six Band',
  type: 'strength',
  origin: 'personal',
  tierLabels: ['S', 'A', 'B', 'C', 'D', 'F'],
  methodology: 'test fixture',
  verified: true,
  tiers: { [LIGHTNING]: 'A' },
}

const SINGLE_BAND_LIST: TierList = {
  id: 'single-band-fixture',
  name: 'One Band',
  type: 'strength',
  origin: 'personal',
  tierLabels: ['Only'],
  methodology: 'test fixture',
  verified: true,
  tiers: { [LIGHTNING]: 'Only' },
}

function config(configId: string): Configuration {
  return {
    configId,
    spirit: {
      id: configId,
      name: configId,
      expansion: 'Base',
      complexity: 'Low',
      ratings: { offense: 1, control: 1, fear: 1, defense: 1, utility: 1 },
      elements: [],
      summary: '',
      tags: [],
      aspects: [],
    },
    isBase: true,
    effectiveComplexity: 'Low',
    personalEffectiveComplexity: 'Low',
  }
}

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
    const storage = memoryStorage()
    storage.setItem(
      `spirit-island:tier-overrides:${OWNERS_BOARD.id}`,
      JSON.stringify({ seed: 'a-stale-fingerprint', overrides: { [LIGHTNING]: 'F' } }),
    )
    const store = createTierStore(storage)
    expect(store.getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
    expect(store.isCustomised()).toBe(false)
  })

  it('reports a discard on fingerprint mismatch, and stays reported across reads until dismissed', () => {
    const storage = memoryStorage()
    storage.setItem(
      `spirit-island:tier-overrides:${OWNERS_BOARD.id}`,
      JSON.stringify({ seed: 'a-stale-fingerprint', overrides: { [LIGHTNING]: 'F' } }),
    )
    const store = createTierStore(storage)
    expect(store.wasDiscarded()).toBe(true)
    expect(store.getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
    expect(store.wasDiscarded()).toBe(true)
    store.dismissDiscardNotice()
    expect(store.wasDiscarded()).toBe(false)
  })

  it('does not report a discard for a fresh install with nothing ever stored', () => {
    const store = createTierStore(memoryStorage())
    expect(store.wasDiscarded()).toBe(false)
  })

  it('survives corrupt stored JSON', () => {
    const storage = memoryStorage()
    storage.setItem(`spirit-island:tier-overrides:${OWNERS_BOARD.id}`, '{not json')
    expect(createTierStore(storage).getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
  })

  it('getOverrides returns only the user edits, empty when nothing changed', () => {
    const store = createTierStore(memoryStorage())
    expect(store.getOverrides()).toEqual({})
    const override = notSeedOf(LIGHTNING)
    store.setTier(LIGHTNING, override)
    expect(store.getOverrides()).toEqual({ [LIGHTNING]: override })
  })

  it('getOverrides excludes a no-op edit (assigning the tier a spirit already has)', () => {
    const store = createTierStore(memoryStorage())
    store.setTier(LIGHTNING, seedOf(LIGHTNING))
    expect(store.getOverrides()).toEqual({})
  })

  it('reports whether the user has customised the list', () => {
    const store = createTierStore(memoryStorage())
    expect(store.isCustomised()).toBe(false)
    store.setTier(LIGHTNING, notSeedOf(LIGHTNING))
    expect(store.isCustomised()).toBe(true)
    store.reset()
    expect(store.isCustomised()).toBe(false)
  })

  it('a no-op edit is not a customisation - isCustomised agrees with getOverrides', () => {
    const store = createTierStore(memoryStorage())
    store.setTier(LIGHTNING, seedOf(LIGHTNING))
    expect(store.getOverrides()).toEqual({})
    expect(store.isCustomised()).toBe(false)
  })

  describe('v2 -> v3 migration (issue #01)', () => {
    it('migrates a v2 payload onto the owner\'s personal list and its edits still apply', () => {
      const storage = memoryStorage()
      storage.setItem(
        'spirit-island:tier-overrides',
        JSON.stringify({ seed: 'whatever-the-old-fingerprint-was', overrides: { [LIGHTNING]: 'F' } }),
      )
      const store = createTierStore(storage)
      expect(store.getTier(LIGHTNING)).toBe('F')
      expect(store.wasDiscarded()).toBe(false)
    })

    it('discards a payload that cannot be migrated, and reports it', () => {
      const storage = memoryStorage()
      storage.setItem('spirit-island:tier-overrides', '{not json')
      const store = createTierStore(storage)
      expect(store.wasDiscarded()).toBe(true)
      expect(store.getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
    })

    it('a fresh install never sets wasDiscarded from the old key', () => {
      const store = createTierStore(memoryStorage())
      expect(store.wasDiscarded()).toBe(false)
    })
  })

  describe('multi-list selection and per-list overrides (issue #04)', () => {
    const shipped = [OWNERS_BOARD, CITED_LIST]

    it('a fresh install selects the owner\'s board', () => {
      const store = createTierStore(memoryStorage(), shipped)
      expect(store.getActiveListId()).toBe(OWNERS_BOARD.id)
    })

    it('the active list persists across a simulated reload', () => {
      const storage = memoryStorage()
      createTierStore(storage, shipped).setActiveListId(CITED_LIST.id)
      expect(createTierStore(storage, shipped).getActiveListId()).toBe(CITED_LIST.id)
    })

    it('an override written to one list is not visible from another', () => {
      const storage = memoryStorage()
      const store = createTierStore(storage, [OWNERS_BOARD, SIX_BAND_LIST])
      store.setTier(LIGHTNING, notSeedOf(LIGHTNING))
      store.setActiveListId(SIX_BAND_LIST.id)
      expect(store.getTier(LIGHTNING)).toBe(SIX_BAND_LIST.tiers[LIGHTNING])
    })

    it('setTier on a cited list is refused and leaves storage untouched', () => {
      const storage = memoryStorage()
      const store = createTierStore(storage, shipped)
      store.setActiveListId(CITED_LIST.id)
      store.setTier(LIGHTNING, 'F')
      expect(store.getTier(LIGHTNING)).toBe('S') // unchanged from CITED_LIST's seed
      expect(storage.getItem(`spirit-island:tier-overrides:${CITED_LIST.id}`)).toBeNull()
    })

    it('isCustomised and getOverrides report against the active list only', () => {
      const storage = memoryStorage()
      const store = createTierStore(storage, [OWNERS_BOARD, SIX_BAND_LIST])
      store.setTier(LIGHTNING, notSeedOf(LIGHTNING))
      store.setActiveListId(SIX_BAND_LIST.id)
      expect(store.isCustomised()).toBe(false)
      expect(store.getOverrides()).toEqual({})
    })

    it('resetting one personal list leaves another personal list\'s overrides intact', () => {
      const storage = memoryStorage()
      const store = createTierStore(storage, [OWNERS_BOARD, SIX_BAND_LIST])
      store.setTier(LIGHTNING, notSeedOf(LIGHTNING))
      store.setActiveListId(SIX_BAND_LIST.id)
      store.setTier(LIGHTNING, 'F')
      store.reset() // resets only the active list (SIX_BAND_LIST)
      expect(store.getTier(LIGHTNING)).toBe(SIX_BAND_LIST.tiers[LIGHTNING])
      store.setActiveListId(OWNERS_BOARD.id)
      expect(store.getTier(LIGHTNING)).toBe(notSeedOf(LIGHTNING))
    })

    it('the fingerprint discard guarantee holds per list', () => {
      const storage = memoryStorage()
      storage.setItem(
        `spirit-island:tier-overrides:${SIX_BAND_LIST.id}`,
        JSON.stringify({ seed: 'stale', overrides: { [LIGHTNING]: 'F' } }),
      )
      const store = createTierStore(storage, [OWNERS_BOARD, SIX_BAND_LIST])
      store.setActiveListId(SIX_BAND_LIST.id)
      expect(store.wasDiscarded()).toBe(true)
      store.setActiveListId(OWNERS_BOARD.id)
      expect(store.wasDiscarded()).toBe(false)
    })
  })

  describe('rank normalisation (issue #03)', () => {
    it('computes rank as position / (length - 1), strongest at 0', () => {
      const store = createTierStore(memoryStorage(), [SIX_BAND_LIST])
      store.setActiveListId(SIX_BAND_LIST.id)
      // 'A' is index 1 of ['S','A','B','C','D','F'] -> 1/5
      expect(store.getRankPrior()[LIGHTNING]).toBeCloseTo(1 / 5)
    })

    it('a single-band list ranks every rated configuration 0 without dividing by zero', () => {
      const store = createTierStore(memoryStorage(), [SINGLE_BAND_LIST])
      store.setActiveListId(SINGLE_BAND_LIST.id)
      expect(store.getRankPrior()[LIGHTNING]).toBe(0)
    })

    it('two lists with different vocabularies but the same position for a spirit produce the same prior', () => {
      const listA: TierList = { ...SIX_BAND_LIST, id: 'vocab-a', tierLabels: ['S', 'A', 'B', 'C', 'D', 'F'], tiers: { [LIGHTNING]: 'A' } }
      const listB: TierList = {
        ...SIX_BAND_LIST,
        id: 'vocab-b',
        tierLabels: ['Top', 'High', 'Mid', 'Low', 'Bottom', 'Worst'],
        tiers: { [LIGHTNING]: 'High' },
      }
      // Both labels sit at index 1 of a 6-band vocabulary - no component decides 'A' means 'High'.
      const storeA = createTierStore(memoryStorage(), [listA])
      const storeB = createTierStore(memoryStorage(), [listB])
      expect(storeA.getRankPrior()[LIGHTNING]).toBeCloseTo(storeB.getRankPrior()[LIGHTNING])
    })

    it('does not include unrated configurations in the rank prior', () => {
      const store = createTierStore(memoryStorage(), [SIX_BAND_LIST])
      expect(store.getRankPrior()[RIVER]).toBeUndefined()
    })
  })

  describe('personal fun list (issue #09)', () => {
    it('a created list starts fully unrated', () => {
      const store = createTierStore(memoryStorage())
      const created = store.createList({ name: 'My Fun List', type: 'fun' })
      expect(created.tiers).toEqual({})
      store.setActiveListId(created.id)
      expect(store.getTier(LIGHTNING)).toBeUndefined()
    })

    it('rating a configuration on a created list does not change it on the owner\'s board', () => {
      const store = createTierStore(memoryStorage())
      const created = store.createList({ name: 'My Fun List', type: 'fun' })
      store.setActiveListId(created.id)
      store.setTier(LIGHTNING, 'X')
      store.setActiveListId(OWNERS_BOARD.id)
      expect(store.getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
    })

    it('a created list persists across a simulated reload', () => {
      const storage = memoryStorage()
      const created = createTierStore(storage).createList({ name: 'My Fun List', type: 'fun' })
      const reloaded = createTierStore(storage)
      expect(reloaded.getLists().some((l) => l.id === created.id)).toBe(true)
    })
  })
})

describe('groupByTier (issue #02)', () => {
  it('places unrated configurations in the unrated bucket, and a full-coverage list leaves it empty', () => {
    const configs = [config('a'), config('b')]
    const { labeled, unrated } = groupByTier(configs, { a: 'S', b: 'A' }, ['S', 'A', 'B'])
    expect(labeled.S).toEqual([configs[0]])
    expect(labeled.A).toEqual([configs[1]])
    expect(unrated).toEqual([])
  })

  it('a configuration absent from tiers lands in the unrated bucket', () => {
    const configs = [config('a'), config('b')]
    const { labeled, unrated } = groupByTier(configs, { a: 'S' }, ['S', 'A', 'B'])
    expect(labeled.S).toEqual([configs[0]])
    expect(unrated).toEqual([configs[1]])
  })

  it('a fixture list with six labels renders six bands, not seven', () => {
    const { labeled } = groupByTier([], {}, ['S', 'A', 'B', 'C', 'D', 'F'])
    expect(Object.keys(labeled)).toHaveLength(6)
  })

  it('never invents a fallback tier for an unknown label', () => {
    const configs = [config('a')]
    const { labeled, unrated } = groupByTier(configs, { a: 'not-a-real-label' }, ['S', 'A'])
    expect(labeled.S).toEqual([])
    expect(labeled.A).toEqual([])
    expect(unrated).toEqual(configs)
  })
})
