import { useState } from 'react'
import { SCENARIOS, scenarioDifficultyFigure } from '../domain/scenarios'
import { CardViewer } from './CardViewer'

/** phase-4 #20 (owner picked variant C, banded frame): the difficulty band — presentation
 * only, the tab's TEXT is always the verbatim printed value. Bands: ≤0 green, 1–2 yellow,
 * 3–4 orange, 5+ red; no readable figure falls back to the neutral band. */
function bandClass(difficulty: string): string {
  const figure = scenarioDifficultyFigure(difficulty)
  if (figure === undefined) return 'scenario-band-none'
  if (figure <= 0) return 'scenario-band-low'
  if (figure <= 2) return 'scenario-band-mid'
  if (figure <= 4) return 'scenario-band-high'
  return 'scenario-band-top'
}

/** The Scenarios grid — CardGrid's shape plus the difficulty indicator the owner locked
 * (frame tinted by band, verbatim value in a corner tab). Rows view stays value-free by
 * design: its data can't support more than the name. */
export function ScenarioGrid() {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  const base = import.meta.env.BASE_URL

  return (
    <div className="card-grid">
      {SCENARIOS.map((scenario) => (
        <button
          key={scenario.name}
          type="button"
          className={`card-grid-tile scenario-tile ${bandClass(scenario.difficulty)}`}
          onClick={() => setEnlarged({ src: `${base}${scenario.image}`, alt: scenario.name })}
        >
          <img src={`${base}${scenario.image}`} alt={scenario.name} loading="lazy" decoding="async" />
          <span className="scenario-difficulty" title={`Difficulty ${scenario.difficulty}`}>
            {scenario.difficulty}
          </span>
        </button>
      ))}
      {enlarged && <CardViewer src={enlarged.src} alt={enlarged.alt} onClose={() => setEnlarged(null)} />}
    </div>
  )
}
