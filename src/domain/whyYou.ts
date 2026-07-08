import { AXES, AXIS_LABEL } from './axisLabels'
import type { Weights } from './recommend'
import type { Spirit } from './types'

/** Deterministic one-line "why you" explanation from the dominant weighted+rated axis. No LLM. */
export function whyYou(spirit: Spirit, weights: Weights): string {
  const weighted = AXES.filter((axis) => (weights[axis] ?? 0) > 0)
  if (weighted.length === 0) {
    return `${spirit.name} is a strong all-around pick given your answers.`
  }

  const dominant = weighted.reduce((best, axis) =>
    (weights[axis] ?? 0) * spirit.ratings[axis] > (weights[best] ?? 0) * spirit.ratings[best] ? axis : best,
  )

  return `You leaned into ${AXIS_LABEL[dominant]} — ${spirit.name} delivers that better than most.`
}
