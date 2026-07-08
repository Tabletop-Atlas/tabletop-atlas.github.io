import { describe, expect, it } from 'vitest'
import { memoryStorage } from '../storage'
import { createAnswersStore } from '../answersStore'

describe('answersStore', () => {
  it('returns null when nothing has been saved', () => {
    const store = createAnswersStore(memoryStorage())
    expect(store.load()).toBeNull()
  })

  it('round-trips save then load', () => {
    const store = createAnswersStore(memoryStorage())
    store.save({ beatOpponents: 'force' })
    expect(store.load()).toEqual({ beatOpponents: 'force' })
  })

  it('survives a simulated reload (same backing storage, fresh store instance)', () => {
    const storage = memoryStorage()
    createAnswersStore(storage).save({ tempo: 'fast' })
    const reloaded = createAnswersStore(storage)
    expect(reloaded.load()).toEqual({ tempo: 'fast' })
  })
})
