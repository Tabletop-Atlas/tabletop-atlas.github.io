import { useState } from 'react'
import { tierStore } from '../domain/tierStore'
import type { Spirit } from '../domain/types'
import { OcfduRadar } from './OcfduRadar'
import { PlaceholderArt } from './PlaceholderArt'
import { SpiritArt } from './SpiritArt'

const ARROW: Record<string, string> = { up: '↑ more complex', down: '↓ simpler', same: '→ same complexity' }

/** An image at a conventional path, falling back to the spirit's placeholder tile on a missing
 * file or load failure - #12's hard requirement that 259 assets need not all arrive at once. */
function DetailImage({
  spirit,
  src,
  alt,
  className,
}: {
  spirit: Spirit
  src: string
  alt: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return <PlaceholderArt spirit={spirit} className={className} />
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

/**
 * Everything the app already holds about a spirit, plus its panel and starting-card images
 * (#12) once #11 has sourced them. No rules text is transcribed - growth options, presence
 * tracks, innate powers and card effects are legible on the images themselves, not turned into
 * fields. An aspect configuration has no images of its own; it shows the base spirit's panel
 * and cards (the repo has no data on which aspects change which cards) plus its own `delta`.
 */
export function SpiritDetail({ spirit, onClose }: { spirit: Spirit; onClose: () => void }) {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  const tier = tierStore.getTier(spirit.id)
  const activeList = tierStore.getActiveList()
  const base = import.meta.env.BASE_URL

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal spirit-detail" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={spirit.name}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="spirit-detail-head">
          <SpiritArt spirit={spirit} />
          <div>
            <h2>{spirit.name}</h2>
            <p className="meta">
              {spirit.expansion} · {spirit.complexity}
            </p>
            <p className="meta">
              Tier ({activeList.name}): {tier ?? 'not rated by this list'}
            </p>
          </div>
        </div>

        <p>{spirit.summary}</p>

        <div className="spirit-detail-body">
          <OcfduRadar ratings={spirit.ratings} />
          {spirit.ratingsSource === 'estimate' && (
            <p className="meta">
              These OCFDU ratings are an estimate — nobody has verified them against a printed source.
            </p>
          )}
        </div>

        <h3>Panel</h3>
        <div className="spirit-detail-panels">
          {[
            { src: `${base}panels/${spirit.id}-front.webp`, alt: `${spirit.name} panel front` },
            { src: `${base}panels/${spirit.id}-back.webp`, alt: `${spirit.name} panel back` },
          ].map(({ src, alt }) => (
            <button key={src} type="button" className="spirit-detail-panel" onClick={() => setEnlarged({ src, alt })}>
              <DetailImage spirit={spirit} src={src} alt={alt} />
            </button>
          ))}
        </div>

        {spirit.startingCards && (
          <>
            <h3>Starting cards</h3>
            <ul className="spirit-detail-cards">
              {spirit.startingCards.map((cardName, i) => {
                const src = `${base}cards/${spirit.id}-${i}.webp`
                return (
                  <li key={cardName}>
                    <button
                      type="button"
                      className="spirit-detail-card"
                      onClick={() => setEnlarged({ src, alt: cardName })}
                    >
                      <DetailImage spirit={spirit} src={src} alt={cardName} />
                      <span className="spirit-detail-card-name">{cardName}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {spirit.aspects.length > 0 && (
          <>
            <h3>Aspects</h3>
            <ul className="aspects">
              {spirit.aspects.map((aspect) => (
                <li key={aspect.name}>
                  <strong>{aspect.name}</strong>
                  {aspect.complexityDelta && <span className="meta"> · {ARROW[aspect.complexityDelta]}</span>}
                  {' — '}
                  {aspect.delta ?? <em className="meta">effect not transcribed yet</em>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {enlarged && (
        <div
          className="card-enlarge-backdrop"
          onClick={(e) => {
            e.stopPropagation()
            setEnlarged(null)
          }}
        >
          <img src={enlarged.src} alt={enlarged.alt} />
        </div>
      )}
    </div>
  )
}
