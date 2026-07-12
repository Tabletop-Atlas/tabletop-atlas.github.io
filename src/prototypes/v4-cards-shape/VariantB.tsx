import { useState } from 'react'
import { CardViewer } from '../../components/CardViewer'
import { PROTO_CARDS } from './fixture'

const ELEMENT_GLYPH: Record<string, string> = {
  Sun: '☀',
  Moon: '☾',
  Fire: '🔥',
  Air: '💨',
  Water: '💧',
  Earth: '⛰',
  Plant: '🌿',
  Animal: '🐾',
}

/** v4 #04 PROTOTYPE — Variant B: compact data rows that scan fast. Tap opens the art via the
 * same CardViewer SpiritDetail already uses - prior art, not rebuilt. Fear/event/blight have no
 * cost/speed/elements, so those columns render as a dash rather than empty space. */
export function VariantB() {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  const base = import.meta.env.BASE_URL

  return (
    <ul className="proto-b-list">
      {PROTO_CARDS.map((card) => (
        <li key={card.name}>
          <button type="button" className="proto-b-row" onClick={() => setEnlarged({ src: `${base}${card.image}`, alt: card.name })}>
            <span className="proto-b-type" data-type={card.type}>
              {card.type}
            </span>
            <span className="proto-b-name">
              {card.name}
              {card.spiritName && <span className="proto-b-spirit"> — {card.spiritName}</span>}
            </span>
            <span className="proto-b-elements">
              {card.elements ? card.elements.map((e) => <span key={e}>{ELEMENT_GLYPH[e] ?? e}</span>) : '—'}
            </span>
            <span className="proto-b-cost">{card.cost ?? '—'}</span>
            <span className="proto-b-speed">{card.speed ?? '—'}</span>
          </button>
        </li>
      ))}
      {enlarged && <CardViewer src={enlarged.src} alt={enlarged.alt} onClose={() => setEnlarged(null)} />}
    </ul>
  )
}
