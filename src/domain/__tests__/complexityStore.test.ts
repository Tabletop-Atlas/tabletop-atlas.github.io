import { describe, expect, it } from 'vitest'
import spiritsData from '../../data/spirits.json'
import { createComplexityStore } from '../complexityStore'
import { memoryStorage } from '../storage'
import type { Complexity, Spirit } from '../types'

const spirits = spiritsData as Spirit[]
const SHADOWS = 'shadows-flicker-like-flame'

const printedOf = (id: string): Complexity => spirits.find((s) => s.id === id)!.complexity
const notPrintedOf = (id: string): Complexity => (printedOf(id) === 'Low' ? 'High' : 'Low')

describe('complexityStore', () => {
  it('falls back to the printed complexity when there is no override', () => {
    const store = createComplexityStore(memoryStorage())
    expect(store.getComplexity(SHADOWS)).toBe(printedOf(SHADOWS))
  })

  it('round-trips setComplexity then getComplexity', () => {
    const store = createComplexityStore(memoryStorage())
    const override = notPrintedOf(SHADOWS)
    store.setComplexity(SHADOWS, override)
    expect(store.getComplexity(SHADOWS)).toBe(override)
  })

  it('reset restores the printed value for that spirit only', () => {
    const store = createComplexityStore(memoryStorage())
    const other = spirits.find((s) => s.id !== SHADOWS)!.id
    store.setComplexity(SHADOWS, notPrintedOf(SHADOWS))
    store.setComplexity(other, notPrintedOf(other))
    store.reset(SHADOWS)
    expect(store.getComplexity(SHADOWS)).toBe(printedOf(SHADOWS))
    expect(store.getComplexity(other)).toBe(notPrintedOf(other))
  })

  it('never mutates the printed complexity in spirits.json', () => {
    const store = createComplexityStore(memoryStorage())
    const before = printedOf(SHADOWS)
    store.setComplexity(SHADOWS, notPrintedOf(SHADOWS))
    expect(spirits.find((s) => s.id === SHADOWS)!.complexity).toBe(before)
  })

  it('survives a simulated reload (same backing storage, fresh store instance)', () => {
    const storage = memoryStorage()
    const override = notPrintedOf(SHADOWS)
    createComplexityStore(storage).setComplexity(SHADOWS, override)
    const reloaded = createComplexityStore(storage)
    expect(reloaded.getComplexity(SHADOWS)).toBe(override)
  })

  it('discards overrides saved against a different seed', () => {
    const storage = memoryStorage()
    storage.setItem(
      'spirit-island:complexity-overrides',
      JSON.stringify({ seed: 'a-stale-fingerprint', overrides: { [SHADOWS]: 'Very High' } }),
    )
    const store = createComplexityStore(storage)
    expect(store.getComplexity(SHADOWS)).toBe(printedOf(SHADOWS))
    expect(store.isCustomised()).toBe(false)
  })

  it('reports a discard on fingerprint mismatch, and stays reported across reads until dismissed', () => {
    const storage = memoryStorage()
    storage.setItem(
      'spirit-island:complexity-overrides',
      JSON.stringify({ seed: 'a-stale-fingerprint', overrides: { [SHADOWS]: 'Very High' } }),
    )
    const store = createComplexityStore(storage)
    expect(store.wasDiscarded()).toBe(true)
    expect(store.getComplexity(SHADOWS)).toBe(printedOf(SHADOWS))
    expect(store.wasDiscarded()).toBe(true)
    store.dismissDiscardNotice()
    expect(store.wasDiscarded()).toBe(false)
  })

  it('does not report a discard for a fresh install with nothing ever stored', () => {
    const store = createComplexityStore(memoryStorage())
    expect(store.wasDiscarded()).toBe(false)
  })

  it('survives corrupt stored JSON', () => {
    const storage = memoryStorage()
    storage.setItem('spirit-island:complexity-overrides', '{not json')
    expect(createComplexityStore(storage).getComplexity(SHADOWS)).toBe(printedOf(SHADOWS))
  })

  it('reports whether the user has customised any complexity', () => {
    const store = createComplexityStore(memoryStorage())
    expect(store.isCustomised()).toBe(false)
    store.setComplexity(SHADOWS, notPrintedOf(SHADOWS))
    expect(store.isCustomised()).toBe(true)
    store.reset(SHADOWS)
    expect(store.isCustomised()).toBe(false)
  })

  it('a no-op edit is not a customisation - isCustomised agrees with getOverrides', () => {
    const store = createComplexityStore(memoryStorage())
    store.setComplexity(SHADOWS, printedOf(SHADOWS))
    expect(store.getOverrides()).toEqual({})
    expect(store.isCustomised()).toBe(false)
  })

  it('getOverrides returns only the user edits, empty when nothing changed', () => {
    const store = createComplexityStore(memoryStorage())
    expect(store.getOverrides()).toEqual({})
    const override = notPrintedOf(SHADOWS)
    store.setComplexity(SHADOWS, override)
    expect(store.getOverrides()).toEqual({ [SHADOWS]: override })
  })

  it('getOverrides excludes a no-op edit (assigning the complexity a spirit already has)', () => {
    const store = createComplexityStore(memoryStorage())
    store.setComplexity(SHADOWS, printedOf(SHADOWS))
    expect(store.getOverrides()).toEqual({})
  })

  it('getAll overlays edits on top of the full seeded set', () => {
    const store = createComplexityStore(memoryStorage())
    const override = notPrintedOf(SHADOWS)
    store.setComplexity(SHADOWS, override)
    const all = store.getAll()
    expect(all[SHADOWS]).toBe(override)
    const other = spirits.find((s) => s.id !== SHADOWS)!.id
    expect(all[other]).toBe(printedOf(other))
  })
})
