import { useState } from 'react'
import type { PowerCard } from '../domain/types'
import { CardViewer } from './CardViewer'

/** Image-grid view of the Cards tab (v4 #04 variant A) — card art is how the owner recognises
 * cards. Lazy-loaded; tap enlarges via the shared CardViewer. */
export function CardGrid({ cards }: { cards: PowerCard[] }) {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  const base = import.meta.env.BASE_URL

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <button
          key={card.name}
          type="button"
          className="card-grid-tile"
          onClick={() => setEnlarged({ src: `${base}${card.image}`, alt: card.name })}
        >
          <img src={`${base}${card.image}`} alt={card.name} loading="lazy" decoding="async" />
        </button>
      ))}
      {enlarged && <CardViewer src={enlarged.src} alt={enlarged.alt} onClose={() => setEnlarged(null)} />}
    </div>
  )
}
