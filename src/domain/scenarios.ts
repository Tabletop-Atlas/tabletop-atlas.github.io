import scenariosData from '../data/scenarios.json'

/** v5 #05b: derived from images/manifest.json's scenario_front rows — see scenarios.json's
 * `_note`. No expansion field; the manifest doesn't carry one and no other source in this repo
 * knows what a scenario is (an absent field beats a guessed one, CLAUDE.md). phase-4 #20 added
 * `difficulty`: the printed modifier, transcribed VERBATIM from the Spirit Island Wiki — kept a
 * string because the wiki qualifies some values (`1*`, `-1*`, `+/- 1`) and collapsing those to
 * numbers would be estimation. Pinned by scenarioCanon.test.ts. */
export interface Scenario {
  name: string
  difficulty: string
  image: string
}

export const SCENARIOS = scenariosData.scenarios as Scenario[]

/** The numeric reading of a printed difficulty, for presentation (band colours) only — the
 * verbatim string is what renders. Qualified values read their figure (`+/- 1` → 1, `-1*` → -1);
 * a value with no figure reads undefined. */
export function scenarioDifficultyFigure(difficulty: string): number | undefined {
  const match = difficulty.match(/[+-]?\d+/)
  return match ? Number(match[0]) : undefined
}
