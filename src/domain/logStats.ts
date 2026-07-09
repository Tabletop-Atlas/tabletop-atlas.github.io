import type { LogEntry } from './backup'
import { expand } from './configurations'
import type { Complexity, Spirit } from './types'

export interface RateStat {
  wins: number
  total: number
  /** Suppressed below SMALL_SAMPLE_THRESHOLD - a rate over a couple of games reads as
   * meaningful when it's noise. Display `wins`/`total` regardless; only hide the percentage. */
  rate?: number
}

export interface LogStats {
  gamesPlayed: number
  overall: RateStat
  byConfiguration: Record<string, RateStat>
  byComplexity: Partial<Record<Complexity, RateStat>>
  byAdversary: Record<string, RateStat>
}

const SMALL_SAMPLE_THRESHOLD = 3

function rateStat(wins: number, total: number): RateStat {
  return { wins, total, rate: total >= SMALL_SAMPLE_THRESHOLD ? wins / total : undefined }
}

function bump(counts: Map<string, { wins: number; total: number }>, key: string, won: boolean): void {
  const current = counts.get(key) ?? { wins: 0, total: 0 }
  current.total += 1
  if (won) current.wins += 1
  counts.set(key, current)
}

function toRecord(counts: Map<string, { wins: number; total: number }>): Record<string, RateStat> {
  return Object.fromEntries([...counts].map(([key, { wins, total }]) => [key, rateStat(wins, total)]))
}

/**
 * Pure: descriptive statistics only, display-only per the PRD - nothing here writes to
 * tierStore, complexityStore or the weights. Games (entries) count once for the overall rate
 * and by-adversary rate; per-configuration and per-complexity-band rates count once per
 * player, since one game entry can carry several different configurations.
 */
export function computeLogStats(entries: LogEntry[], spirits: Spirit[]): LogStats {
  const configById = new Map(expand(spirits).map((c) => [c.configId, c]))

  let overallWins = 0
  const byConfiguration = new Map<string, { wins: number; total: number }>()
  const byComplexity = new Map<string, { wins: number; total: number }>()
  const byAdversary = new Map<string, { wins: number; total: number }>()

  for (const entry of entries) {
    const won = entry.outcome === 'win'
    if (won) overallWins += 1
    bump(byAdversary, entry.adversary, won)
    for (const player of entry.players) {
      bump(byConfiguration, player.configId, won)
      const config = configById.get(player.configId)
      if (config) bump(byComplexity, config.effectiveComplexity, won)
    }
  }

  return {
    gamesPlayed: entries.length,
    overall: rateStat(overallWins, entries.length),
    byConfiguration: toRecord(byConfiguration),
    byComplexity: toRecord(byComplexity) as Partial<Record<Complexity, RateStat>>,
    byAdversary: toRecord(byAdversary),
  }
}
