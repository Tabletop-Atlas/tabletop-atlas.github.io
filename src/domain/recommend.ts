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
  /** 0..1 knob (from questionnaire Q10 / a live control); scales up to ALPHA_MAX. 1 = raw
   * power (favour tier), 0 = something fresh (favour never-played configurations instead). */
  tierKnob?: number
  /** configId -> games played, e.g. from gameLog.timesPlayed. Missing entries are treated as
   * 0 (never played). The only fact the game log feeds into scoring - never outcomes. */
  timesPlayed?: Record<string, number>
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

// Max weight the novelty knob can contribute at its "something fresh" end (tierKnob = 0);
// same ceiling as ALPHA_MAX so fit can never be fully overridden by play count either.
const NOVELTY_MAX = 0.5

// Scales how steeply complexity above the stated ceiling buries a configuration's score.
const COMPLEXITY_PENALTY_SCALE = 5

// Scales the enjoyment-preference term. Kept well below COMPLEXITY_PENALTY_SCALE: the
// newcomer ceiling is a safeguard and must dominate; personal taste is a gentle nudge.
const PREFERENCE_PENALTY_SCALE = 1

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

/**
 * Two consumers, two complexity readings (the v2 split rule - see the PRD's "Personal
 * complexity override" section):
 *  - the newcomer ceiling is a safeguard for a stranger at the table, so it is always scored
 *    against `effectiveComplexity` (printed base + aspect arrow) - a personal override must
 *    never soften it.
 *  - the enjoyment preference is the app owner's own taste, so it is scored against
 *    `personalEffectiveComplexity` (override base + aspect arrow), independent of any ceiling.
 *
 * TODO(review): the issue specifies the split (which reading each consumer uses) but not the
 * exact shape of the preference term, since the "how much complexity do you enjoy" question
 * yields a scale (complexityImportance) rather than a ceiling of its own. Chosen here: a
 * ceiling-independent term proportional to the personal level, scaled well below the ceiling
 * penalty so the newcomer safeguard always dominates. Revisit if this doesn't feel right at
 * the table.
 */
function complexityPenalty(config: Configuration, ceiling: Complexity | undefined, importance: number): number {
  const over = ceiling ? COMPLEXITY_LEVEL[config.effectiveComplexity] - COMPLEXITY_LEVEL[ceiling] : 0
  const ceilingPenalty = over > 0 ? over * COMPLEXITY_PENALTY_SCALE : 0

  const preferencePenalty =
    importance > 0
      ? importance * COMPLEXITY_LEVEL[config.personalEffectiveComplexity] * PREFERENCE_PENALTY_SCALE
      : 0

  return ceilingPenalty + preferencePenalty
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
    timesPlayed,
  } = options
  const alpha = tierKnob * ALPHA_MAX
  // The novelty end of the same knob: strongest when tierKnob is at its "fresh" (0) end.
  const beta = (1 - tierKnob) * NOVELTY_MAX

  const scored = configs.map((config) => ({
    config,
    fit:
      fitScore(config, weights) +
      tagBoost(config, tempo, boardControl) -
      complexityPenalty(config, complexityCeiling, complexityImportance),
    tierValue: tierPrior?.[config.configId] ? TIER_VALUE[tierPrior[config.configId]] : NEUTRAL_TIER_VALUE,
    // Negated so normalizing puts never-played configurations (0 plays) at the high end.
    noveltyValue: -(timesPlayed?.[config.configId] ?? 0),
  }))

  const normalizedFit = minMaxNormalize(scored.map((s) => s.fit))
  const normalizedTier = minMaxNormalize(scored.map((s) => s.tierValue))
  const normalizedNovelty = minMaxNormalize(scored.map((s) => s.noveltyValue))

  return scored
    .map((s, i) => ({
      config: s.config,
      score: normalizedFit[i] + alpha * normalizedTier[i] + beta * normalizedNovelty[i],
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
