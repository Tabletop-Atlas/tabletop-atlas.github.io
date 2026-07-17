import { useState } from 'react'
import { CardViewer } from './CardViewer'

/** Image-grid view of the Cards tab (v4 #04 variant A) — card art is how the owner recognises
 * cards. Lazy-loaded; tap enlarges via the shared CardViewer. Only needs a name and an image, so
 * it works for power cards and fear/event/blight alike (v4 #13) without a second component.
 *
 * archive-grouping #01: the expansion chip lives in the rows view only — tiles show art, clean. */
export function CardGrid({ cards }: { cards: { name: string; image: string; expansion?: string }[] }) {
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
