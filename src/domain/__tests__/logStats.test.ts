import { describe, expect, it } from 'vitest'
import type { LogEntry } from '../backup'
import { computeLogStats } from '../logStats'
import type { Spirit } from '../types'

const lowSpirit: Spirit = {
  id: 'low-spirit',
  name: 'Low Spirit',
  expansion: 'Base',
  complexity: 'Low',
  ratings: { offense: 1, control: 1, fear: 1, defense: 1, utility: 1 },
  elements: [],
  summary: '',
  tags: [],
  aspects: [],
}

const highSpirit: Spirit = {
  id: 'high-spirit',
  name: 'High Spirit',
  expansion: 'Base',
  complexity: 'High',
  ratings: { offense: 1, control: 1, fear: 1, defense: 1, utility: 1 },
  elements: [],
  summary: '',
  tags: [],
  aspects: [],
}

const spirits = [lowSpirit, highSpirit]

let nextId = 0
function entry(overrides: Partial<LogEntry> = {}): LogEntry {
  nextId += 1
  return {
    id: `game-${nextId}`,
    date: '2026-01-01',
    players: [{ name: 'Adam', configId: lowSpirit.id }],
    adversary: 'England',
    adversaryLevel: 3,
    outcome: 'win',
    ...overrides,
  }
}

describe('computeLogStats', () => {
  it('renders without error on an empty log', () => {
    const stats = computeLogStats([], spirits)
    expect(stats.gamesPlayed).toBe(0)
    expect(stats.overall).toEqual({ wins: 0, total: 0, rate: undefined })
    expect(stats.byConfiguration).toEqual({})
    expect(stats.byComplexity).toEqual({})
    expect(stats.byAdversary).toEqual({})
    expect(stats.byDifficultyBand).toEqual({})
  })

  it('counts games played as the number of entries', () => {
    const stats = computeLogStats([entry(), entry(), entry()], spirits)
    expect(stats.gamesPlayed).toBe(3)
  })

  it('computes the overall win rate once sample size clears the threshold', () => {
    const entries = [entry({ outcome: 'win' }), entry({ outcome: 'win' }), entry({ outcome: 'loss' })]
    const stats = computeLogStats(entries, spirits)
    expect(stats.overall).toEqual({ wins: 2, total: 3, rate: 2 / 3 })
  })

  it('suppresses the rate below the small-sample threshold, but still reports the count', () => {
    const stats = computeLogStats([entry({ outcome: 'win' })], spirits)
    expect(stats.overall.rate).toBeUndefined()
    expect(stats.overall.wins).toBe(1)
    expect(stats.overall.total).toBe(1)
  })

  it('breaks down win rate by configuration, counted once per player', () => {
    const entries = [
      entry({ outcome: 'win', players: [{ name: 'Adam', configId: lowSpirit.id }] }),
      entry({ outcome: 'loss', players: [{ name: 'Adam', configId: lowSpirit.id }] }),
      entry({ outcome: 'win', players: [{ name: 'Adam', configId: highSpirit.id }] }),
    ]
    const stats = computeLogStats(entries, spirits)
    expect(stats.byConfiguration[lowSpirit.id]).toEqual({ wins: 1, total: 2, rate: undefined })
    expect(stats.byConfiguration[highSpirit.id]).toEqual({ wins: 1, total: 1, rate: undefined })
  })

  it('breaks down win rate by effective complexity band', () => {
    const entries = [
      entry({ outcome: 'win', players: [{ name: 'Adam', configId: lowSpirit.id }] }),
      entry({ outcome: 'loss', players: [{ name: 'Adam', configId: highSpirit.id }] }),
    ]
    const stats = computeLogStats(entries, spirits)
    expect(stats.byComplexity.Low).toEqual({ wins: 1, total: 1, rate: undefined })
    expect(stats.byComplexity.High).toEqual({ wins: 0, total: 1, rate: undefined })
  })

  it('breaks down win rate by adversary, counted once per game regardless of player count', () => {
    const entries = [
      entry({
        adversary: 'England',
        outcome: 'win',
        players: [
          { name: 'Adam', configId: lowSpirit.id },
          { name: 'Jo', configId: highSpirit.id },
        ],
      }),
      entry({ adversary: 'Sweden', outcome: 'loss' }),
    ]
    const stats = computeLogStats(entries, spirits)
    expect(stats.byAdversary.England).toEqual({ wins: 1, total: 1, rate: undefined })
    expect(stats.byAdversary.Sweden).toEqual({ wins: 0, total: 1, rate: undefined })
  })

  it('a multi-player game counts once toward gamesPlayed and overall, but per-player toward byConfiguration', () => {
    const stats = computeLogStats(
      [
        entry({
          outcome: 'win',
          players: [
            { name: 'Adam', configId: lowSpirit.id },
            { name: 'Jo', configId: highSpirit.id },
          ],
        }),
      ],
      spirits,
    )
    expect(stats.gamesPlayed).toBe(1)
    expect(stats.overall.total).toBe(1)
    expect(stats.byConfiguration[lowSpirit.id].total).toBe(1)
    expect(stats.byConfiguration[highSpirit.id].total).toBe(1)
  })

  it('buckets entries by difficulty band and excludes difficulty-less entries', () => {
    const entries = [
      entry({ outcome: 'win', difficulty: 1 }),
      entry({ outcome: 'loss', difficulty: 4 }),
      entry({ outcome: 'win', difficulty: 7 }),
      entry({ outcome: 'win', difficulty: 12 }),
      entry({ outcome: 'loss' }), // no difficulty - excluded from the band stat
    ]
    const stats = computeLogStats(entries, spirits)
    expect(stats.byDifficultyBand['0-2']).toEqual({ wins: 1, total: 1, rate: undefined })
    expect(stats.byDifficultyBand['3-5']).toEqual({ wins: 0, total: 1, rate: undefined })
    expect(stats.byDifficultyBand['6-8']).toEqual({ wins: 1, total: 1, rate: undefined })
    expect(stats.byDifficultyBand['9+']).toEqual({ wins: 1, total: 1, rate: undefined })
    expect(stats.overall.total).toBe(5)
  })
})
