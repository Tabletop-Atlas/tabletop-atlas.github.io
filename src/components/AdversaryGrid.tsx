import { useState } from 'react'
import type { Adversary } from '../domain/adversaries'
import { adversaryImage } from '../domain/adversaries'
import { CardViewer } from './CardViewer'

/** v5 #05a: the Adversaries segment's grid tile — panel art plus its level range, the "image +
 * data" answer #04 grilled out. Adversaries is deliberately the one segment whose tile isn't a
 * bare image: the data already exists (adversaries.json, canon-tested) and is cheap to show.
 *
 * archive-grouping #01: the expansion chip lives in the rows view only — tiles show art, clean. */
export function AdversaryGrid({ adversaries }: { adversaries: Adversary[] }) {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  const base = import.meta.env.BASE_URL

  return (
    <div className="card-grid">
      {adversaries.map((adversary) => {
        const src = `${base}${adversaryImage(adversary.name)}`
        return (
          <button
            key={adversary.name}
            type="button"
            className="card-grid-tile adversary-tile"
            onClick={() => setEnlarged({ src, alt: adversary.name })}
          >
            <img src={src} alt={adversary.name} loading="lazy" decoding="async" />
            <span className="adversary-tile-level">
              Lv {adversary.minLevel}–{adversary.maxLevel}
            </span>
          </button>
        )
      })}
      {enlarged && <CardViewer src={enlarged.src} alt={enlarged.alt} onClose={() => setEnlarged(null)} />}
    </div>
  )
}
