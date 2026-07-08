import type { LogEntry } from './backup'
import { defaultStorage, type KeyValueStorage } from './storage'

const STORAGE_KEY = 'spirit-island:game-log'

function readEntries(storage: KeyValueStorage): LogEntry[] {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeEntries(storage: KeyValueStorage, entries: LogEntry[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

/**
 * Seam 6: a journal, not a feedback loop. Records what was played; feeds exactly one fact
 * back into scoring (`timesPlayed`, consumed by #07's novelty knob). Outcomes are recorded
 * and displayed, never scored - see the PRD's "Out of Scope": auto-tuning the tier prior from
 * a two-game sample would silently corrupt the one dataset the owner authored personally.
 */
export function createGameLog(storage: KeyValueStorage = defaultStorage()) {
  return {
    /** Stamps a stable id at creation - cross-device de-duplication on import depends on it. */
    append(entry: Omit<LogEntry, 'id'>): LogEntry {
      const full: LogEntry = { ...entry, id: crypto.randomUUID() }
      writeEntries(storage, [...readEntries(storage), full])
      return full
    },
    list(): LogEntry[] {
      return readEntries(storage)
    },
    /** Counts entries where some player played this configuration. A fact, not a score. */
    timesPlayed(configId: string): number {
      return readEntries(storage).filter((entry) => entry.players.some((p) => p.configId === configId)).length
    },
    /** Overwrites the whole log - used by backup import, which has already computed the
     * append-and-dedupe merge in backup.parse(). */
    replaceAll(entries: LogEntry[]): void {
      writeEntries(storage, entries)
    },
  }
}

export const gameLog = createGameLog()
