import { describe, expect, it } from 'vitest'
import { computeDifficulty, parseScenarioDifficulty } from '../difficulty'

describe('computeDifficulty', () => {
  it('primary adversary only', () => {
    const result = computeDifficulty({ adversary: 'England', adversaryLevel: 3 })
    expect(result.total).toBe(6)
    expect(result.lines).toEqual([{ label: 'England L3', value: '6', amount: 6 }])
  })

  it('primary + second adversary combines via higher + 60% of lower', () => {
    const result = computeDifficulty({
      adversary: 'England',
      adversaryLevel: 3, // 6
      secondaryAdversary: 'Sweden',
      secondaryAdversaryLevel: 2, // 3
    })
    // higher=6, lower=3 -> 6 + round(1.8) = 8
    expect(result.total).toBe(8)
    expect(result.lines).toHaveLength(2)
    expect(result.lines[1].amount).toBe(2)
  })

  it('each board type', () => {
    expect(computeDifficulty({ adversary: 'England', adversaryLevel: 0, boardType: 'classic' }).total).toBe(1)
    expect(computeDifficulty({ adversary: 'England', adversaryLevel: 0, boardType: 'thematic-base' }).total).toBe(4)
    expect(computeDifficulty({ adversary: 'England', adversaryLevel: 0, boardType: 'thematic-rebalanced' }).total).toBe(2)
  })

  it('adversary with no difficultyByLevel yields undefined total and no lines', () => {
    const result = computeDifficulty({ adversary: 'Not A Real Adversary', adversaryLevel: 0 })
    expect(result.total).toBeUndefined()
    expect(result.lines).toEqual([])
  })

  it('a clean-integer scenario adds its figure', () => {
    const result = computeDifficulty({ adversary: 'England', adversaryLevel: 0, scenario: 'Blitz' })
    expect(result.total).toBe(1) // Blitz difficulty "0"
  })
})

describe('parseScenarioDifficulty', () => {
  it('parses a plain integer', () => {
    expect(parseScenarioDifficulty('3')).toBe(3)
  })

  it('parses a qualified value, ignoring the trailing *', () => {
    expect(parseScenarioDifficulty('1*')).toBe(1)
    expect(parseScenarioDifficulty('-1*')).toBe(-1)
  })

  it('parses +/- 1 as 0', () => {
    expect(parseScenarioDifficulty('+/- 1')).toBe(0)
  })
})
