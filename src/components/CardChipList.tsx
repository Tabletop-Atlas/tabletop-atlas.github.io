import { useState } from 'react'
import { CardViewer } from './CardViewer'

export interface CardChipItem {
  name: string
  image: string
}

/**
 * deck-dashboard #19: the click-to-drill chip list — every stat tile and bucket×group bar
 * segment expands exactly this, with a clear button (click-again on the same selection
 * collapses it, owned by the caller's toggle state). Chips carry a rating-colored left edge;
 * hover floats the real card image, click/tap opens the shared `CardViewer` enlarge (the touch
 * path relies on the same click). Shared by the Event segment (#20) for its own valence chips.
 */
export function CardChipList({
  title,
  cards,
  colorFor,
  onClear,
}: {
  title: string
  cards: CardChipItem[]
  colorFor: (card: CardChipItem) => string
  onClear: () => void
}) {
  const [hovered, setHovered] = useState<{ card: CardChipItem; x: number; y: number } | null>(null)
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  const base = import.meta.env.BASE_URL

  return (
    <div className="rating-chip-drill">
      <div className="rating-chip-drill-head">
        <span>{title}</span>
        <button type="button" className="rating-chip-clear" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="rating-chip-wall">
        {cards.map((card) => (
          <button
            key={card.name}
            type="button"
            className="rating-chip"
            style={{ borderLeftColor: colorFor(card) }}
            onMouseEnter={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              setHovered({ card, x: r.left, y: r.bottom })
            }}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setEnlarged({ src: `${base}${card.image}`, alt: card.name })}
          >
            {card.name}
          </button>
        ))}
      </div>
      {hovered && !enlarged && (
        <img
          className="rating-chip-preview"
          src={`${base}${hovered.card.image}`}
          alt=""
          style={{ left: Math.min(hovered.x, window.innerWidth - 260), top: hovered.y }}
        />
      )}
      {enlarged && <CardViewer src={enlarged.src} alt={enlarged.alt} onClose={() => setEnlarged(null)} />}
    </div>
  )
}
