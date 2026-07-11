import ownersBoard from '../data/tier-lists/owners-board.json'
import siaFavoritesFunSolo from '../data/tier-lists/sia-favorites-fun-solo-2026.json'
import threeMbgStrengthSolo from '../data/tier-lists/3mbg-strength-solo-2025.json'
import type { Configuration } from './configurations'
import { defaultStorage, type KeyValueStorage } from './storage'
import type { TierList, TierListType } from './types'

const SHIPPED_LISTS: TierList[] = [
  ownersBoard as TierList,
  siaFavoritesFunSolo as TierList,
  threeMbgStrengthSolo as TierList,
]

const OLD_V2_KEY = 'spirit-island:tier-overrides'
const ACTIVE_LIST_KEY = 'spirit-island:active-list-id'
const CUSTOM_LISTS_KEY = 'spirit-island:custom-tier-lists'
const overridesKey = (listId: string) => `spirit-island:tier-overrides:${listId}`

/** FNV-1a. Cheap, stable, and we only need change-detection, not cryptography. */
function fingerprint(input: string): string {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

/** A list's fingerprint is derived from its own `tiers` content, so unrelated edits to its
 * prose (methodology, name) never spuriously discard a user's overrides. */
function fingerprintOf(list: TierList): string {
  return fingerprint(JSON.stringify(list.tiers))
}

interface StoredOverrides {
  seed: string
  overrides: Record<string, string>
}

export interface CreateListInput {
  name: string
  type: TierListType
}

/** Rank is the label's position in the list's own vocabulary, normalised so 0 is the
 * strongest band and 1 the weakest. A single-band list ranks everything 0 rather than
 * dividing by zero. */
function rankOf(label: string, tierLabels: string[]): number | undefined {
  const index = tierLabels.indexOf(label)
  if (index === -1) return undefined
  return tierLabels.length <= 1 ? 0 : index / (tierLabels.length - 1)
}

/** Seam 4: tier list persistence. A tier list is a cited document (`TierList`), not a flat
 * map — see `.scratch/v3/tier-list-schema.md`. Multiple lists can be shipped; the store holds
 * one *active* list and keys overrides by list id. `origin: 'cited'` lists never take edits. */
export function createTierStore(storage: KeyValueStorage = defaultStorage(), shippedLists: TierList[] = SHIPPED_LISTS) {
  const ownersBoardList = shippedLists.find((l) => l.origin === 'personal') ?? shippedLists[0]

  // Sticky for the life of this store instance (one page load) — see tierStore v2's original
  // rationale, now tracked per list id since a discard on one list must not read as a discard
  // on another.
  const discardedListIds = new Set<string>()

  function customLists(): TierList[] {
    const raw = storage.getItem(CUSTOM_LISTS_KEY)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as TierList[]) : []
    } catch {
      return []
    }
  }

  function writeCustomLists(lists: TierList[]): void {
    storage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(lists))
  }

  function allLists(): TierList[] {
    return [...shippedLists, ...customLists()]
  }

  function findList(id: string): TierList | undefined {
    return allLists().find((l) => l.id === id)
  }

  function writeOverridesFor(list: TierList, overrides: Record<string, string>): void {
    const payload: StoredOverrides = { seed: fingerprintOf(list), overrides }
    storage.setItem(overridesKey(list.id), JSON.stringify(payload))
  }

  /**
   * Overrides are stamped with a fingerprint of the seed they were edited against. When a
   * list's shipped tiers change, previously-saved edits would silently shadow it — so they are
   * discarded rather than masking the new seed.
   */
  function readOverridesFor(list: TierList): Record<string, string> {
    const raw = storage.getItem(overridesKey(list.id))
    if (!raw) return {}
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return {}
    }
    const stored = parsed as Partial<StoredOverrides>
    if (stored?.seed !== fingerprintOf(list) || !stored.overrides) {
      storage.removeItem(overridesKey(list.id))
      discardedListIds.add(list.id)
      return {}
    }
    return stored.overrides
  }

  function userEditsFor(list: TierList): Record<string, string> {
    return Object.fromEntries(
      Object.entries(readOverridesFor(list)).filter(([id, label]) => label !== list.tiers[id]),
    )
  }

  /**
   * Restructuring `tiers.json` into a `TierList` entity moves its seed fingerprint by
   * definition — the v2 README's permanent constraint. Rather than let the ordinary
   * fingerprint guard eat the owner's real board edits, this reads the v2 payload shape
   * explicitly and re-stamps it against the owner's personal list. A payload that cannot be
   * read as that shape is discarded, and still reported via `wasDiscarded()`.
   */
  function migrateV2Overrides(): void {
    const raw = storage.getItem(OLD_V2_KEY)
    if (raw === null) return
    storage.removeItem(OLD_V2_KEY)
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      discardedListIds.add(ownersBoardList.id)
      return
    }
    const stored = parsed as { overrides?: unknown }
    if (!stored || typeof stored.overrides !== 'object' || stored.overrides === null) {
      discardedListIds.add(ownersBoardList.id)
      return
    }
    const overrides: Record<string, string> = {}
    for (const [id, label] of Object.entries(stored.overrides as Record<string, unknown>)) {
      if (typeof label === 'string' && id in ownersBoardList.tiers) overrides[id] = label
    }
    writeOverridesFor(ownersBoardList, overrides)
  }

  migrateV2Overrides()

  function activeList(): TierList {
    const id = storage.getItem(ACTIVE_LIST_KEY)
    return (id && findList(id)) || ownersBoardList
  }

  return {
    getLists(): TierList[] {
      return allLists()
    },
    getActiveListId(): string {
      return activeList().id
    },
    getActiveList(): TierList {
      return activeList()
    },
    setActiveListId(id: string): void {
      if (findList(id)) storage.setItem(ACTIVE_LIST_KEY, id)
    },
    getTier(configId: string): string | undefined {
      const list = activeList()
      return readOverridesFor(list)[configId] ?? list.tiers[configId]
    },
    /** No-ops on a `cited` list — editing 3MBG's list would make it no longer 3MBG's list. */
    setTier(configId: string, label: string): void {
      const list = activeList()
      if (list.origin === 'cited') return
      const overrides = readOverridesFor(list)
      overrides[configId] = label
      writeOverridesFor(list, overrides)
    },
    /** Resets only the active list; other lists' overrides are untouched. */
    reset(): void {
      storage.removeItem(overridesKey(activeList().id))
    },
    /** Resets an arbitrary list by id, without switching which list is active. Used by backup
     * import, which replaces every personal list's overrides in one pass. */
    resetList(listId: string): void {
      storage.removeItem(overridesKey(listId))
    },
    getAll(): Record<string, string> {
      const list = activeList()
      return { ...list.tiers, ...readOverridesFor(list) }
    },
    /** Only the active list's user edits — what a backup export carries for it. */
    getOverrides(): Record<string, string> {
      return userEditsFor(activeList())
    },
    getOverridesForList(listId: string): Record<string, string> {
      const list = findList(listId)
      return list ? userEditsFor(list) : {}
    },
    isCustomised(): boolean {
      return Object.keys(userEditsFor(activeList())).length > 0
    },
    wasDiscarded(): boolean {
      const list = activeList()
      readOverridesFor(list)
      return discardedListIds.has(list.id)
    },
    dismissDiscardNotice(): void {
      discardedListIds.delete(activeList().id)
    },
    /** Normalised rank (0 strongest .. 1 weakest) for every configuration the active list has
     * rated, computed against that list's own `tierLabels`. Unrated configurations have no
     * entry — `recommend` treats an absent entry as neutral, not zero. */
    getRankPrior(): Record<string, number> {
      const list = activeList()
      const all = this.getAll()
      const result: Record<string, number> = {}
      for (const [id, label] of Object.entries(all)) {
        const rank = rankOf(label, list.tierLabels)
        if (rank !== undefined) result[id] = rank
      }
      return result
    },
    /** A new personal list starts fully unrated — not pre-filled from any other list. */
    createList(input: CreateListInput): TierList {
      const list: TierList = {
        id: `personal-${input.type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        name: input.name,
        type: input.type,
        origin: 'personal',
        tierLabels: [...ownersBoardList.tierLabels],
        methodology: 'Owner-created list; starts fully unrated.',
        verified: true,
        tiers: {},
      }
      writeCustomLists([...customLists(), list])
      return list
    },
    /** Applies per-list overrides from a backup import. Refuses `cited` lists (their citation
     * cannot be corrupted by an import) and reports an unknown list id rather than dropping or
     * throwing on it. */
    importOverrides(perList: Record<string, Record<string, string>>): { unresolved: string[] } {
      const unresolved: string[] = []
      for (const [listId, overrides] of Object.entries(perList)) {
        const list = findList(listId)
        if (!list) {
          unresolved.push(listId)
          continue
        }
        if (list.origin === 'cited') continue
        writeOverridesFor(list, overrides)
      }
      return unresolved.length > 0 ? { unresolved } : { unresolved: [] }
    },
    /** Every personal list, so a caller (the "you have unsaved edits" import warning, an export)
     * doesn't have to re-walk `getLists()` and re-filter by origin itself. */
    getPersonalLists(): TierList[] {
      return allLists().filter((l) => l.origin === 'personal')
    },
    hasAnyPersonalEdits(): boolean {
      return allLists().some((l) => l.origin === 'personal' && Object.keys(userEditsFor(l)).length > 0)
    },
  }
}

export const tierStore = createTierStore()

export interface TierGroups {
  /** Keyed by label; iterate a list's own `tierLabels` to read these in strongest-first order. */
  labeled: Record<string, Configuration[]>
  /** Configurations the active list has no entry for at all — not rated badly, not rated. */
  unrated: Configuration[]
}

/** Buckets configurations into a list's own tier vocabulary, plus an explicit unrated bucket.
 * Shared so the board and the editor can never disagree. There is no fallback tier: a
 * configuration absent from `tiers` is unrated, full stop — that absence is the whole point of
 * the entity model (see `.scratch/v3/README.md`'s "hazard this release exists to contain"). */
export function groupByTier(configs: Configuration[], tiers: Record<string, string>, tierLabels: string[]): TierGroups {
  const labeled = Object.fromEntries(tierLabels.map((label) => [label, [] as Configuration[]])) as Record<
    string,
    Configuration[]
  >
  const unrated: Configuration[] = []
  for (const config of configs) {
    const label = tiers[config.configId]
    if (label !== undefined && label in labeled) labeled[label].push(config)
    else unrated.push(config)
  }
  return { labeled, unrated }
}
