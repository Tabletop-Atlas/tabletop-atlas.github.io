import adversariesData from '../data/adversaries.json'

/** A published, closed set - see `adversaries.json`'s `_note` for where this was transcribed
 * from. Recording a game picks from this set instead of free text, so "England", "england"
 * and "Engalnd" can no longer fragment the win-rate-by-adversary statistic. */
export interface Adversary {
  name: string
  expansion: string
  minLevel: number
  maxLevel: number
}

export const ADVERSARIES = adversariesData.adversaries as Adversary[]

export function findAdversary(name: string): Adversary | undefined {
  return ADVERSARIES.find((a) => a.name === name)
}
