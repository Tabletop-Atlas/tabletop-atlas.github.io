import { useState } from 'react'
import type { Valence } from '../domain/types'
import { classValenceBreakdown, valenceBreakdown, type EventCard } from '../domain/valenceBreakdown'
import { CardChipList } from './CardChipList'
import { pct, RatingStackedBar } from './RatingStackedBar'
import { Term } from './Term'

/** Diverging poles, owner-ratified at PRD-2/#04 — harmful warm-orange / beneficial cool-blue
 * (never red/green), with a neutral grey mixed since the accent green fails CVD separation
 * against the warm pole (PRD-2 user story 15). */
const VALENCE_COLOR: Record<Valence, string> = { harmful: '#d97742', mixed: '#8a8a8a', beneficial: '#4f9ad4' }

const VALENCE_LABEL: Record<Valence, string> = { harmful: 'Harmful', mixed: 'Mixed', beneficial: 'Beneficial' }

/** A stat tile picks a whole valence; a class-row segment picks that valence within one event
 * class — `eventClass: null` distinguishes the two, same convention as Fear's `Picked` (#19). */
export interface Picked {
  valence: Valence
  eventClass: string | null
}

/**
 * deck-dashboard #20: the Event segment's variant-D view — headline stat tiles, a 100%-stacked
 * valence bar, the by-class facet as mini stacked bars, and click-to-drill chips, all driven by
 * the ratified `valence` data (#18). No by-expansion facet (owner's call from the prototype,
 * same as Fear).
 */
/** `initialPicked` mirrors `FearImpactView`'s escape hatch for the server-rendered smoke test. */
export function EventValenceView({ cards, initialPicked }: { cards: EventCard[]; initialPicked?: Picked }) {
  const [picked, setPicked] = useState<Picked | null>(initialPicked ?? null)

  const overall = valenceBreakdown(cards)
  const byClass = classValenceBreakdown(cards)

  function toggle(valence: Valence, eventClass: string | null) {
    setPicked((prev) => (prev && prev.valence === valence && prev.eventClass === eventClass ? null : { valence, eventClass }))
  }

  function cardsFor(valence: Valence, eventClass: string | null): EventCard[] {
    if (eventClass === null) return overall.find((b) => b.valence === valence)?.cards ?? []
    return byClass.find((g) => g.label === eventClass)?.byValence.find((b) => b.valence === valence)?.cards ?? []
  }

  const pickedCards = picked ? cardsFor(picked.valence, picked.eventClass) : []
  const pickedTitle = picked
    ? `${VALENCE_LABEL[picked.valence]}${picked.eventClass ? ` × ${picked.eventClass}` : ''} · ${pickedCards.length} cards (${pct(pickedCards.length, cards.length)})`
    : ''

  return (
    <div className="rating-view">
      <p className="dashboard-assumption">Percentages are this pool's share, not next-draw odds off the physical deck.</p>
      <div className="rating-tiles" role="group" aria-label="Event valence">
        {overall.map((bucket) => (
          <span
            key={bucket.valence}
            className="rating-tile"
            data-active={picked?.valence === bucket.valence && picked.eventClass === null}
          >
            <button
              type="button"
              className="rating-tile-pick"
              aria-pressed={picked?.valence === bucket.valence && picked.eventClass === null}
              onClick={() => toggle(bucket.valence, null)}
            >
              <span className="rating-tile-dot" style={{ background: VALENCE_COLOR[bucket.valence] }} />
              <span className="rating-tile-pct">{pct(bucket.cards.length, cards.length)}</span>
              <span className="rating-tile-count">({bucket.cards.length})</span>
            </button>
            <Term id={`valence-${bucket.valence}`} className="rating-tile-label">
              {VALENCE_LABEL[bucket.valence]}
            </Term>
          </span>
        ))}
      </div>

      <RatingStackedBar
        segments={overall.map((b) => ({ key: b.valence, label: VALENCE_LABEL[b.valence], count: b.cards.length, color: VALENCE_COLOR[b.valence] }))}
        total={cards.length}
      />

      {picked && picked.eventClass === null && (
        <CardChipList title={pickedTitle} cards={pickedCards} colorFor={() => VALENCE_COLOR[picked.valence]} onClear={() => setPicked(null)} />
      )}

      <h3>By event class</h3>
      <div className="rating-tag-breakdown">
        {byClass.map((group) => (
          <div key={group.label} className="rating-tag-row">
            <div className="deck-pool-row">
              <span className="deck-pool-label">
                <Term id={group.subtype ? `event-class-${group.subtype}` : 'event-class-unclassified'}>{group.label}</Term>
              </span>
              <RatingStackedBar
                segments={group.byValence.map((b) => ({ key: b.valence, label: VALENCE_LABEL[b.valence], count: b.cards.length, color: VALENCE_COLOR[b.valence] }))}
                total={group.cards.length}
                onSegmentClick={(key) => toggle(key as Valence, group.label)}
                activeKey={picked?.eventClass === group.label ? picked.valence : undefined}
              />
              <span className="deck-element-count">
                {group.cards.length} ({pct(group.cards.length, cards.length)})
              </span>
            </div>
            {picked && picked.eventClass === group.label && (
              <CardChipList title={pickedTitle} cards={pickedCards} colorFor={() => VALENCE_COLOR[picked.valence]} onClear={() => setPicked(null)} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
