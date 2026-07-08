import type { Configuration } from './configurations'
import type { Complexity, OCFDU, Tier } from './types'

export type Weights = Partial<OCFDU>

export interface RecommendOptions {
  /** Positive = wants a fast start, negative = wants a slow snowball. */
  tempo?: number
  /** Positive = wants positioning puzzles, negative = wants to avoid them. */
  boardControl?: number
  /** 0..1: how heavily to penalize complexity above complexityCeiling. */
  complexityImportance?: number
  complexityCeiling?: Complexity
  /** configId -> tier, e.g. from tiers.json. Missing entries fall back to a neutral prior. */
  tierPrior?: Record<string, Tier>
  /** 0..1 knob (from questionnaire Q10 / a live control); scales up to ALPHA_MAX. */
  tierKnob?: number
}

export interface RankedConfiguration {
  config: Configuration
  score: number
}

const AXES: (keyof OCFDU)[] = ['offense', 'control', 'fear', 'defense', 'utility']

const COMPLEXITY_LEVEL: Record<Complexity, number> = { Low: 1, Moderate: 2, High: 3, 'Very High': 4 }
const TIER_VALUE: Record<Tier, number> = { X: 7, S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 }
// Mid-scale, so an untiered configuration is neither promoted nor buried by the prior.
const NEUTRAL_TIER_VALUE = 4

// Max weight the tier prior can contribute, kept below fit's full 0..1 range so a
// configuration with the single best fit in the pool can never be outranked by tier alone.
const ALPHA_MAX = 0.5

// Scales how steeply complexity above the stated ceiling buries a configuration's score.
const COMPLEXITY_PENALTY_SCALE = 5

function fitScore(config: Configuration, weights: Weights): number {
  return AXES.reduce((sum, axis) => sum + (weights[axis] ?? 0) * config.spirit.ratings[axis], 0)
}

function tagBoost(config: Configuration, tempo: number, boardControl: number): number {
  let bonus = 0
  const tags = config.spirit.tags
  if (tags.includes('fast-tempo')) bonus += tempo
  if (tags.includes('ramping-economy')) bonus -= tempo
  if (tags.includes('board-control')) bonus += boardControl
  return bonus
}

function complexityPenalty(level: Complexity, ceiling: Complexity | undefined, importance: number): number {
  if (!ceiling || importance <= 0) return 0
  const over = COMPLEXITY_LEVEL[level] - COMPLEXITY_LEVEL[ceiling]
  return over > 0 ? importance * over * COMPLEXITY_PENALTY_SCALE : 0
}

function minMaxNormalize(values: number[]): number[] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (max === min) return values.map(() => 0)
  return values.map((v) => (v - min) / (max - min))
}

/** Seam 1: ranks configurations (a base spirit, or spirit+aspect). Fit is inherited from
 * the base spirit's OCFDU; the complexity penalty scores the configuration's *effective*
 * complexity, so a complexity-shifting aspect changes the ranking without new machinery. */
export function recommend(
  configs: Configuration[],
  weights: Weights,
  options: RecommendOptions = {},
): RankedConfiguration[] {
  const {
    tempo = 0,
    boardControl = 0,
    complexityImportance = 0,
    complexityCeiling,
    tierPrior,
    tierKnob = 0,
  } = options
  const alpha = tierKnob * ALPHA_MAX

  const scored = configs.map((config) => ({
    config,
    fit:
      fitScore(config, weights) +
      tagBoost(config, tempo, boardControl) -
      complexityPenalty(config.effectiveComplexity, complexityCeiling, complexityImportance),
    tierValue: tierPrior?.[config.configId] ? TIER_VALUE[tierPrior[config.configId]] : NEUTRAL_TIER_VALUE,
  }))

  const normalizedFit = minMaxNormalize(scored.map((s) => s.fit))
  const normalizedTier = minMaxNormalize(scored.map((s) => s.tierValue))

  return scored
    .map((s, i) => ({
      config: s.config,
      score: normalizedFit[i] + alpha * normalizedTier[i],
      tierValue: s.tierValue,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.tierValue - a.tierValue ||
        a.config.configId.localeCompare(b.config.configId),
    )
    .map(({ config, score }) => ({ config, score }))
}

/** Higher score wins; an exact tie breaks toward the base configuration (an aspect must earn
 * its way past base via tier, complexity fit, or novelty - never win by coin flip); a further
 * tie falls back to configId so ordering is deterministic across reloads. */
function isBetter(a: RankedConfiguration, b: RankedConfiguration): boolean {
  if (a.score !== b.score) return a.score > b.score
  if (a.config.isBase !== b.config.isBase) return a.config.isBase
  return a.config.configId < b.config.configId
}

/** At most one configuration per base spirit survives - the best-scoring one. Call this on
 * `recommend`'s output before slicing a shortlist; ranked already sorted by score, but the
 * dedup and its tie-break are computed independently of that order. */
export function dedupeBySpirit(ranked: RankedConfiguration[]): RankedConfiguration[] {
  const bestPerSpirit = new Map<string, RankedConfiguration>()
  for (const entry of ranked) {
    const spiritId = entry.config.spirit.id
    const current = bestPerSpirit.get(spiritId)
    if (!current || isBetter(entry, current)) bestPerSpirit.set(spiritId, entry)
  }
  return [...bestPerSpirit.values()].sort((a, b) => (isBetter(a, b) ? -1 : isBetter(b, a) ? 1 : 0))
}
