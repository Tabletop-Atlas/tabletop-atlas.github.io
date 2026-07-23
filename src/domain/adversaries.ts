import adversariesData from '../data/adversaries.json'
import { slugify } from './slug'

/** A published, closed set - see `adversaries.json`'s `_note` for where this was transcribed
 * from. Recording a game picks from this set instead of free text, so "England", "england"
 * and "Engalnd" can no longer fragment the win-rate-by-adversary statistic. */
export interface Adversary {
  name: string
  expansion: string
  minLevel: number
  maxLevel: number
  /** Official per-level difficulty, index = level 0-6. Absent when the wiki doesn't publish it. */
  difficultyByLevel?: number[]
}

export const ADVERSARIES = adversariesData.adversaries as Adversary[]

export function findAdversary(name: string): Adversary | undefined {
  return ADVERSARIES.find((a) => a.name === name)
}

/** v5 #05a: the panel image's path, derived from the name rather than stored on the record —
 * adversaries.json stays exactly what adversaryCanon.test.ts pins, one dataset, no image field
 * bolted on for the browser. Same slug rule as scripts/extract-scenarios.mjs, so the two joins
 * against images/manifest.json's filenames can't drift apart. */
export function adversaryImage(name: string): string {
  return `adversaries/${slugify(name)}.webp`
}
