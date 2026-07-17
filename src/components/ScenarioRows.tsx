import { useState } from 'react'
import type { Scenario } from '../domain/scenarios'
import { CardViewer } from './CardViewer'
import { readWarmChipVariant } from './ChipRound'
import { expansionColorFor } from './tagColors'

/** v5 #05b: rows view for Scenarios — name only, originally. legibility-pass #02 sourced an
 * `expansion` field from canon; #08 surfaces it here the same way OtherCardRows/AdversaryRows
 * show theirs — a solid chip (owner's #05 pick), absent when a scenario's raw expansion string
 * doesn't normalize (honest absence, never a guessed colour). */
export function ScenarioRows({ scenarios }: { scenarios: Scenario[] }) {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  const base = import.meta.env.BASE_URL
  const chipVariant = readWarmChipVariant()

  return (
    <ul className="card-rows">
      {scenarios.map((scenario) => {
        const color = expansionColorFor(scenario.expansion, chipVariant)
        return (
          <li key={scenario.name}>
            <button
              type="button"
              className="card-row"
              onClick={() => setEnlarged({ src: `${base}${scenario.image}`, alt: scenario.name })}
            >
              <span className="card-row-name">{scenario.name}</span>
              <span
                className={color ? 'card-row-expansion expansion-chip' : 'card-row-expansion'}
                style={color ? { background: color } : undefined}
              >
                {scenario.expansion}
              </span>
            </button>
          </li>
        )
      })}
      {enlarged && <CardViewer src={enlarged.src} alt={enlarged.alt} onClose={() => setEnlarged(null)} />}
    </ul>
  )
}
