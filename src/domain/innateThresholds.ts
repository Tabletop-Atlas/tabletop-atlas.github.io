import type { Element, InnatePower, Spirit } from './types'

export interface SpiritInnateThresholds {
  spiritId: string
  /** This spirit's innate powers, in `innate-powers.json`'s order (stable, not resorted). */
  powers: InnatePower[]
  /** True when any of this spirit's aspects' `delta` text mentions "innate" — the base panel's
   * thresholds shown here may not hold for that aspect (#16's caption trigger). An aspect with
   * no `delta` (reviewNeeded) never counts as modifying anything - absence is not evidence. */
  aspectModifiesInnates: boolean
}

/**
 * deck-dashboard #16: groups the flat `innate-powers.json` by spirit and flags whether any of
 * that spirit's aspects touch its innate(s), so the gap-odds block can annotate element rows with
 * "wants N Water"-style thresholds and caption them as base-spirit-only when an aspect changes the
 * picture. No modified-innate data exists to show instead (#15 transcribed base panels only) —
 * the caption states the limitation rather than guessing at the aspect's own numbers.
 */
export function innateThresholdsFor(
  spiritId: string,
  spirits: Spirit[],
  innatePowers: InnatePower[],
  aspectName?: string,
): SpiritInnateThresholds | undefined {
  const spirit = spirits.find((s) => s.id === spiritId)
  if (!spirit) return undefined

  const powers = innatePowers.filter((p) => p.spirit === spiritId)
  // With an aspect selected, the caption should warn about *that* aspect specifically, not "some
  // aspect of this spirit somewhere" - a base-spirit view needs no warning at all.
  const aspectModifiesInnates = aspectName
    ? (spirit.aspects.find((a) => a.name === aspectName)?.delta?.toLowerCase().includes('innate') ?? false)
    : false

  return { spiritId, powers, aspectModifiesInnates }
}

/** The elements a spirit's innate thresholds actually reference, canonical-order agnostic — the
 * gap-odds table only annotates rows an innate cares about; every other row stays untouched. */
export function thresholdElements(thresholds: SpiritInnateThresholds): Set<Element> {
  const elements = new Set<Element>()
  for (const power of thresholds.powers) {
    for (const threshold of power.thresholds) {
      for (const element of Object.keys(threshold) as Element[]) elements.add(element)
    }
  }
  return elements
}

/** One line per innate power per threshold rung it prints for this element, e.g. "Massive
 * Flooding I wants 1 Sun, 2 Water" - Roman numerals name the rung (I = first/lowest) because the
 * panel itself numbers thresholds that way, and a player may be tracking any rung, not just the
 * first one clearable. */
export function thresholdAnnotationsFor(element: Element, thresholds: SpiritInnateThresholds): string[] {
  const lines: string[] = []
  for (const power of thresholds.powers) {
    power.thresholds.forEach((threshold, i) => {
      const count = threshold[element]
      if (count !== undefined) lines.push(`${power.name} ${toRoman(i + 1)} wants ${count} ${element}`)
    })
  }
  return lines
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI']

function toRoman(n: number): string {
  return ROMAN_NUMERALS[n - 1] ?? String(n)
}
