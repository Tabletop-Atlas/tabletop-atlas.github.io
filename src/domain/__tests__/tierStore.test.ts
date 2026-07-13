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
  subject: 'configurations',
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
  subject: 'configurations',
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
  subject: 'configurations',
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

    it('the active pick is session state; a simulated reload boots the default list (#12)', () => {
      const storage = memoryStorage()
      createTierStore(storage, shipped).setActiveListId(CITED_LIST.id)
      expect(createTierStore(storage, shipped).getActiveListId()).toBe(OWNERS_BOARD.id)
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

  describe('clearTier — moving a configuration to unrated (#15)', () => {
    it('clearing a seed-rated configuration makes it unrated: getTier undefined, absent from getAll', () => {
      const store = createTierStore(memoryStorage())
      store.clearTier(LIGHTNING)
      expect(store.getTier(LIGHTNING)).toBeUndefined()
      expect(LIGHTNING in store.getAll()).toBe(false)
    })

    it('an un-rating persists through the existing override machinery across a simulated reload', () => {
      const storage = memoryStorage()
      createTierStore(storage).clearTier(LIGHTNING)
      const reloaded = createTierStore(storage)
      expect(reloaded.getTier(LIGHTNING)).toBeUndefined()
    })

    it('re-assigning a tier after clearing restores it', () => {
      const store = createTierStore(memoryStorage())
      store.clearTier(LIGHTNING)
      store.setTier(LIGHTNING, 'S')
      expect(store.getTier(LIGHTNING)).toBe('S')
    })

    it('clearing a configuration the list never rated is a no-op, not an edit', () => {
      const store = createTierStore(memoryStorage(), [SIX_BAND_LIST])
      store.setActiveListId(SIX_BAND_LIST.id)
      store.clearTier(RIVER) // SIX_BAND_LIST never rated RIVER
      expect(store.getOverrides()).toEqual({})
      expect(store.isCustomised()).toBe(false)
    })

    it('clearing an override (not a seed rating) restores the seed absence rather than recording an edit', () => {
      const store = createTierStore(memoryStorage(), [SIX_BAND_LIST])
      store.setActiveListId(SIX_BAND_LIST.id)
      store.setTier(RIVER, 'A')
      store.clearTier(RIVER)
      expect(store.getTier(RIVER)).toBeUndefined()
      expect(store.isCustomised()).toBe(false)
    })

    it('refuses to clear on a cited list, like setTier', () => {
      const store = createTierStore(memoryStorage(), [OWNERS_BOARD, CITED_LIST])
      store.setActiveListId(CITED_LIST.id)
      store.clearTier(LIGHTNING)
      expect(store.getTier(LIGHTNING)).toBe('S')
    })

    it('an un-rating survives a backup round-trip (export overrides, import them elsewhere)', () => {
      const storageA = memoryStorage()
      const storeA = createTierStore(storageA)
      storeA.clearTier(LIGHTNING)
      const exported = storeA.getOverrides()

      const storeB = createTierStore(memoryStorage())
      storeB.importOverrides({ [OWNERS_BOARD.id]: exported })
      expect(storeB.getTier(LIGHTNING)).toBeUndefined()
    })

    it('a cleared configuration never leaks into the rank prior', () => {
      const store = createTierStore(memoryStorage())
      store.clearTier(LIGHTNING)
      expect(store.getRankPrior()[LIGHTNING]).toBeUndefined()
    })
  })

  describe('the subject axis (#12 / ADR 0002)', () => {
    const MINOR_LIST: TierList = {
      id: 'minor-cited-fixture',
      name: 'A Minor-Powers List',
      type: 'strength',
      subject: 'minor-powers',
      origin: 'cited',
      tierLabels: ['S', 'A', 'B'],
      methodology: 'test fixture',
      source: {
        author: 'Someone',
        title: 'A card video',
        url: 'https://example.com/cards',
        retrievedAt: '2026-01-01',
        method: 'llm-transcript-scrape',
      },
      verified: false,
      tiers: { 'Call of the Dahan Ways': 'S' },
    }
    const shipped = [OWNERS_BOARD, CITED_LIST, MINOR_LIST]

    it('tracks one active list per subject: activating a card list leaves the configurations active untouched', () => {
      const store = createTierStore(memoryStorage(), shipped)
      store.setActiveListId(MINOR_LIST.id)
      expect(store.getActiveListFor('minor-powers')?.id).toBe(MINOR_LIST.id)
      expect(store.getActiveListFor('configurations')?.id).toBe(OWNERS_BOARD.id)
      expect(store.getActiveList().id).toBe(OWNERS_BOARD.id)
    })

    it('a subject with no lists has no active list', () => {
      const store = createTierStore(memoryStorage(), shipped)
      expect(store.getActiveListFor('major-powers')).toBeUndefined()
    })

    it('a fresh install boots the owner\'s board as the configurations default (#18 verified the seed and escalated — stays until the owner answers, see ADR 0002)', () => {
      const store = createTierStore(memoryStorage(), shipped)
      expect(store.getDefaultList('configurations')?.id).toBe(OWNERS_BOARD.id)
      expect(store.getActiveList().id).toBe(OWNERS_BOARD.id)
    })

    it('the default list is durable: setDefaultListId changes which list boots active after a simulated reload', () => {
      const storage = memoryStorage()
      createTierStore(storage, shipped).setDefaultListId(CITED_LIST.id)
      const rebooted = createTierStore(storage, shipped)
      expect(rebooted.getDefaultList('configurations')?.id).toBe(CITED_LIST.id)
      expect(rebooted.getActiveList().id).toBe(CITED_LIST.id)
    })

    it('the default is per subject: a card-list default never shadows the configurations default', () => {
      const storage = memoryStorage()
      createTierStore(storage, shipped).setDefaultListId(MINOR_LIST.id)
      const rebooted = createTierStore(storage, shipped)
      expect(rebooted.getDefaultList('minor-powers')?.id).toBe(MINOR_LIST.id)
      expect(rebooted.getActiveList().id).toBe(OWNERS_BOARD.id)
    })

    it('a stored default that no longer resolves falls back to the owner\'s board instead of crashing the boot', () => {
      const storage = memoryStorage()
      storage.setItem('spirit-island:default-list-id:configurations', 'a-deleted-custom-list')
      const store = createTierStore(storage, shipped)
      expect(store.getActiveList().id).toBe(OWNERS_BOARD.id)
    })

    it('migrates the legacy durable active-list key into the configurations default (the old pick was, in effect, a boot pick)', () => {
      const storage = memoryStorage()
      storage.setItem('spirit-island:active-list-id', CITED_LIST.id)
      const store = createTierStore(storage, shipped)
      expect(store.getActiveList().id).toBe(CITED_LIST.id)
      expect(store.getDefaultList('configurations')?.id).toBe(CITED_LIST.id)
      expect(storage.getItem('spirit-island:active-list-id')).toBeNull()
    })

    it('backfills subject: configurations onto a personal list persisted before #12, so it can still be activated', () => {
      const storage = memoryStorage()
      const preSubjectList = { ...SIX_BAND_LIST }
      delete (preSubjectList as Partial<TierList>).subject
      storage.setItem('spirit-island:custom-tier-lists', JSON.stringify([preSubjectList]))
      const store = createTierStore(storage, [OWNERS_BOARD])
      store.setActiveListId(SIX_BAND_LIST.id)
      expect(store.getActiveList().id).toBe(SIX_BAND_LIST.id)
    })

    it('createList stamps the requested subject and the new list can be activated for it', () => {
      const store = createTierStore(memoryStorage(), shipped)
      const created = store.createList({ name: 'My Card List', type: 'fun', subject: 'major-powers' })
      expect(created.subject).toBe('major-powers')
      store.setActiveListId(created.id)
      expect(store.getActiveListFor('major-powers')?.id).toBe(created.id)
      expect(store.getActiveList().id).toBe(OWNERS_BOARD.id)
    })
  })

  describe('subject-scoped editing (#16): a card list edits like the owner\'s board, keyed by card name', () => {
    it('rating cards on a personal minor-powers list persists and survives a simulated reload', () => {
      const storage = memoryStorage()
      const store = createTierStore(storage)
      const created = store.createList({ name: 'My Minor List', type: 'strength', subject: 'minor-powers' })
      store.setActiveListId(created.id)
      store.setTier('Call of the Dahan Ways', 'S', 'minor-powers')
      expect(store.getTier('Call of the Dahan Ways', 'minor-powers')).toBe('S')

      const reloaded = createTierStore(storage)
      reloaded.setActiveListId(created.id)
      expect(reloaded.getTier('Call of the Dahan Ways', 'minor-powers')).toBe('S')
      expect(reloaded.getAll('minor-powers')).toEqual({ 'Call of the Dahan Ways': 'S' })
    })

    it('card-list edits never bleed into the configurations board', () => {
      const store = createTierStore(memoryStorage())
      const created = store.createList({ name: 'My Minor List', type: 'strength', subject: 'minor-powers' })
      store.setActiveListId(created.id)
      store.setTier('Call of the Dahan Ways', 'S', 'minor-powers')
      expect(store.getAll()['Call of the Dahan Ways']).toBeUndefined()
      expect(store.getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
    })

    it('clearTier and reset work per subject', () => {
      const store = createTierStore(memoryStorage())
      const created = store.createList({ name: 'My Minor List', type: 'strength', subject: 'minor-powers' })
      store.setActiveListId(created.id)
      store.setTier('Absorb Corruption', 'A', 'minor-powers')
      store.clearTier('Absorb Corruption', 'minor-powers')
      expect(store.getTier('Absorb Corruption', 'minor-powers')).toBeUndefined()
      store.setTier('Absorb Corruption', 'B', 'minor-powers')
      store.reset('minor-powers')
      expect(store.getAll('minor-powers')).toEqual({})
      expect(store.isCustomised('minor-powers')).toBe(false)
    })

    it('every editing read is safely empty for a subject with no lists', () => {
      const store = createTierStore(memoryStorage())
      expect(store.getAll('major-powers')).toEqual({})
      expect(store.getTier('Accelerated Rot', 'major-powers')).toBeUndefined()
      expect(store.isCustomised('major-powers')).toBe(false)
      expect(store.wasDiscarded('major-powers')).toBe(false)
      // Writes to nowhere are no-ops, not crashes.
      store.setTier('Accelerated Rot', 'S', 'major-powers')
      store.clearTier('Accelerated Rot', 'major-powers')
      store.reset('major-powers')
      expect(store.getAll('major-powers')).toEqual({})
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
      const created = store.createList({ name: 'My Fun List', type: 'fun', subject: 'configurations' })
      expect(created.tiers).toEqual({})
      store.setActiveListId(created.id)
      expect(store.getTier(LIGHTNING)).toBeUndefined()
    })

    it('rating a configuration on a created list does not change it on the owner\'s board', () => {
      const store = createTierStore(memoryStorage())
      const created = store.createList({ name: 'My Fun List', type: 'fun', subject: 'configurations' })
      store.setActiveListId(created.id)
      store.setTier(LIGHTNING, 'X')
      store.setActiveListId(OWNERS_BOARD.id)
      expect(store.getTier(LIGHTNING)).toBe(seedOf(LIGHTNING))
    })

    it('a created list persists across a simulated reload', () => {
      const storage = memoryStorage()
      const created = createTierStore(storage).createList({ name: 'My Fun List', type: 'fun', subject: 'configurations' })
      const reloaded = createTierStore(storage)
      expect(reloaded.getLists().some((l) => l.id === created.id)).toBe(true)
    })
  })
})

describe('groupByTier (issue #02)', () => {
  it('places unrated configurations in the unrated bucket, and a full-coverage list leaves it empty', () => {
    const configs = [config('a'), config('b')]
    const { labeled, unrated } = groupByTier(configs, (c) => c.configId, { a: 'S', b: 'A' }, ['S', 'A', 'B'])
    expect(labeled.S).toEqual([configs[0]])
    expect(labeled.A).toEqual([configs[1]])
    expect(unrated).toEqual([])
  })

  it('a configuration absent from tiers lands in the unrated bucket', () => {
    const configs = [config('a'), config('b')]
    const { labeled, unrated } = groupByTier(configs, (c) => c.configId, { a: 'S' }, ['S', 'A', 'B'])
    expect(labeled.S).toEqual([configs[0]])
    expect(unrated).toEqual([configs[1]])
  })

  it('a fixture list with six labels renders six bands, not seven', () => {
    const { labeled } = groupByTier([], (c: Configuration) => c.configId, {}, ['S', 'A', 'B', 'C', 'D', 'F'])
    expect(Object.keys(labeled)).toHaveLength(6)
  })

  it('never invents a fallback tier for an unknown label', () => {
    const configs = [config('a')]
    const { labeled, unrated } = groupByTier(configs, (c) => c.configId, { a: 'not-a-real-label' }, ['S', 'A'])
    expect(labeled.S).toEqual([])
    expect(labeled.A).toEqual([])
    expect(unrated).toEqual(configs)
  })
})
