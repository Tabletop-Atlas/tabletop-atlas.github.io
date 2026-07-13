import ownersBoard from '../data/tier-lists/owners-board.json'
import siaFavoritesFunSolo from '../data/tier-lists/sia-favorites-fun-solo-2026.json'
import threeMbgStrengthSolo from '../data/tier-lists/3mbg-strength-solo-2025.json'
import type { Configuration } from './configurations'
import { defaultStorage, type KeyValueStorage } from './storage'
import type { TierList, TierListSubject, TierListType } from './types'

const SHIPPED_LISTS: TierList[] = [
  ownersBoard as TierList,
  siaFavoritesFunSolo as TierList,
  threeMbgStrengthSolo as TierList,
]

/** Override value meaning "the user un-rated this" (#15). Lives only in the override layer —
 * `getTier`/`getAll` strip it, so it never renders, never reaches the rank prior, and never
 * appears in a list's own `tiers` (where absence, not a sentinel, means unrated per ADR 0001).
 * An empty string survives the existing Record<string, string> backup schema untouched. */
const UNRATED_OVERRIDE = ''

const OLD_V2_KEY = 'spirit-island:tier-overrides'
const LEGACY_ACTIVE_LIST_KEY = 'spirit-island:active-list-id'
const CUSTOM_LISTS_KEY = 'spirit-island:custom-tier-lists'
const overridesKey = (listId: string) => `spirit-island:tier-overrides:${listId}`
const defaultListKey = (subject: TierListSubject) => `spirit-island:default-list-id:${subject}`

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
  subject: TierListSubject
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
      if (!Array.isArray(parsed)) return []
      // #12 backfill: lists created before the subject axis existed could only ever rank
      // configurations — stamping that is recorded fact, not a guess. Without it a pre-#12
      // personal list has subject undefined and could never be activated again.
      return (parsed as TierList[]).map((l) => (l.subject ? l : { ...l, subject: 'configurations' }))
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

  /** #12: the durable pick used to be the *active* list id. Under the subject axis the active
   * pick is session state and the durable pick is the default list — so the legacy key becomes
   * the configurations default, preserving exactly which list the user's app boots into. */
  function migrateLegacyActiveKey(): void {
    const id = storage.getItem(LEGACY_ACTIVE_LIST_KEY)
    if (id === null) return
    storage.removeItem(LEGACY_ACTIVE_LIST_KEY)
    if (storage.getItem(defaultListKey('configurations')) === null) {
      storage.setItem(defaultListKey('configurations'), id)
    }
  }

  migrateLegacyActiveKey()

  // One active list per subject, session-scoped (#06's ruling): a reload boots the default.
  const sessionActiveIds = new Map<TierListSubject, string>()

  function listOfSubject(id: string | null, subject: TierListSubject): TierList | undefined {
    const list = id ? findList(id) : undefined
    return list?.subject === subject ? list : undefined
  }

  /** The durable boot pick. Unset or unresolvable falls back to the owner's board for
   * configurations (today's behaviour — #18 verifies and flips the seed to the credited cited
   * list; the owner's named URL matches no shipped citation yet, so seeding it here would be
   * guessing) and to the first shipped list for any other subject. */
  function defaultListFor(subject: TierListSubject): TierList | undefined {
    const stored = listOfSubject(storage.getItem(defaultListKey(subject)), subject)
    if (stored) return stored
    if (subject === 'configurations') return ownersBoardList
    return allLists().find((l) => l.subject === subject)
  }

  function activeListFor(subject: TierListSubject): TierList | undefined {
    return listOfSubject(sessionActiveIds.get(subject) ?? null, subject) ?? defaultListFor(subject)
  }

  /** The active configurations list — the one Browse, the board, and the recommender read.
   * Shipped lists always include one, so this never comes back empty. */
  function activeList(): TierList {
    return activeListFor('configurations') ?? ownersBoardList
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
    /** Activates a list for *its own* subject — callers never pass a subject, the list knows. */
    setActiveListId(id: string): void {
      const list = findList(id)
      if (list) sessionActiveIds.set(list.subject, id)
    },
    /** One active list per subject; undefined when no list of that subject exists. */
    getActiveListFor(subject: TierListSubject): TierList | undefined {
      return activeListFor(subject)
    },
    /** The durable boot pick for a subject (#18's Settings control reads this). */
    getDefaultList(subject: TierListSubject = 'configurations'): TierList | undefined {
      return defaultListFor(subject)
    },
    /** Durably picks which list boots as active for its subject. */
    setDefaultListId(id: string): void {
      const list = findList(id)
      if (list) storage.setItem(defaultListKey(list.subject), id)
    },
    /** Editing reads and writes take an optional subject (#16) and operate on that subject's
     * active list — 'configurations' by default, so every pre-#16 caller is unchanged. A subject
     * with no lists reads empty and swallows writes. */
    getTier(key: string, subject: TierListSubject = 'configurations'): string | undefined {
      const list = activeListFor(subject)
      if (!list) return undefined
      const label = readOverridesFor(list)[key] ?? list.tiers[key]
      return label === UNRATED_OVERRIDE ? undefined : label
    },
    /** No-ops on a `cited` list — editing 3MBG's list would make it no longer 3MBG's list. */
    setTier(key: string, label: string, subject: TierListSubject = 'configurations'): void {
      const list = activeListFor(subject)
      if (!list || list.origin === 'cited') return
      const overrides = readOverridesFor(list)
      overrides[key] = label
      writeOverridesFor(list, overrides)
    },
    /** Moves an entry to the unrated bucket (#15). Where the seed never rated it, deleting the
     * override restores plain absence; where it did, the sentinel shadows it. */
    clearTier(key: string, subject: TierListSubject = 'configurations'): void {
      const list = activeListFor(subject)
      if (!list || list.origin === 'cited') return
      const overrides = readOverridesFor(list)
      if (list.tiers[key] === undefined) delete overrides[key]
      else overrides[key] = UNRATED_OVERRIDE
      writeOverridesFor(list, overrides)
    },
    /** Resets only the subject's active list; other lists' overrides are untouched. */
    reset(subject: TierListSubject = 'configurations'): void {
      const list = activeListFor(subject)
      if (list) storage.removeItem(overridesKey(list.id))
    },
    /** Resets an arbitrary list by id, without switching which list is active. Used by backup
     * import, which replaces every personal list's overrides in one pass. */
    resetList(listId: string): void {
      storage.removeItem(overridesKey(listId))
    },
    getAll(subject: TierListSubject = 'configurations'): Record<string, string> {
      const list = activeListFor(subject)
      if (!list) return {}
      const merged = { ...list.tiers, ...readOverridesFor(list) }
      for (const [id, label] of Object.entries(merged)) {
        if (label === UNRATED_OVERRIDE) delete merged[id]
      }
      return merged
    },
    /** Only the active list's user edits — what a backup export carries for it. */
    getOverrides(): Record<string, string> {
      return userEditsFor(activeList())
    },
    getOverridesForList(listId: string): Record<string, string> {
      const list = findList(listId)
      return list ? userEditsFor(list) : {}
    },
    isCustomised(subject: TierListSubject = 'configurations'): boolean {
      const list = activeListFor(subject)
      return !!list && Object.keys(userEditsFor(list)).length > 0
    },
    wasDiscarded(subject: TierListSubject = 'configurations'): boolean {
      const list = activeListFor(subject)
      if (!list) return false
      readOverridesFor(list)
      return discardedListIds.has(list.id)
    },
    dismissDiscardNotice(subject: TierListSubject = 'configurations'): void {
      const list = activeListFor(subject)
      if (list) discardedListIds.delete(list.id)
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
        subject: input.subject,
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

export interface TierGroups<T = Configuration> {
  /** Keyed by label; iterate a list's own `tierLabels` to read these in strongest-first order. */
  labeled: Record<string, T[]>
  /** Entries the list has no key for at all — not rated badly, not rated. */
  unrated: T[]
}

/** Buckets a subject's entries (configurations, power cards — anything with an id in the
 * list's key namespace, #16) into a list's own tier vocabulary, plus an explicit unrated
 * bucket. Shared so every board renders from one rule. There is no fallback tier: an entry
 * absent from `tiers` is unrated, full stop — that absence is the whole point of the entity
 * model (see `.scratch/v3/README.md`'s "hazard this release exists to contain"). */
export function groupByTier<T>(
  items: T[],
  idOf: (item: T) => string,
  tiers: Record<string, string>,
  tierLabels: string[],
): TierGroups<T> {
  const labeled = Object.fromEntries(tierLabels.map((label) => [label, [] as T[]])) as Record<string, T[]>
  const unrated: T[] = []
  for (const item of items) {
    const label = tiers[idOf(item)]
    if (label !== undefined && label in labeled) labeled[label].push(item)
    else unrated.push(item)
  }
  return { labeled, unrated }
}
