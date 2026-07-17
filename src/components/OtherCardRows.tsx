import { useState } from 'react'
import type { BlightTag, EventClass, FearTag, OtherCard } from '../domain/types'
import { CardViewer } from './CardViewer'
import { readWarmChipVariant } from './ChipRound'
import { expansionColorFor, subtypeColor, subtypeLabel } from './tagColors'

/** legibility-pass #04: the subtype tags/class each card kind carries — fear/blight are 0..n
 * (a card may match several keyword buckets, or none), events are exactly one (the upstream
 * `eventClass`, wrapped so all three kinds render through the same list). */
function subtypesFor(card: OtherCard): (FearTag | BlightTag | EventClass)[] {
  if (card.kind === 'event') return [card.eventClass]
  return card.tags
}

/** Owner picked variant A (filled pill, the `CardRows` kind/speed idiom) after a three-way round. */
function SubtypeChips({ tags, chipVariant }: { tags: (FearTag | BlightTag | EventClass)[]; chipVariant?: 'warm' }) {
  if (tags.length === 0) {
    return <span className="card-row-subtype-empty">Unclassified</span>
  }
  return (
    <span className="card-row-subtypes">
      {tags.map((tag) => (
        <span key={tag} className="subtype-chip" style={{ background: subtypeColor(tag, chipVariant) }}>
          {subtypeLabel(tag)}
        </span>
      ))}
    </span>
  )
}

/** Compact-rows view for fear/event/blight (v4 #13) — the same shape as CardRows, but without
 * elements/cost/speed columns, since #01 found these types don't carry those fields.
 *
 * legibility-pass #05: owner picked variant C (solid chip) for the expansion column.
 * legibility-pass #04: fear/event keep their kind label and gain a subtype badge; blight's kind
 * label was uniform across every blight card (no information) and is replaced outright by its
 * subtype tags — the owner's specific ask. Blight's tags are `tagsSource: 'judgment'`
 * (types.ts) — the row-level note below carries that provenance once, not per chip. */
export function OtherCardRows({ cards }: { cards: OtherCard[] }) {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  const base = import.meta.env.BASE_URL
  const chipVariant = readWarmChipVariant()

  return (
    <ul className="card-rows">
      {cards.map((card) => {
        const color = expansionColorFor(card.expansion, chipVariant)
        return (
          <li key={card.name}>
            <button type="button" className="card-row" onClick={() => setEnlarged({ src: `${base}${card.image}`, alt: card.name })}>
              {card.kind !== 'blight' && (
                <span className="card-row-type" data-kind={card.kind}>
                  {card.kind}
                </span>
              )}
              <span className="card-row-name">{card.name}</span>
              <SubtypeChips tags={subtypesFor(card)} chipVariant={chipVariant} />
              {card.kind === 'blight' && <span className="card-row-subtype-note meta">judgment</span>}
              <span
                className={color ? 'card-row-expansion expansion-chip' : 'card-row-expansion'}
                style={color ? { background: color } : undefined}
              >
                {card.expansion}
              </span>
            </button>
          </li>
        )
      })}
      {enlarged && <CardViewer src={enlarged.src} alt={enlarged.alt} onClose={() => setEnlarged(null)} />}
    </ul>
  )
}
