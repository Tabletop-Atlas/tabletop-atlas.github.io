import { useState } from 'react'
import { CardViewer } from '../../components/CardViewer'
import { PROTO_CARDS } from './fixture'

/** v4 #04 PROTOTYPE — Variant A: lazy-loaded image grid. Tap enlarges. Filters (not built here -
 * this is a fixed 36-card sample) would be the only way to read a card's data; nothing here is
 * legible without opening it. */
export function VariantA() {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  const base = import.meta.env.BASE_URL

  return (
    <div className="proto-a-grid">
      {PROTO_CARDS.map((card) => (
        <button
          key={card.name}
          type="button"
          className="proto-a-tile"
          onClick={() => setEnlarged({ src: `${base}${card.image}`, alt: card.name })}
        >
          <img src={`${base}${card.image}`} alt={card.name} loading="lazy" decoding="async" />
        </button>
      ))}
      {enlarged && <CardViewer src={enlarged.src} alt={enlarged.alt} onClose={() => setEnlarged(null)} />}
    </div>
  )
}
