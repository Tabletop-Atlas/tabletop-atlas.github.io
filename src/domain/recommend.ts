import type { Complexity, OCFDU, Spirit, Tier } from './types'

export type Weights = Partial<OCFDU>

export interface RecommendOptions {
  /** Positive = wants a fast start, negative = wants a slow snowball. */
  tempo?: number
  /** Positive = wants positioning puzzles, negative = wants to avoid them. */
  boardControl?: number
  /** 0..1: how heavily to penalize complexity above complexityCeiling. */
  complexityImportance?: number
  complexityCeiling?: Complexity
  /** Spirit id -> tier, e.g. from tiers.json. Missing entries fall back to a neutral prior. */
  tierPrior?: Record<string, Tier>
  /** 0..1 knob (from questionnaire Q10 / a live control); scales up to ALPHA_MAX. */
  tierKnob?: number
}

export interface RankedSpirit {
  spirit: Spirit
  score: number
}

const AXES: (keyof OCFDU)[] = ['offense', 'control', 'fear', 'defense', 'utility']

const COMPLEXITY_LEVEL: Record<Complexity, number> = { Low: 1, Moderate: 2, High: 3, 'Very High': 4 }
const TIER_VALUE: Record<Tier, number> = { X: 7, S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 }
// Mid-scale, so an untiered spirit is neither promoted nor buried by the prior.
const NEUTRAL_TIER_VALUE = 4

// Max weight the tier prior can contribute, kept below fit's full 0..1 range so a
// spirit with the single best fit in the pool can never be outranked by tier alone.
const ALPHA_MAX = 0.5

// Scales how steeply complexity above the stated ceiling buries a spirit's score.
const COMPLEXITY_PENALTY_SCALE = 5

function fitScore(spirit: Spirit, weights: Weights): number {
  return AXES.reduce((sum, axis) => sum + (weights[axis] ?? 0) * spirit.ratings[axis], 0)
}

function tagBoost(spirit: Spirit, tempo: number, boardControl: number): number {
  let bonus = 0
  if (spirit.tags.includes('fast-tempo')) bonus += tempo
  if (spirit.tags.includes('ramping-economy')) bonus -= tempo
  if (spirit.tags.includes('board-control')) bonus += boardControl
  return bonus
}

function complexityPenalty(spirit: Spirit, ceiling: Complexity | undefined, importance: number): number {
  if (!ceiling || importance <= 0) return 0
  const over = COMPLEXITY_LEVEL[spirit.complexity] - COMPLEXITY_LEVEL[ceiling]
  return over > 0 ? importance * over * COMPLEXITY_PENALTY_SCALE : 0
}

function minMaxNormalize(values: number[]): number[] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (max === min) return values.map(() => 0)
  return values.map((v) => (v - min) / (max - min))
}

export function recommend(
  spirits: Spirit[],
  weights: Weights,
  options: RecommendOptions = {},
): RankedSpirit[] {
  const {
    tempo = 0,
    boardControl = 0,
    complexityImportance = 0,
    complexityCeiling,
    tierPrior,
    tierKnob = 0,
  } = options
  const alpha = tierKnob * ALPHA_MAX

  const scored = spirits.map((spirit) => ({
    spirit,
    fit:
      fitScore(spirit, weights) +
      tagBoost(spirit, tempo, boardControl) -
      complexityPenalty(spirit, complexityCeiling, complexityImportance),
    tierValue: tierPrior?.[spirit.id] ? TIER_VALUE[tierPrior[spirit.id]] : NEUTRAL_TIER_VALUE,
  }))

  const normalizedFit = minMaxNormalize(scored.map((s) => s.fit))
  const normalizedTier = minMaxNormalize(scored.map((s) => s.tierValue))

  return scored
    .map((s, i) => ({
      spirit: s.spirit,
      score: normalizedFit[i] + alpha * normalizedTier[i],
      tierValue: s.tierValue,
    }))
    .sort(
      (a, b) =>
        b.score - a.score || b.tierValue - a.tierValue || a.spirit.name.localeCompare(b.spirit.name),
    )
    .map(({ spirit, score }) => ({ spirit, score }))
}
