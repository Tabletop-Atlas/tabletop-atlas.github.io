import type { Configuration } from './configurations'
import { defaultStorage, type KeyValueStorage } from './storage'
import { EXPANSIONS, type ExpansionName } from './types'

const STORAGE_KEY = 'spirit-island:collection'

interface StoredCollection {
  /** Expansions the player has explicitly turned OFF - a delta from "owns everything", the
   * same discipline as `complexityStore.getOverrides()`. Absence (no key stored at all) means
   * owns everything, not an explicit "all true" snapshot - a fresh visitor to a public knowledge
   * base has filled in nothing and must see the full app, and a future expansion needs no
   * migration to be included by default. */
  excluded: ExpansionName[]
}

/**
 * v5 #06/#07a: the app-wide "what I own" setting. Mirrors `complexityStore`'s shape (injected
 * storage, create-function-plus-default-instance) rather than inventing a new pattern.
 */
export function createCollectionStore(storage: KeyValueStorage = defaultStorage()) {
  function readExcluded(): Set<ExpansionName> {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return new Set()
    }
    const stored = parsed as Partial<StoredCollection>
    const known = new Set<string>(EXPANSIONS)
    return new Set((stored.excluded ?? []).filter((e): e is ExpansionName => known.has(e)))
  }

  function writeExcluded(excluded: Set<ExpansionName>): void {
    if (excluded.size === 0) {
      storage.removeItem(STORAGE_KEY)
      return
    }
    const payload: StoredCollection = { excluded: [...excluded] }
    storage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  return {
    owns(expansion: ExpansionName): boolean {
      return !readExcluded().has(expansion)
    },
    setOwned(expansion: ExpansionName, owned: boolean): void {
      const excluded = readExcluded()
      if (owned) excluded.delete(expansion)
      else excluded.add(expansion)
      writeExcluded(excluded)
    },
    /** The expansions turned off - what a backup export carries, mirroring
     * `complexityStore.getOverrides()`. */
    getExcluded(): ExpansionName[] {
      return [...readExcluded()].sort()
    },
    isCustomised(): boolean {
      return readExcluded().size > 0
    },
    resetAll(): void {
      storage.removeItem(STORAGE_KEY)
    },
  }
}

export const collectionStore = createCollectionStore()

/**
 * Pure: a configuration is owned when both the base spirit's expansion and (if there is one)
 * the aspect's own expansion are unexcluded - v5 #06's call that aspects are gated
 * independently, since an aspect can ship in a different box than its spirit.
 */
export function isConfigurationOwned(config: Configuration, excluded: ReadonlySet<ExpansionName>): boolean {
  if (excluded.has(config.spirit.expansion)) return false
  if (config.aspect && excluded.has(config.aspect.expansion)) return false
  return true
}

/** The opt-in hard-filter case (#06): only the configurations the collection actually owns,
 * excluded exactly as if annotation had removed them first. */
export function filterOwnedConfigurations(configs: Configuration[], excluded: ReadonlySet<ExpansionName>): Configuration[] {
  return configs.filter((c) => isConfigurationOwned(c, excluded))
}

/** v5 #07b: the exact candidate-pool decision the Recommender makes before calling `recommend()`
 * - hard-filter off (default) leaves the pool untouched (an unowned configuration can still
 * surface, annotated); on, it's pre-filtered so an unowned configuration never enters scoring.
 * Exported so `recommendCollection.test.ts` pins this function itself, not a reimplementation of
 * it - a test that imports this and a test that imports `Recommender.tsx`'s wiring are the same
 * test once the component calls this instead of inlining the ternary. */
export function candidatesForRecommender(
  configs: Configuration[],
  hardFilter: boolean,
  excluded: ReadonlySet<ExpansionName>,
): Configuration[] {
  return hardFilter ? filterOwnedConfigurations(configs, excluded) : configs
}
