import { useRef, useState, type CSSProperties } from 'react'
import { toConfigId } from '../domain/configurations'
import { tierStore } from '../domain/tierStore'
import type { Spirit } from '../domain/types'
import { CardViewer } from './CardViewer'
import { OcfduBars } from './OcfduBars'
import { PlaceholderArt } from './PlaceholderArt'
import { SpiritArt } from './SpiritArt'
import { COMPLEXITY_LEVEL, EXPANSION_COLOR, PANEL_COLOR, tagColor, tagLabel } from './tagColors'
import { tierColor } from './tierColors'

/** panel-theming #03: the modal's one colour source, injected as CSS custom properties on the
 * modal root and consumed by the `.modal.spirit-detail` rules in deck.css. */
const PANEL_VARS = {
  '--panel-surface': PANEL_COLOR.surface,
  '--panel-raised': PANEL_COLOR.raised,
  '--panel-edge': PANEL_COLOR.edge,
  '--panel-text': PANEL_COLOR.text,
  '--panel-body': PANEL_COLOR.body,
  '--panel-accent': PANEL_COLOR.accent,
} as CSSProperties

/** Coloured tier chip for one configuration, read from the active configurations-list (#17).
 * Colour is the label's position in that list's own vocabulary; an absent key renders an
 * outlined "unrated" chip — honest absence, never a defaulted tier (ADR 0001). A label outside
 * the vocabulary (a stale override) also reads as unrated, the same rule `groupByTier` applies
 * on the board, so chip and board can never disagree. */
function TierChip({ configId }: { configId: string }) {
  const label = tierStore.getTier(configId)
  const position = label === undefined ? -1 : tierStore.getActiveList().tierLabels.indexOf(label)
  if (position === -1) return <span className="tier-chip tier-chip-unrated">unrated</span>
  return (
    <span className="tier-chip" style={{ backgroundColor: tierColor(position) }}>
      {label}
    </span>
  )
}

const ARROW: Record<string, string> = { up: '↑ more complex', down: '↓ simpler', same: '→ same complexity' }

/** Matches the slug asset-archive #03/#07 used when naming aspect card derivatives
 * (`public/aspects/<spiritId>-<slug>.webp`): lowercase, non-alphanumeric runs collapsed to `_`. */
function aspectSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

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
export function SpiritDetail({
  spirit,
  onClose,
  highlightAspect,
}: {
  spirit: Spirit
  onClose: () => void
  /** #17: opened from an aspect tile — scroll to the Aspects section with this row highlighted. */
  highlightAspect?: string
}) {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  // "Lands scrolled" is a one-time act: without this guard the inline callback ref re-fires on
  // every re-render (e.g. enlarging a card image) and snaps scroll back to the aspect row.
  const scrolledToAspect = useRef(false)
  const activeList = tierStore.getActiveList()
  const base = import.meta.env.BASE_URL
  const level = COMPLEXITY_LEVEL[spirit.complexity]
  const expansionColor = EXPANSION_COLOR[spirit.expansion]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal spirit-detail"
        style={PANEL_VARS}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={spirit.name}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="spirit-detail-head">
          <SpiritArt spirit={spirit} />
          <div>
            <h2>{spirit.name}</h2>
            <div className="spirit-tile-complexity" title={spirit.complexity}>
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={n <= level ? 'spirit-tile-dot spirit-tile-dot-filled' : 'spirit-tile-dot'} />
              ))}
              <span className="spirit-tile-complexity-label">{spirit.complexity}</span>
            </div>
            <div className="spirit-tile-chip-row">
              <span className="spirit-tile-chip" style={{ background: expansionColor }}>
                {spirit.expansion}
              </span>
            </div>
            {spirit.tags.length > 0 && (
              <div className="spirit-tile-chip-row spirit-tile-tags">
                {spirit.tags.map((tag) => (
                  <span
                    key={tag}
                    className="spirit-tile-tag-chip"
                    style={{ borderColor: tagColor(tag), color: tagColor(tag) }}
                  >
                    {tagLabel(tag)}
                  </span>
                ))}
              </div>
            )}
            <p className="meta spirit-detail-tier-line">
              Tier ({activeList.name}): <TierChip configId={spirit.id} />
            </p>
          </div>
        </div>

        <p>{spirit.summary}</p>

        <div className="spirit-detail-body">
          <OcfduBars ratings={spirit.ratings} elements={spirit.elements} />
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
            <ul className="aspects spirit-detail-aspects">
              {spirit.aspects.map((aspect) => {
                const src = `${base}aspects/${spirit.id}-${aspectSlug(aspect.name)}.webp`
                const highlighted = aspect.name === highlightAspect
                return (
                  <li
                    key={aspect.name}
                    className={highlighted ? 'aspect-row-highlight' : undefined}
                    ref={
                      highlighted
                        ? (el) => {
                            if (el && !scrolledToAspect.current) {
                              scrolledToAspect.current = true
                              el.scrollIntoView({ block: 'center' })
                            }
                          }
                        : undefined
                    }
                  >
                    <button
                      type="button"
                      className="spirit-detail-aspect-card"
                      onClick={() => setEnlarged({ src, alt: `${spirit.name} (${aspect.name})` })}
                    >
                      <DetailImage spirit={spirit} src={src} alt={`${spirit.name} (${aspect.name}) aspect card`} />
                    </button>
                    <div className="spirit-detail-aspect-text">
                      <TierChip configId={toConfigId(spirit.id, aspect.name)} /> <strong>{aspect.name}</strong>
                      {aspect.complexityDelta && <span className="meta"> · {ARROW[aspect.complexityDelta]}</span>}
                      {' — '}
                      {aspect.delta ?? <em className="meta">effect not transcribed yet</em>}
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>

      {enlarged && <CardViewer src={enlarged.src} alt={enlarged.alt} onClose={() => setEnlarged(null)} />}
    </div>
  )
}
