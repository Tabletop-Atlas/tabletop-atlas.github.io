import { defaultStorage, type KeyValueStorage } from './storage'
import type { Answers } from './answersToWeights'

const STORAGE_KEY = 'spirit-island:last-answers'

/** Persists the last questionnaire answers so the recommender restores on reload. */
export function createAnswersStore(storage: KeyValueStorage = defaultStorage()) {
  return {
    save(answers: Answers): void {
      storage.setItem(STORAGE_KEY, JSON.stringify(answers))
    },
    load(): Answers | null {
      const raw = storage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    },
    clear(): void {
      storage.removeItem(STORAGE_KEY)
    },
  }
}

export const answersStore = createAnswersStore()
