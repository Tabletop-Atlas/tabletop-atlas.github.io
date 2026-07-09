import { describe, expect, it } from 'vitest'
import { ADVERSARIES } from '../adversaries'

/**
 * Pins the adversary list against the Spirit Island Wiki (see adversaries.json's `_note` for
 * the fetch trail). This project has previously shipped fabricated data (five invented
 * aspects) that nothing caught - this test is the same tripwire for the adversary set.
 */
const CANONICAL_ADVERSARIES: { name: string; expansion: string; minLevel: number; maxLevel: number }[] = [
  { name: 'Brandenburg-Prussia', expansion: 'Base', minLevel: 0, maxLevel: 6 },
  { name: 'England', expansion: 'Base', minLevel: 0, maxLevel: 6 },
  { name: 'Sweden', expansion: 'Base', minLevel: 0, maxLevel: 6 },
  { name: 'France', expansion: 'Branch and Claw', minLevel: 0, maxLevel: 6 },
  { name: 'Habsburg Monarchy', expansion: 'Jagged Earth', minLevel: 0, maxLevel: 6 },
  { name: 'Russia', expansion: 'Jagged Earth', minLevel: 0, maxLevel: 6 },
  { name: 'Scotland', expansion: 'Promo Pack 2 / Feather and Flame', minLevel: 0, maxLevel: 6 },
  { name: 'Habsburg Mining Expedition', expansion: 'Nature Incarnate', minLevel: 0, maxLevel: 6 },
]

describe('adversary canon', () => {
  it('pins the published adversary list and level ranges', () => {
    expect(ADVERSARIES).toEqual(CANONICAL_ADVERSARIES)
  })

  it('has globally unique adversary names', () => {
    const names = ADVERSARIES.map((a) => a.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('every adversary has a sane level range', () => {
    for (const adversary of ADVERSARIES) {
      expect(adversary.minLevel, adversary.name).toBeLessThanOrEqual(adversary.maxLevel)
    }
  })
})
