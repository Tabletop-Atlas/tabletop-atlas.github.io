import type { Complexity, Spirit } from './types'

const COMPLEXITY_LEVEL: Record<Complexity, number> = { Low: 1, Moderate: 2, High: 3, 'Very High': 4 }

export interface RandomChooseOptions {
  complexityCeiling?: Complexity
}

/** Constraints are hard filters here (unlike the recommender's soft complexity penalty). */
export function eligiblePool(spirits: Spirit[], options: RandomChooseOptions = {}): Spirit[] {
  const { complexityCeiling } = options
  if (!complexityCeiling) return spirits
  return spirits.filter((s) => COMPLEXITY_LEVEL[s.complexity] <= COMPLEXITY_LEVEL[complexityCeiling])
}

/** Uniform draw over the eligible pool. randomFn is injectable for deterministic tests. */
export function drawRandom(
  spirits: Spirit[],
  options: RandomChooseOptions = {},
  randomFn: () => number = Math.random,
): Spirit | undefined {
  const pool = eligiblePool(spirits, options)
  if (pool.length === 0) return undefined
  return pool[Math.floor(randomFn() * pool.length)]
}
