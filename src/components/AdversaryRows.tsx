import { useState } from 'react'
import type { Adversary } from '../domain/adversaries'
import { adversaryImage } from '../domain/adversaries'
import { CardViewer } from './CardViewer'
import { readWarmChipVariant } from './ChipRound'
import { expansionColorFor } from './tagColors'

/** v5 #05a: rows view for Adversaries — same shape as OtherCardRows, plus the level range that's
 * the point of #04's "image + data" call.
 *
 * legibility-pass #05: owner picked variant C (solid chip) for the expansion column. */
export function AdversaryRows({ adversaries }: { adversaries: Adversary[] }) {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  const base = import.meta.env.BASE_URL
  const chipVariant = readWarmChipVariant()

  return (
    <ul className="card-rows">
      {adversaries.map((adversary) => {
        const src = `${base}${adversaryImage(adversary.name)}`
        const color = expansionColorFor(adversary.expansion, chipVariant)
        return (
          <li key={adversary.name}>
            <button type="button" className="card-row" onClick={() => setEnlarged({ src, alt: adversary.name })}>
              <span className="card-row-name">{adversary.name}</span>
              <span
                className={color ? 'card-row-expansion expansion-chip' : 'card-row-expansion'}
                style={color ? { background: color } : undefined}
              >
                {adversary.expansion}
              </span>
              <span className="card-row-cost">
                Lv {adversary.minLevel}–{adversary.maxLevel}
              </span>
            </button>
          </li>
        )
      })}
      {enlarged && <CardViewer src={enlarged.src} alt={enlarged.alt} onClose={() => setEnlarged(null)} />}
    </ul>
  )
}
