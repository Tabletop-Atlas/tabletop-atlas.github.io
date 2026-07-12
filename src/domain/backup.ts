import type { Complexity, ExpansionName } from './types'

export const CURRENT_SCHEMA_VERSION = 3

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

/** listId -> configId -> label. A flat map can no longer say which list an edit belongs to,
 * now that there is more than one list (see #07). */
export interface BackupState {
  tiers: Record<string, Record<string, string>>
  complexityOverrides: Record<string, Complexity>
  answers: Record<string, string>
  log: LogEntry[]
  /** v5 #06/#07a: expansions the player has turned off (a delta from "owns everything"), same
   * discipline as `complexityOverrides` storing only deltas from the printed complexity. Absent
   * on any backup older than schema v3 - migrated to an empty array (owns everything), never
   * guessed. */
  collection: ExpansionName[]
}

interface Backup extends BackupState {
  schemaVersion: number
  exportedAt: string
}

/** The ids the current dataset recognises, used to flag stale keys on import instead of
 * silently dropping or applying them. */
export interface KnownIds {
  tierIds: Set<string>
  /** Ids of the currently shipped/created tier lists - a listId a v2 backup names that no
   * longer exists lands in `unresolved` rather than being dropped or applied. */
  listIds: Set<string>
  complexityIds: Set<string>
  questionIds: Set<string>
  expansions: Set<ExpansionName>
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

/** Same discipline as `filterKnown`, for a plain list rather than a keyed record - used for the
 * collection's `excluded` array. */
function filterKnownList<T extends string>(list: unknown, known: Set<T>, unresolved: string[]): T[] {
  const result: T[] = []
  for (const item of Array.isArray(list) ? list : []) {
    if (typeof item === 'string' && known.has(item as T)) {
      result.push(item as T)
    } else {
      unresolved.push(String(item))
    }
  }
  return result
}

/** `gameLog.timesPlayed()` does `entry.players.some(...)` unconditionally - an entry that
 * reaches storage without a real players array crashes every later render, not just import.
 * `Array.isArray` alone is enough to reject a string: strings are iterable but not arrays. */
function hasValidPlayers(players: unknown): players is { name: string; configId: string }[] {
  return (
    Array.isArray(players) &&
    players.every((p) => typeof p?.name === 'string' && typeof p?.configId === 'string')
  )
}

/** Cross-device dedupe depends on a stable id; an entry without one can't be merged safely,
 * so it's reported rather than collapsed into whatever id-less entry arrived first. */
function mergeLog(
  existing: LogEntry[],
  incoming: unknown[],
  knownConfigIds: Set<string>,
  unresolved: string[],
): LogEntry[] {
  const byId = new Map(existing.map((entry) => [entry.id, entry]))
  for (const raw of incoming) {
    const entry = raw as Partial<LogEntry>
    if (typeof entry.id !== 'string') {
      unresolved.push('log entry with missing or invalid id')
      continue
    }
    if (!hasValidPlayers(entry.players)) {
      unresolved.push('log entry with missing or invalid players')
      continue
    }
    for (const player of entry.players) {
      if (!knownConfigIds.has(player.configId)) unresolved.push(player.configId)
    }
    if (!byId.has(entry.id)) byId.set(entry.id, entry as LogEntry)
  }
  return [...byId.values()]
}

/** A v1 backup's flat `configId -> Tier` map is attributed to `ownersListId` - the only list a
 * v1 backup could ever have been describing, since lists didn't exist yet. */
function migrateV1Tiers(
  v1Tiers: Record<string, string> | undefined,
  ownersListId: string,
  known: KnownIds,
  unresolved: string[],
): Record<string, Record<string, string>> {
  const inner = filterKnown(v1Tiers, known.tierIds, unresolved)
  return Object.keys(inner).length > 0 ? { [ownersListId]: inner } : {}
}

function filterTiersV2(
  raw: Record<string, Record<string, string>> | undefined,
  known: KnownIds,
  unresolved: string[],
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {}
  for (const [listId, inner] of Object.entries(raw ?? {})) {
    if (!known.listIds.has(listId)) {
      unresolved.push(listId)
      continue
    }
    result[listId] = filterKnown(inner, known.tierIds, unresolved)
  }
  return result
}

/**
 * Parses and validates a backup file. `tiers` / `complexityOverrides` / `answers` are meant
 * to **replace** existing state (the caller applies that by using `state` as-is); `log` is
 * **appended and de-duplicated by id** against `existingLog`, since a game log is an
 * accumulating record that replacing would destroy.
 *
 * Unknown ids (keys the current dataset no longer recognises) are reported in `unresolved`
 * rather than thrown or silently dropped — surfacing data loss beats hiding it.
 *
 * `ownersListId` is where a v1 backup's flat tier map lands (see `migrateV1Tiers`); v2 backups
 * ignore it and key by the list id each edit already names.
 */
export function parse(json: string, known: KnownIds, existingLog: LogEntry[] = [], ownersListId = ''): ParseResult {
  const parsed = JSON.parse(json) as Partial<Backup> & { tiers?: unknown; collection?: unknown }

  if (typeof parsed.schemaVersion !== 'number' || parsed.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `This backup was made with a newer app version (schemaVersion ${parsed.schemaVersion ?? 'unknown'}); ` +
        `this app only understands up to ${CURRENT_SCHEMA_VERSION}. Update the app before importing.`,
    )
  }
  if (parsed.schemaVersion < 1) {
    throw new Error(
      `This backup has a malformed schemaVersion (${parsed.schemaVersion}); this app never wrote a version below 1.`,
    )
  }

  const unresolved: string[] = []
  const tiers =
    parsed.schemaVersion === 1
      ? migrateV1Tiers(parsed.tiers as Record<string, string> | undefined, ownersListId, known, unresolved)
      : filterTiersV2(parsed.tiers as Record<string, Record<string, string>> | undefined, known, unresolved)
  const complexityOverrides = filterKnown(parsed.complexityOverrides, known.complexityIds, unresolved)
  const answers = filterKnown(parsed.answers, known.questionIds, unresolved)
  const log = mergeLog(existingLog, parsed.log ?? [], known.tierIds, unresolved)
  // Absent on any backup older than v3 (parsed.collection undefined) - filterKnownList reads an
  // empty list from that, which is exactly "owns everything," no separate migration needed.
  const collection = filterKnownList(parsed.collection, known.expansions, unresolved)

  return { state: { tiers, complexityOverrides, answers, log, collection }, unresolved }
}
