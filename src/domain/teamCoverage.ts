import { AXES } from './axisLabels'
import type { Weights } from './recommend'
import type { OCFDU, Spirit } from './types'

export interface TeamCoverage {
  elementCoverage: string[]
  roleGaps: (keyof OCFDU)[]
}

// A team's average rating on an axis below this counts as a role gap.
const GAP_THRESHOLD = 2
// How hard "tune toward the gaps" bumps a gap axis's weight.
const GAP_BOOST = 3

/** Seam 3: pure arithmetic over teammates' OCFDU vectors and element tags. No synergy/combo reasoning. */
export function analyzeTeam(team: Spirit[]): TeamCoverage {
  const elementCoverage = [...new Set(team.flatMap((s) => s.elements))]
  if (team.length === 0) return { elementCoverage, roleGaps: [] }

  const roleGaps = AXES.filter((axis) => {
    const average = team.reduce((sum, s) => sum + s.ratings[axis], 0) / team.length
    return average < GAP_THRESHOLD
  })

  return { elementCoverage, roleGaps }
}

/** Deterministically bumps weights toward the team's role gaps. Same OCFDU machinery, no invented logic. */
export function tuneTowardGaps(weights: Weights, roleGaps: (keyof OCFDU)[]): Weights {
  const tuned = { ...weights }
  for (const axis of roleGaps) {
    tuned[axis] = (tuned[axis] ?? 0) + GAP_BOOST
  }
  return tuned
}
