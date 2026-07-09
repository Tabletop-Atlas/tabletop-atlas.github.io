import tiersData from '../data/tiers.json'
import type { Configuration } from './configurations'
import { defaultStorage, type KeyValueStorage } from './storage'
import { TIERS } from './types'
import type { Tier } from './types'

const SEED = tiersData.tiers as Record<string, Tier>
const STORAGE_KEY = 'spirit-island:tier-overrides'

/** FNV-1a. Cheap, stable, and we only need change-detection, not cryptography. */
function fingerprint(input: string): string {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

const SEED_FINGERPRINT = fingerprint(JSON.stringify(SEED))

interface StoredOverrides {
  seed: string
  overrides: Record<string, Tier>
}

function writeOverrides(storage: KeyValueStorage, overrides: Record<string, Tier>): void {
  const payload: StoredOverrides = { seed: SEED_FINGERPRINT, overrides }
  storage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

/** Seam 4: tier list persistence. Seeds from tiers.json, overlays user edits in storage. */
export function createTierStore(storage: KeyValueStorage = defaultStorage()) {
  // Sticky for the life of this store instance (one page load): once the stale entry is
  // removed from storage, a later read can no longer tell "discarded" from "never had any",
  // so the fact has to be captured at the moment of discovery, not re-derived on every read.
  let discardedOnLoad = false

  /**
   * Overrides are stamped with a fingerprint of the seed they were edited against.
   * When the shipped tier list changes, previously-saved edits would silently shadow
   * it — so they are discarded rather than masking the new seed. Payloads without a
   * fingerprint are from the pre-versioning format and are treated as stale.
   */
  function readOverrides(): Record<string, Tier> {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return {}
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return {}
    }
    const stored = parsed as Partial<StoredOverrides>
    if (stored?.seed !== SEED_FINGERPRINT || !stored.overrides) {
      storage.removeItem(STORAGE_KEY)
      discardedOnLoad = true
      return {}
    }
    return stored.overrides
  }

  /** Stored overrides minus the ones that merely restate the seed. */
  function userEdits(): Record<string, Tier> {
    return Object.fromEntries(Object.entries(readOverrides()).filter(([id, tier]) => tier !== SEED[id]))
  }

  return {
    getTier(id: string): Tier | undefined {
      return readOverrides()[id] ?? SEED[id]
    },
    setTier(id: string, tier: Tier): void {
      const overrides = readOverrides()
      overrides[id] = tier
      writeOverrides(storage, overrides)
    },
    reset(): void {
      storage.removeItem(STORAGE_KEY)
    },
    getAll(): Record<string, Tier> {
      return { ...SEED, ...readOverrides() }
    },
    /** Only the user's edits (keys whose value differs from the seed) - what a backup export
     * should carry, as distinct from `getAll()`'s merged view the recommender depends on.
     * Assigning a spirit the tier it already has stores a no-op override; this filters it back
     * out, so that no-op never round-trips through a backup as a real edit. */
    getOverrides(): Record<string, Tier> {
      return userEdits()
    },
    /** True when the user has edited away from the shipped tier list. Reads the same filtered
     * map the export does, so "has edits" and "exports edits" can never disagree. */
    isCustomised(): boolean {
      return Object.keys(userEdits()).length > 0
    },
    /** True once a fingerprint mismatch has discarded stored overrides this session. A fresh
     * install (nothing ever stored) never sets this - see `readOverrides`'s `if (!raw)` guard. */
    wasDiscarded(): boolean {
      readOverrides()
      return discardedOnLoad
    },
    /** Silences the discard notice for the rest of this session. */
    dismissDiscardNotice(): void {
      discardedOnLoad = false
    },
  }
}

export const tierStore = createTierStore()

/** Tier shown for a configuration with no entry at all. Data integrity tests keep this unreachable. */
const FALLBACK_TIER: Tier = 'B'

/** Buckets configurations into tier order. Shared so the board and the editor can never disagree. */
export function groupByTier(
  configs: Configuration[],
  tiers: Record<string, Tier>,
): Record<Tier, Configuration[]> {
  const groups = Object.fromEntries(TIERS.map((tier) => [tier, [] as Configuration[]])) as Record<
    Tier,
    Configuration[]
  >
  for (const config of configs) {
    groups[tiers[config.configId] ?? FALLBACK_TIER].push(config)
  }
  return groups
}
