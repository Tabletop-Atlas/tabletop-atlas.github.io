import { describe, expect, it } from 'vitest'
import { createCollectionStore, filterOwnedConfigurations, isConfigurationOwned } from '../collectionStore'
import type { Configuration } from '../configurations'
import { memoryStorage } from '../storage'
import type { Spirit } from '../types'

const JAGGED: Spirit = {
  id: 'jagged-spirit',
  name: 'Jagged Spirit',
  expansion: 'Jagged Earth',
  complexity: 'Low',
  ratings: { offense: 1, control: 1, fear: 1, defense: 1, utility: 1 },
  elements: [],
  summary: '',
  tags: [],
  aspects: [],
}

const BASE: Spirit = { ...JAGGED, id: 'base-spirit', name: 'Base Spirit', expansion: 'Base' }

describe('createCollectionStore', () => {
  it('owns everything by default, on a fresh install', () => {
    const store = createCollectionStore(memoryStorage())
    for (const expansion of ['Base', 'Branch & Claw', 'Feather & Flame', 'Horizons', 'Jagged Earth', 'Nature Incarnate', 'Promo'] as const) {
      expect(store.owns(expansion)).toBe(true)
    }
  })

  it('round-trips setOwned(false) then owns()', () => {
    const store = createCollectionStore(memoryStorage())
    store.setOwned('Jagged Earth', false)
    expect(store.owns('Jagged Earth')).toBe(false)
    expect(store.owns('Base')).toBe(true)
  })

  it('setOwned(true) after excluding restores ownership', () => {
    const store = createCollectionStore(memoryStorage())
    store.setOwned('Jagged Earth', false)
    store.setOwned('Jagged Earth', true)
    expect(store.owns('Jagged Earth')).toBe(true)
  })

  it('survives a simulated reload (same backing storage, fresh store instance)', () => {
    const storage = memoryStorage()
    createCollectionStore(storage).setOwned('Jagged Earth', false)
    const reloaded = createCollectionStore(storage)
    expect(reloaded.owns('Jagged Earth')).toBe(false)
  })

  it('survives corrupt stored JSON, falling back to owns-everything', () => {
    const storage = memoryStorage()
    storage.setItem('spirit-island:collection', '{not json')
    const store = createCollectionStore(storage)
    expect(store.owns('Jagged Earth')).toBe(true)
  })

  it('ignores an unknown expansion name in stored data rather than throwing', () => {
    const storage = memoryStorage()
    storage.setItem('spirit-island:collection', JSON.stringify({ excluded: ['Not A Real Expansion'] }))
    const store = createCollectionStore(storage)
    expect(store.owns('Jagged Earth')).toBe(true)
  })

  it('reports whether the collection has been customised', () => {
    const store = createCollectionStore(memoryStorage())
    expect(store.isCustomised()).toBe(false)
    store.setOwned('Jagged Earth', false)
    expect(store.isCustomised()).toBe(true)
    store.setOwned('Jagged Earth', true)
    expect(store.isCustomised()).toBe(false)
  })

  it('getExcluded returns only the excluded expansions, sorted', () => {
    const store = createCollectionStore(memoryStorage())
    store.setOwned('Nature Incarnate', false)
    store.setOwned('Base', false)
    expect(store.getExcluded()).toEqual(['Base', 'Nature Incarnate'])
  })

  it('resetAll clears every exclusion back to owns-everything', () => {
    const store = createCollectionStore(memoryStorage())
    store.setOwned('Jagged Earth', false)
    store.resetAll()
    expect(store.owns('Jagged Earth')).toBe(true)
    expect(store.isCustomised()).toBe(false)
  })
})

function config(spirit: Spirit, aspect?: Spirit['aspects'][number]): Configuration {
  return {
    configId: aspect ? `${spirit.id}::${aspect.name}` : spirit.id,
    spirit,
    aspect,
    isBase: !aspect,
    effectiveComplexity: spirit.complexity,
    personalEffectiveComplexity: spirit.complexity,
  }
}

describe('isConfigurationOwned', () => {
  it('is owned when the spirit\'s expansion is not excluded and there is no aspect', () => {
    expect(isConfigurationOwned(config(JAGGED), new Set())).toBe(true)
  })

  it('is not owned when the spirit\'s expansion is excluded', () => {
    expect(isConfigurationOwned(config(JAGGED), new Set(['Jagged Earth']))).toBe(false)
  })

  it('is not owned when the aspect\'s own expansion is excluded, even if the base spirit is owned', () => {
    const aspect = { name: 'Some Aspect', expansion: 'Nature Incarnate' } as const
    expect(isConfigurationOwned(config(BASE, aspect), new Set(['Nature Incarnate']))).toBe(false)
  })

  it('is owned when both the spirit and the aspect\'s expansions are unexcluded, even if different', () => {
    const aspect = { name: 'Some Aspect', expansion: 'Nature Incarnate' } as const
    expect(isConfigurationOwned(config(BASE, aspect), new Set(['Jagged Earth']))).toBe(true)
  })

  it('is not owned when the base spirit\'s own expansion is excluded, even if the aspect\'s is not', () => {
    const aspect = { name: 'Some Aspect', expansion: 'Nature Incarnate' } as const
    expect(isConfigurationOwned(config(JAGGED, aspect), new Set(['Jagged Earth']))).toBe(false)
  })
})

describe('filterOwnedConfigurations', () => {
  it('excludes exactly the configurations isConfigurationOwned would reject, keeps the rest', () => {
    const jaggedConfig = config(JAGGED)
    const baseConfig = config(BASE)
    const result = filterOwnedConfigurations([jaggedConfig, baseConfig], new Set(['Jagged Earth']))
    expect(result).toEqual([baseConfig])
  })

  it('excludes nothing for an empty excluded set', () => {
    const configs = [config(JAGGED), config(BASE)]
    expect(filterOwnedConfigurations(configs, new Set())).toEqual(configs)
  })
})
