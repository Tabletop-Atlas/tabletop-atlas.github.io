import { describe, expect, it } from 'vitest'
import type { LogEntry } from '../backup'
import { createGameLog } from '../gameLog'
import { memoryStorage } from '../storage'

function entry(overrides: Partial<Omit<LogEntry, 'id'>> = {}): Omit<LogEntry, 'id'> {
  return {
    date: '2026-01-01',
    players: [{ name: 'Adam', configId: 'shadows-flicker-like-flame::Dark Fire' }],
    adversary: 'England',
    adversaryLevel: 4,
    outcome: 'win',
    ...overrides,
  }
}

describe('gameLog', () => {
  it('starts empty', () => {
    expect(createGameLog(memoryStorage()).list()).toEqual([])
  })

  it('appends an entry and returns it with a generated id', () => {
    const log = createGameLog(memoryStorage())
    const recorded = log.append(entry())
    expect(recorded.id).toBeTruthy()
    expect(log.list()).toEqual([recorded])
  })

  it('gives every entry a unique id', () => {
    const log = createGameLog(memoryStorage())
    const a = log.append(entry())
    const b = log.append(entry())
    expect(a.id).not.toBe(b.id)
  })

  it('accepts optional scenario, terrorLevel and blightRemaining', () => {
    const log = createGameLog(memoryStorage())
    const recorded = log.append(entry({ scenario: 'The Great River', terrorLevel: 2, blightRemaining: 3 }))
    expect(recorded.scenario).toBe('The Great River')
    expect(recorded.terrorLevel).toBe(2)
    expect(recorded.blightRemaining).toBe(3)
  })

  it('records a game with multiple players and configurations', () => {
    const log = createGameLog(memoryStorage())
    const recorded = log.append(
      entry({
        players: [
          { name: 'Adam', configId: 'shadows-flicker-like-flame::Dark Fire' },
          { name: 'Jo', configId: 'river-surges-in-sunlight' },
        ],
      }),
    )
    expect(recorded.players).toHaveLength(2)
  })

  it('persists across a simulated reload (same backing storage, fresh instance)', () => {
    const storage = memoryStorage()
    createGameLog(storage).append(entry())
    const reloaded = createGameLog(storage)
    expect(reloaded.list()).toHaveLength(1)
  })

  it('survives corrupt stored JSON', () => {
    const storage = memoryStorage()
    storage.setItem('spirit-island:game-log', '{not json')
    expect(createGameLog(storage).list()).toEqual([])
  })

  describe('timesPlayed', () => {
    it('counts entries containing the configuration', () => {
      const log = createGameLog(memoryStorage())
      log.append(entry({ players: [{ name: 'Adam', configId: 'a' }] }))
      log.append(entry({ players: [{ name: 'Adam', configId: 'a' }] }))
      log.append(entry({ players: [{ name: 'Adam', configId: 'b' }] }))
      expect(log.timesPlayed('a')).toBe(2)
      expect(log.timesPlayed('b')).toBe(1)
    })

    it('is zero for a configuration never played', () => {
      const log = createGameLog(memoryStorage())
      log.append(entry({ players: [{ name: 'Adam', configId: 'a' }] }))
      expect(log.timesPlayed('never-played')).toBe(0)
    })

    it('counts a game once per distinct configId even with multiple players on it', () => {
      const log = createGameLog(memoryStorage())
      log.append(
        entry({
          players: [
            { name: 'Adam', configId: 'a' },
            { name: 'Jo', configId: 'a' },
          ],
        }),
      )
      expect(log.timesPlayed('a')).toBe(1)
    })
  })

  describe('replaceAll', () => {
    it('overwrites the whole log, used by backup import', () => {
      const log = createGameLog(memoryStorage())
      log.append(entry())
      const merged: LogEntry[] = [{ id: 'fixed-id', ...entry() }]
      log.replaceAll(merged)
      expect(log.list()).toEqual(merged)
    })
  })

  it('drops an entry with no players array, rather than throwing on every later read', () => {
    const storage = memoryStorage()
    storage.setItem(
      'spirit-island:game-log',
      JSON.stringify([{ id: 'corrupt', date: 'x', adversary: 'England', adversaryLevel: 1, outcome: 'win' }]),
    )
    const log = createGameLog(storage)
    expect(log.list()).toEqual([])
    expect(log.timesPlayed('anything')).toBe(0)
  })
})
