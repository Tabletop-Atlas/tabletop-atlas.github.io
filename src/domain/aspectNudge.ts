import { AXES, AXIS_LABEL } from './axisLabels'
import type { Weights } from './recommend'
import type { Aspect, OCFDU, Spirit } from './types'

const LOW_RATING_THRESHOLD = 2

export interface AspectNudge {
  aspect: Aspect
  axis: keyof OCFDU
  message: string
}

/**
 * Surfaces at most one aspect nudge for a shortlisted base spirit: fires only when the
 * user gave top importance to an axis the base spirit rates low on, AND an aspect exists
 * whose shiftsToward hint points at that axis. Aspects are never scored/ranked themselves.
 */
export function findAspectNudge(spirit: Spirit, weights: Weights): AspectNudge | undefined {
  const maxWeight = Math.max(0, ...AXES.map((axis) => weights[axis] ?? 0))
  if (maxWeight <= 0) return undefined

  const highImportanceAxes = AXES.filter((axis) => (weights[axis] ?? 0) === maxWeight)

  for (const axis of highImportanceAxes) {
    if (spirit.ratings[axis] > LOW_RATING_THRESHOLD) continue

    const aspect = spirit.aspects.find((a) => a.shiftsToward === `+${axis}`)
    if (aspect) {
      return {
        aspect,
        axis,
        message: `Fits what you want — but you leaned toward ${AXIS_LABEL[axis]}, and base ${spirit.name} is light there. The ${aspect.name} aspect leans ${AXIS_LABEL[axis]}.`,
      }
    }
  }

  return undefined
}
