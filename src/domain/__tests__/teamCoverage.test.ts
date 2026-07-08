import { describe, expect, it } from 'vitest'
import { analyzeTeam, tuneTowardGaps } from '../teamCoverage'
import type { Spirit } from '../types'

function offenseSpirit(id: string, elements: string[]): Spirit {
  return {
    id,
    name: id,
    expansion: 'Base',
    complexity: 'Low',
    ratings: { offense: 5, control: 2, fear: 0, defense: 0, utility: 1 },
    elements,
    summary: '',
    tags: [],
    aspects: [],
  }
}

describe('analyzeTeam', () => {
  it('reports a Defense gap and zero Fear generation for three offense spirits', () => {
    const team = [offenseSpirit('a', ['Fire']), offenseSpirit('b', ['Air']), offenseSpirit('c', ['Sun'])]
    const { roleGaps } = analyzeTeam(team)
    expect(roleGaps).toContain('defense')
    expect(roleGaps).toContain('fear')
    expect(roleGaps).not.toContain('offense')
  })

  it('reports element coverage as the union of teammates elements', () => {
    const team = [offenseSpirit('a', ['Fire', 'Air']), offenseSpirit('b', ['Air', 'Sun'])]
    const { elementCoverage } = analyzeTeam(team)
    expect(new Set(elementCoverage)).toEqual(new Set(['Fire', 'Air', 'Sun']))
  })

  it('reports no gaps and no coverage for an empty team', () => {
    expect(analyzeTeam([])).toEqual({ elementCoverage: [], roleGaps: [] })
  })
})

describe('tuneTowardGaps', () => {
  it('bumps weight on each gap axis and leaves others untouched', () => {
    const tuned = tuneTowardGaps({ offense: 5 }, ['defense', 'fear'])
    expect(tuned.offense).toBe(5)
    expect(tuned.defense).toBeGreaterThan(0)
    expect(tuned.fear).toBeGreaterThan(0)
  })

  it('adds to an existing weight rather than overwriting it', () => {
    const tuned = tuneTowardGaps({ defense: 1 }, ['defense'])
    expect(tuned.defense).toBeGreaterThan(1)
  })
})
