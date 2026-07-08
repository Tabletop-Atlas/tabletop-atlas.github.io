import type { Complexity, Tier } from './types'

export const CURRENT_SCHEMA_VERSION = 1

/** Entry shape from the PRD's game log (Seam 6, issue #06). Declared here now so schema v1
 * ships every section it will ever need — later slices populate rather than force a version bump. */
export interface LogEntry {
  id: string
  date: string
  players: { name: string; configId: string }[]
  adversary: string
  adversaryLevel: number
  scenario?: string
  outcome: 'win' | 'loss'
  terrorLevel?: number
  blightRemaining?: number
}

export interface BackupState {
  tiers: Record<string, Tier>
  complexityOverrides: Record<string, Complexity>
  answers: Record<string, string>
  log: LogEntry[]
}

interface Backup extends BackupState {
  schemaVersion: number
  exportedAt: string
}

/** The ids the current dataset recognises, used to flag stale keys on import instead of
 * silently dropping or applying them. */
export interface KnownIds {
  tierIds: Set<string>
  complexityIds: Set<string>
  questionIds: Set<string>
}

export interface ParseResult {
  state: BackupState
  unresolved: string[]
}

/** Pure: no storage, no DOM. Callers own writing the result wherever it downloads. */
export function serialise(state: BackupState): string {
  const backup: Backup = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    ...state,
  }
  return JSON.stringify(backup, null, 2)
}

function filterKnown<T>(
  record: Record<string, T> | undefined,
  known: Set<string>,
  unresolved: string[],
): Record<string, T> {
  const result: Record<string, T> = {}
  for (const [id, value] of Object.entries(record ?? {})) {
    if (known.has(id)) {
      result[id] = value
    } else {
      unresolved.push(id)
    }
  }
  return result
}

function mergeLog(existing: LogEntry[], incoming: LogEntry[]): LogEntry[] {
  const byId = new Map(existing.map((entry) => [entry.id, entry]))
  for (const entry of incoming) {
    if (!byId.has(entry.id)) byId.set(entry.id, entry)
  }
  return [...byId.values()]
}

/**
 * Parses and validates a backup file. `tiers` / `complexityOverrides` / `answers` are meant
 * to **replace** existing state (the caller applies that by using `state` as-is); `log` is
 * **appended and de-duplicated by id** against `existingLog`, since a game log is an
 * accumulating record that replacing would destroy.
 *
 * Unknown ids (keys the current dataset no longer recognises) are reported in `unresolved`
 * rather than thrown or silently dropped — surfacing data loss beats hiding it.
 */
export function parse(json: string, known: KnownIds, existingLog: LogEntry[] = []): ParseResult {
  const parsed = JSON.parse(json) as Partial<Backup>

  if (typeof parsed.schemaVersion !== 'number' || parsed.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `This backup was made with a newer app version (schemaVersion ${parsed.schemaVersion ?? 'unknown'}); ` +
        `this app only understands up to ${CURRENT_SCHEMA_VERSION}. Update the app before importing.`,
    )
  }

  const unresolved: string[] = []
  const tiers = filterKnown(parsed.tiers, known.tierIds, unresolved)
  const complexityOverrides = filterKnown(parsed.complexityOverrides, known.complexityIds, unresolved)
  const answers = filterKnown(parsed.answers, known.questionIds, unresolved)
  const log = mergeLog(existingLog, parsed.log ?? [])

  return { state: { tiers, complexityOverrides, answers, log }, unresolved }
}
