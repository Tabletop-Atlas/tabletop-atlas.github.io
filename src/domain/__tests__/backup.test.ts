import { describe, expect, it } from 'vitest'
import { CURRENT_SCHEMA_VERSION, parse, serialise } from '../backup'
import type { BackupState, KnownIds, LogEntry } from '../backup'

const KNOWN: KnownIds = {
  tierIds: new Set(['lightnings-swift-strike', 'river-surges-in-sunlight']),
  complexityIds: new Set(['lightnings-swift-strike']),
  questionIds: new Set(['beatOpponents', 'tempo']),
}

const entryA: LogEntry = {
  id: 'game-1',
  date: '2026-01-01',
  players: [{ name: 'Adam', configId: 'lightnings-swift-strike' }],
  adversary: 'England',
  adversaryLevel: 3,
  outcome: 'win',
}

const entryB: LogEntry = {
  id: 'game-2',
  date: '2026-02-01',
  players: [{ name: 'Adam', configId: 'river-surges-in-sunlight' }],
  adversary: 'Sweden',
  adversaryLevel: 2,
  outcome: 'loss',
}

const fullState: BackupState = {
  tiers: { 'lightnings-swift-strike': 'S' },
  complexityOverrides: { 'lightnings-swift-strike': 'Moderate' },
  answers: { beatOpponents: 'force', tempo: 'fast' },
  log: [entryA],
}

describe('backup', () => {
  it('round-trips every section through serialise then parse', () => {
    const json = serialise(fullState)
    const { state, unresolved } = parse(json, KNOWN)
    expect(state).toEqual(fullState)
    expect(unresolved).toEqual([])
  })

  it('stamps the current schema version and an exportedAt timestamp', () => {
    const bundle = JSON.parse(serialise(fullState))
    expect(bundle.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(typeof bundle.exportedAt).toBe('string')
  })

  it('replaces tiers, complexityOverrides and answers rather than merging with existing state', () => {
    const json = serialise(fullState)
    // parse doesn't take "existing" tiers/answers at all - the caller applies the result
    // wholesale, which is what "replace" means here.
    const { state } = parse(json, KNOWN)
    expect(state.tiers).toEqual({ 'lightnings-swift-strike': 'S' })
    expect(state.answers).toEqual({ beatOpponents: 'force', tempo: 'fast' })
  })

  it('appends and de-duplicates the log by id against existing entries', () => {
    const json = serialise({ ...fullState, log: [entryA] })
    const { state } = parse(json, KNOWN, [entryB])
    expect(state.log).toHaveLength(2)
    expect(state.log.map((e) => e.id).sort()).toEqual(['game-1', 'game-2'])
  })

  it('does not duplicate a log entry that exists on both sides', () => {
    const json = serialise({ ...fullState, log: [entryA] })
    const { state } = parse(json, KNOWN, [entryA, entryB])
    expect(state.log).toHaveLength(2)
  })

  it('reports unknown keys as unresolved instead of dropping or throwing', () => {
    const stale: BackupState = {
      tiers: { 'no-longer-exists': 'S' },
      complexityOverrides: { 'no-longer-exists': 'Moderate' },
      answers: { unknownQuestion: 'x' },
      log: [],
    }
    const { state, unresolved } = parse(serialise(stale), KNOWN)
    expect(state.tiers).toEqual({})
    expect(state.complexityOverrides).toEqual({})
    expect(state.answers).toEqual({})
    expect(unresolved.sort()).toEqual(['no-longer-exists', 'no-longer-exists', 'unknownQuestion'])
  })

  it('a bundle exported against a smaller seed still imports its known keys losslessly into a larger one', () => {
    const json = serialise(fullState)
    const biggerSeed: KnownIds = {
      tierIds: new Set([...KNOWN.tierIds, 'new-spirit-config']),
      complexityIds: KNOWN.complexityIds,
      questionIds: KNOWN.questionIds,
    }
    const { state, unresolved } = parse(json, biggerSeed)
    expect(state.tiers).toEqual(fullState.tiers)
    expect(unresolved).toEqual([])
  })

  it('reports a log entry with a missing id as unresolved instead of merging it', () => {
    const json = JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      tiers: {},
      complexityOverrides: {},
      answers: {},
      log: [{ ...entryA, id: undefined }],
    })
    const { state, unresolved } = parse(json, KNOWN)
    expect(state.log).toEqual([])
    expect(unresolved).toContain('log entry with missing or invalid id')
  })

  it('does not collapse two id-less entries into one', () => {
    const json = JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      tiers: {},
      complexityOverrides: {},
      answers: {},
      log: [
        { ...entryA, id: undefined },
        { ...entryB, id: undefined },
      ],
    })
    const { state, unresolved } = parse(json, KNOWN)
    expect(state.log).toEqual([])
    expect(unresolved.filter((u) => u === 'log entry with missing or invalid id')).toHaveLength(2)
  })

  it('reports an unknown configId inside a log entry as unresolved, but still merges the entry', () => {
    const withUnknownConfig: LogEntry = {
      ...entryA,
      id: 'game-3',
      players: [{ name: 'Adam', configId: 'no-longer-exists' }],
    }
    const json = serialise({ ...fullState, log: [withUnknownConfig] })
    const { state, unresolved } = parse(json, KNOWN)
    expect(state.log.map((e) => e.id)).toContain('game-3')
    expect(unresolved).toContain('no-longer-exists')
  })

  it('still imports every good entry when one entry in the file is bad', () => {
    const json = JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      tiers: {},
      complexityOverrides: {},
      answers: {},
      log: [entryA, { ...entryB, id: undefined }],
    })
    const { state } = parse(json, KNOWN)
    expect(state.log.map((e) => e.id)).toEqual(['game-1'])
  })

  it('rejects a bundle with a future schemaVersion with a clear error', () => {
    const future = JSON.stringify({ ...JSON.parse(serialise(fullState)), schemaVersion: CURRENT_SCHEMA_VERSION + 1 })
    expect(() => parse(future, KNOWN)).toThrow(/newer app version/i)
  })

  it('touches no localStorage and no DOM', () => {
    // This test environment has neither global - so if backup.ts touched either, exercising
    // it below would throw ReferenceError rather than merely failing an assertion.
    expect(typeof localStorage).toBe('undefined')
    expect(typeof document).toBe('undefined')
    expect(() => parse(serialise(fullState), KNOWN)).not.toThrow()
  })
})
