export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function memoryStorage(): KeyValueStorage {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
    removeItem: (key) => {
      map.delete(key)
    },
  }
}

/** Real localStorage in the browser; an in-memory fallback anywhere it's unavailable (e.g. tests). */
export function defaultStorage(): KeyValueStorage {
  return typeof localStorage !== 'undefined' ? localStorage : memoryStorage()
}
