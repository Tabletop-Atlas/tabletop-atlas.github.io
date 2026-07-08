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

/**
 * Overrides are stamped with a fingerprint of the seed they were edited against.
 * When the shipped tier list changes, previously-saved edits would silently shadow
 * it — so they are discarded rather than masking the new seed. Payloads without a
 * fingerprint are from the pre-versioning format and are treated as stale.
 */
function readOverrides(storage: KeyValueStorage): Record<string, Tier> {
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
    return {}
  }
  return stored.overrides
}

function writeOverrides(storage: KeyValueStorage, overrides: Record<string, Tier>): void {
  const payload: StoredOverrides = { seed: SEED_FINGERPRINT, overrides }
  storage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

/** Seam 4: tier list persistence. Seeds from tiers.json, overlays user edits in storage. */
export function createTierStore(storage: KeyValueStorage = defaultStorage()) {
  return {
    getTier(id: string): Tier | undefined {
      return readOverrides(storage)[id] ?? SEED[id]
    },
    setTier(id: string, tier: Tier): void {
      const overrides = readOverrides(storage)
      overrides[id] = tier
      writeOverrides(storage, overrides)
    },
    reset(): void {
      storage.removeItem(STORAGE_KEY)
    },
    getAll(): Record<string, Tier> {
      return { ...SEED, ...readOverrides(storage) }
    },
    /** True when the user has edited away from the shipped tier list. */
    isCustomised(): boolean {
      return Object.keys(readOverrides(storage)).length > 0
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
