import { findAdversary } from './adversaries'
import { SCENARIOS } from './scenarios'

export type BoardType = 'classic' | 'thematic-base' | 'thematic-rebalanced'

const BOARD_MODIFIER: Record<BoardType, number> = {
  classic: 0,
  'thematic-base': 3,
  'thematic-rebalanced': 1,
}

export interface DifficultyLine {
  label: string
  value: string
  amount: number
}

export interface DifficultyInputs {
  adversary: string
  adversaryLevel: number
  secondaryAdversary?: string
  secondaryAdversaryLevel?: number
  boardType?: BoardType
  scenario?: string
}

export interface DifficultyResult {
  total: number | undefined
  lines: DifficultyLine[]
}

/** Reads the numeric figure off a scenario's printed difficulty string. `+/- 1` contributes `0`
 * (it's a coin-flip modifier, not a fixed one) but still shows `±1` in the breakdown; other
 * qualified values (`1*`, `-1*`) read their figure. A leading sign + digits, trailing `*` ignored. */
export function parseScenarioDifficulty(raw: string): number {
  if (/^\+\/-\s*\d+$/.test(raw.trim())) return 0
  const match = raw.match(/^[+-]?\d+/)
  return match ? Number(match[0]) : 0
}

export function computeDifficulty(inputs: DifficultyInputs): DifficultyResult {
  const lines: DifficultyLine[] = []

  const primary = findAdversary(inputs.adversary)
  const primaryBase = primary?.difficultyByLevel?.[inputs.adversaryLevel]
  if (primaryBase === undefined) {
    return { total: undefined, lines: [] }
  }
  lines.push({ label: `${inputs.adversary} L${inputs.adversaryLevel}`, value: String(primaryBase), amount: primaryBase })

  let total = primaryBase

  if (inputs.secondaryAdversary && inputs.secondaryAdversaryLevel !== undefined) {
    const secondary = findAdversary(inputs.secondaryAdversary)
    const secondaryBase = secondary?.difficultyByLevel?.[inputs.secondaryAdversaryLevel]
    if (secondaryBase !== undefined) {
      const higher = Math.max(primaryBase, secondaryBase)
      const lower = Math.min(primaryBase, secondaryBase)
      const combined = higher + Math.round(0.6 * lower)
      const added = combined - primaryBase
      lines.push({
        label: `+ ${inputs.secondaryAdversary} L${inputs.secondaryAdversaryLevel}`,
        value: `${higher} + 0.6·${lower}`,
        amount: added,
      })
      total = combined
    }
  }

  const boardType = inputs.boardType ?? 'classic'
  const boardAmount = BOARD_MODIFIER[boardType]
  if (boardAmount !== 0) {
    lines.push({ label: 'Board', value: boardType, amount: boardAmount })
    total += boardAmount
  }

  if (inputs.scenario) {
    const scenario = SCENARIOS.find((s) => s.name === inputs.scenario)
    if (scenario) {
      const amount = parseScenarioDifficulty(scenario.difficulty)
      const shown = /^\+\/-/.test(scenario.difficulty.trim()) ? '±1' : scenario.difficulty
      lines.push({ label: scenario.name, value: shown, amount })
      total += amount
    }
  }

  return { total, lines }
}
