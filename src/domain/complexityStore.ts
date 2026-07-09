import spiritsData from '../data/spirits.json'
import { defaultStorage, type KeyValueStorage } from './storage'
import type { Complexity, Spirit } from './types'

const SPIRITS = spiritsData as Spirit[]
const SEED: Record<string, Complexity> = Object.fromEntries(SPIRITS.map((s) => [s.id, s.complexity]))
const STORAGE_KEY = 'spirit-island:complexity-overrides'

/** FNV-1a, same as tierStore - cheap change-detection, not cryptography. */
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
  overrides: Record<string, Complexity>
}

function writeOverrides(storage: KeyValueStorage, overrides: Record<string, Complexity>): void {
  const payload: StoredOverrides = { seed: SEED_FINGERPRINT, overrides }
  storage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

/**
 * Seam 5: personal complexity override, on the tierStore pattern. Printed `complexity` in
 * spirits.json stays untouched - fact and judgment stay separable, as with `ratings` /
 * `ratingsSource`. Aspects are not individually overridable (their printed arrow stands), so
 * this is keyed by spirit id, not configId.
 */
export function createComplexityStore(storage: KeyValueStorage = defaultStorage()) {
  // Sticky for the life of this store instance - see tierStore's identical guard for why.
  let discardedOnLoad = false

  /** Same staleness guard as tierStore: an override edited against a since-changed printed
   * complexity would silently misjudge the newcomer ceiling, so it's discarded, not carried over. */
  function readOverrides(): Record<string, Complexity> {
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

  /** Stored overrides minus the ones that merely restate the printed value. */
  function userEdits(): Record<string, Complexity> {
    return Object.fromEntries(Object.entries(readOverrides()).filter(([id, complexity]) => complexity !== SEED[id]))
  }

  return {
    getComplexity(spiritId: string): Complexity | undefined {
      return readOverrides()[spiritId] ?? SEED[spiritId]
    },
    setComplexity(spiritId: string, complexity: Complexity): void {
      const overrides = readOverrides()
      overrides[spiritId] = complexity
      writeOverrides(storage, overrides)
    },
    reset(spiritId: string): void {
      const overrides = readOverrides()
      delete overrides[spiritId]
      writeOverrides(storage, overrides)
    },
    resetAll(): void {
      storage.removeItem(STORAGE_KEY)
    },
    getAll(): Record<string, Complexity> {
      return { ...SEED, ...readOverrides() }
    },
    /** Only the user's edits (keys whose value differs from the seed) - what a backup export
     * should carry, as distinct from `getAll()`'s merged view the recommender depends on.
     * Assigning a spirit the complexity it already has stores a no-op override; this filters
     * it back out, so that no-op never round-trips through a backup as a real edit. */
    getOverrides(): Record<string, Complexity> {
      return userEdits()
    },
    /** Reads the same filtered map the export does, so "has edits" and "exports edits" can
     * never disagree. */
    isCustomised(): boolean {
      return Object.keys(userEdits()).length > 0
    },
    /** True once a fingerprint mismatch has discarded stored overrides this session. */
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

export const complexityStore = createComplexityStore()
