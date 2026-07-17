import { useState } from 'react'
import { SCENARIOS, scenarioDifficultyFigure } from '../domain/scenarios'
import { CardViewer } from './CardViewer'
import { readWarmChipVariant } from './ChipRound'
import { scenarioBandColor } from './tagColors'

/** phase-4 #20 (owner picked variant C, banded frame): the difficulty band — presentation
 * only, the tab's TEXT is always the verbatim printed value. Bands: ≤0 green, 1–2 yellow,
 * 3–4 orange, 5+ red; no readable figure falls back to the neutral band. Colour comes inline
 * from the tagColors map (the SpiritTile idiom), so the chip-collision test can see it. */
function bandColor(difficulty: string, chipVariant?: 'warm'): string {
  const figure = scenarioDifficultyFigure(difficulty)
  if (figure === undefined) return scenarioBandColor('none', chipVariant)
  if (figure <= 0) return scenarioBandColor('low', chipVariant)
  if (figure <= 2) return scenarioBandColor('mid', chipVariant)
  if (figure <= 4) return scenarioBandColor('high', chipVariant)
  return scenarioBandColor('top', chipVariant)
}

/** The Scenarios grid — CardGrid's shape plus the difficulty indicator the owner locked
 * (frame tinted by band, verbatim value in a corner tab).
 *
 * archive-grouping #01: the expansion chip (legibility-pass #08) is removed from the tile —
 * it lives in the rows view only. The difficulty band is a separate signal and is unaffected. */
export function ScenarioGrid() {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  const base = import.meta.env.BASE_URL
  const chipVariant = readWarmChipVariant()

  return (
    <div className="card-grid">
      {SCENARIOS.map((scenario) => {
        const band = bandColor(scenario.difficulty, chipVariant)
        return (
          <button
            key={scenario.name}
            type="button"
            className="card-grid-tile scenario-tile"
            style={{ borderColor: band }}
            onClick={() => setEnlarged({ src: `${base}${scenario.image}`, alt: scenario.name })}
          >
            <img src={`${base}${scenario.image}`} alt={scenario.name} loading="lazy" decoding="async" />
            <span className="scenario-difficulty" style={{ background: band }} title={`Difficulty ${scenario.difficulty}`}>
              {scenario.difficulty}
            </span>
          </button>
        )
      })}
      {enlarged && <CardViewer src={enlarged.src} alt={enlarged.alt} onClose={() => setEnlarged(null)} />}
    </div>
  )
}
