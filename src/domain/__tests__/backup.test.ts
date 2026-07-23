import { describe, expect, it } from 'vitest'
import { CURRENT_SCHEMA_VERSION, parse, serialise } from '../backup'
import type { BackupState, KnownIds, LogEntry } from '../backup'

const OWNERS_LIST = 'owners-board'
const FUN_LIST = 'personal-fun-abc123'

const KNOWN: KnownIds = {
  tierIds: new Set(['lightnings-swift-strike', 'river-surges-in-sunlight']),
  listIds: new Set([OWNERS_LIST, FUN_LIST]),
  complexityIds: new Set(['lightnings-swift-strike']),
  questionIds: new Set(['beatOpponents', 'tempo']),
  expansions: new Set(['Jagged Earth', 'Base']),
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
  tiers: { [OWNERS_LIST]: { 'lightnings-swift-strike': 'S' } },
  complexityOverrides: { 'lightnings-swift-strike': 'Moderate' },
  answers: { beatOpponents: 'force', tempo: 'fast' },
  log: [entryA],
  collection: ['Jagged Earth'],
}

describe('backup', () => {
  it('round-trips every section through serialise then parse', () => {
    const json = serialise(fullState)
    const { state, unresolved } = parse(json, KNOWN)
    expect(state).toEqual(fullState)
    expect(unresolved).toEqual([])
  })

  it('round-trips a log entry with notes intact, and an entry without notes is unaffected', () => {
    const withNotes: LogEntry = { ...entryA, id: 'game-notes', notes: 'close game, blight cascade turn 5' }
    const withoutNotes: LogEntry = { ...entryB, id: 'game-no-notes' }
    const json = serialise({ ...fullState, log: [withNotes, withoutNotes] })
    const { state, unresolved } = parse(json, KNOWN)
    expect(unresolved).toEqual([])
    expect(state.log.find((e) => e.id === 'game-notes')?.notes).toBe('close game, blight cascade turn 5')
    expect(state.log.find((e) => e.id === 'game-no-notes')?.notes).toBeUndefined()
  })

  it('stamps the current schema version (3) and an exportedAt timestamp', () => {
    const bundle = JSON.parse(serialise(fullState))
    expect(bundle.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(CURRENT_SCHEMA_VERSION).toBe(4)
    expect(typeof bundle.exportedAt).toBe('string')
  })

  it('replaces tiers, complexityOverrides and answers rather than merging with existing state', () => {
    const json = serialise(fullState)
    const { state } = parse(json, KNOWN)
    expect(state.tiers).toEqual({ [OWNERS_LIST]: { 'lightnings-swift-strike': 'S' } })
    expect(state.answers).toEqual({ beatOpponents: 'force', tempo: 'fast' })
  })

  it('restores edits to several personal lists, each landing on its own list', () => {
    const multiList: BackupState = {
      ...fullState,
      tiers: {
        [OWNERS_LIST]: { 'lightnings-swift-strike': 'S' },
        [FUN_LIST]: { 'river-surges-in-sunlight': 'X' },
      },
    }
    const { state, unresolved } = parse(serialise(multiList), KNOWN)
    expect(state.tiers[OWNERS_LIST]).toEqual({ 'lightnings-swift-strike': 'S' })
    expect(state.tiers[FUN_LIST]).toEqual({ 'river-surges-in-sunlight': 'X' })
    expect(unresolved).toEqual([])
  })

  describe('v1 -> v2 migration', () => {
    it('migrates a v1 flat tier map onto the owner\'s personal list', () => {
      const v1Json = JSON.stringify({
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        tiers: { 'lightnings-swift-strike': 'S' },
        complexityOverrides: {},
        answers: {},
        log: [],
      })
      const { state, unresolved } = parse(v1Json, KNOWN, [], OWNERS_LIST)
      expect(state.tiers).toEqual({ [OWNERS_LIST]: { 'lightnings-swift-strike': 'S' } })
      expect(unresolved).toEqual([])
    })

    it('a v1 backup with no tier edits migrates to an empty v2 tiers object, not an empty-keyed list', () => {
      const v1Json = JSON.stringify({
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        tiers: {},
        complexityOverrides: {},
        answers: {},
        log: [],
      })
      const { state } = parse(v1Json, KNOWN, [], OWNERS_LIST)
      expect(state.tiers).toEqual({})
    })
  })

  describe('v2 -> v3 migration', () => {
    it('a v2 backup with no collection field migrates to an empty collection (owns everything)', () => {
      const v2Json = JSON.stringify({
        schemaVersion: 2,
        exportedAt: new Date().toISOString(),
        tiers: { [OWNERS_LIST]: { 'lightnings-swift-strike': 'S' } },
        complexityOverrides: {},
        answers: {},
        log: [],
      })
      const { state, unresolved } = parse(v2Json, KNOWN)
      expect(state.collection).toEqual([])
      expect(unresolved).toEqual([])
    })
  })

  it('reports unknown keys as unresolved instead of dropping or throwing', () => {
    const stale: BackupState = {
      tiers: { [OWNERS_LIST]: { 'no-longer-exists': 'S' } },
      complexityOverrides: { 'no-longer-exists': 'Moderate' },
      answers: { unknownQuestion: 'x' },
      log: [],
      collection: ['Not A Real Expansion'] as unknown as BackupState['collection'],
    }
    const { state, unresolved } = parse(serialise(stale), KNOWN)
    expect(state.tiers[OWNERS_LIST]).toEqual({})
    expect(state.complexityOverrides).toEqual({})
    expect(state.answers).toEqual({})
    expect(state.collection).toEqual([])
    expect(unresolved.sort()).toEqual(['Not A Real Expansion', 'no-longer-exists', 'no-longer-exists', 'unknownQuestion'])
  })

  it('an import naming an unknown list id lands in unresolved, applies nothing from it, and does not throw', () => {
    const stale: BackupState = {
      ...fullState,
      tiers: { 'list-that-no-longer-exists': { 'lightnings-swift-strike': 'S' } },
    }
    expect(() => parse(serialise(stale), KNOWN)).not.toThrow()
    const { state, unresolved } = parse(serialise(stale), KNOWN)
    expect(state.tiers).toEqual({})
    expect(unresolved).toContain('list-that-no-longer-exists')
  })

  it('a bundle exported against a smaller seed still imports its known keys losslessly into a larger one', () => {
    const json = serialise(fullState)
    const biggerSeed: KnownIds = {
      tierIds: new Set([...KNOWN.tierIds, 'new-spirit-config']),
      listIds: KNOWN.listIds,
      complexityIds: KNOWN.complexityIds,
      questionIds: KNOWN.questionIds,
      expansions: KNOWN.expansions,
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

  it('rejects an entry whose players is missing, null, or not an array', () => {
    const json = JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      tiers: {},
      complexityOverrides: {},
      answers: {},
      log: [
        { ...entryA, id: 'no-players', players: undefined },
        { ...entryA, id: 'null-players', players: null },
        { ...entryA, id: 'object-players', players: { name: 'Adam', configId: 'lightnings-swift-strike' } },
      ],
    })
    const { state, unresolved } = parse(json, KNOWN)
    expect(state.log).toEqual([])
    expect(unresolved.filter((u) => u === 'log entry with missing or invalid players')).toHaveLength(3)
  })

  it('rejects an entry whose players is a string instead of iterating its characters', () => {
    const json = JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      tiers: {},
      complexityOverrides: {},
      answers: {},
      log: [{ ...entryA, id: 'string-players', players: 'nope' }],
    })
    const { state, unresolved } = parse(json, KNOWN)
    expect(state.log).toEqual([])
    expect(unresolved).toEqual(['log entry with missing or invalid players'])
  })

  it('rejects an entry whose player is missing name or configId', () => {
    const json = JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      tiers: {},
      complexityOverrides: {},
      answers: {},
      log: [
        { ...entryA, id: 'no-name', players: [{ configId: 'lightnings-swift-strike' }] },
        { ...entryA, id: 'no-configid', players: [{ name: 'Adam' }] },
      ],
    })
    const { state, unresolved } = parse(json, KNOWN)
    expect(state.log).toEqual([])
    expect(unresolved.filter((u) => u === 'log entry with missing or invalid players')).toHaveLength(2)
  })

  it('still imports every good entry when a malformed-players entry is in the same file', () => {
    const json = JSON.stringify({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      tiers: {},
      complexityOverrides: {},
      answers: {},
      log: [entryA, { ...entryB, players: 'nope' }],
    })
    const { state } = parse(json, KNOWN)
    expect(state.log.map((e) => e.id)).toEqual(['game-1'])
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

  it('rejects a bundle with schemaVersion 0 or negative as malformed', () => {
    const zero = JSON.stringify({ ...JSON.parse(serialise(fullState)), schemaVersion: 0 })
    const negative = JSON.stringify({ ...JSON.parse(serialise(fullState)), schemaVersion: -1 })
    expect(() => parse(zero, KNOWN)).toThrow(/malformed/i)
    expect(() => parse(negative, KNOWN)).toThrow(/malformed/i)
  })

  it('touches no localStorage and no DOM', () => {
    // This test environment has neither global - so if backup.ts touched either, exercising
    // it below would throw ReferenceError rather than merely failing an assertion.
    expect(typeof localStorage).toBe('undefined')
    expect(typeof document).toBe('undefined')
    expect(() => parse(serialise(fullState), KNOWN)).not.toThrow()
  })
})
