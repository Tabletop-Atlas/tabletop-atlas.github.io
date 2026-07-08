import type { Aspect, Complexity, ComplexityDelta, Spirit } from './types'

/** A base spirit, or that spirit with exactly one aspect applied. The unit v2 recommends. */
export interface Configuration {
  configId: string
  spirit: Spirit
  aspect?: Aspect
  isBase: boolean
  /** Printed complexity + the aspect's arrow, clamped. Always reads the *printed* base level -
   * this is what the newcomer ceiling scores, so a personal override can never soften the
   * safeguard that decides what a stranger at the table gets handed. */
  effectiveComplexity: Complexity
  /** Same composition, but the base level is the owner's complexityStore override (falling
   * back to printed when there is none). This is what the enjoyment preference scores. */
  personalEffectiveComplexity: Complexity
}

const COMPLEXITY_ORDER: Complexity[] = ['Low', 'Moderate', 'High', 'Very High']

/** Printed arrow -> level shift, clamped to the scale the game prints (Low..Very High). */
function applyDelta(base: Complexity, delta: ComplexityDelta | undefined): Complexity {
  const shift = delta === 'up' ? 1 : delta === 'down' ? -1 : 0
  const index = COMPLEXITY_ORDER.indexOf(base) + shift
  return COMPLEXITY_ORDER[Math.min(COMPLEXITY_ORDER.length - 1, Math.max(0, index))]
}

/** The stable id used as the key by tierStore, the game log, and the backup file. */
export function toConfigId(spiritId: string, aspectName?: string): string {
  return aspectName ? `${spiritId}::${aspectName}` : spiritId
}

/** Pure: a base configuration for every spirit, plus one per aspect. Fit is inherited from
 * the base spirit's OCFDU unmodified - aspects have no printed OCFDU and none will be invented.
 * `complexityOverrides` (spiritId -> Complexity, e.g. from complexityStore.getAll()) feeds only
 * `personalEffectiveComplexity`; aspects are not individually overridable, so their own printed
 * arrow is what shifts it away from the override. */
export function expand(spirits: Spirit[], complexityOverrides: Record<string, Complexity> = {}): Configuration[] {
  const configurations: Configuration[] = []
  for (const spirit of spirits) {
    const personalBase = complexityOverrides[spirit.id] ?? spirit.complexity
    configurations.push({
      configId: toConfigId(spirit.id),
      spirit,
      isBase: true,
      effectiveComplexity: spirit.complexity,
      personalEffectiveComplexity: personalBase,
    })
    for (const aspect of spirit.aspects) {
      configurations.push({
        configId: toConfigId(spirit.id, aspect.name),
        spirit,
        aspect,
        isBase: false,
        effectiveComplexity: applyDelta(spirit.complexity, aspect.complexityDelta),
        personalEffectiveComplexity: applyDelta(personalBase, aspect.complexityDelta),
      })
    }
  }
  return configurations
}
