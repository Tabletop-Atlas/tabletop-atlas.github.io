import tiersData from '../data/tiers.json'
import { defaultStorage, type KeyValueStorage } from './storage'
import type { Tier } from './types'

const SEED = tiersData.tiers as Record<string, Tier>
const STORAGE_KEY = 'spirit-island:tier-overrides'

function readOverrides(storage: KeyValueStorage): Record<string, Tier> {
  const raw = storage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : {}
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
      storage.setItem(STORAGE_KEY, JSON.stringify(overrides))
    },
    reset(): void {
      storage.removeItem(STORAGE_KEY)
    },
    getAll(): Record<string, Tier> {
      return { ...SEED, ...readOverrides(storage) }
    },
  }
}

export const tierStore = createTierStore()
