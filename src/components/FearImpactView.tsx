import { useState } from 'react'
import { impactBreakdown, tagImpactBreakdown, type FearCard } from '../domain/impactBreakdown'
import type { Impact } from '../domain/types'
import { CardChipList } from './CardChipList'
import { pct, RatingStackedBar } from './RatingStackedBar'
import { Term } from './Term'

/** Sequential green ramp (light→dark, magnitude not polarity) — owner-ratified at #04, one hue
 * so "more" reads as "stronger", never a different category (PRD-2 user story 16). The middle
 * step is the app's own `--deck-accent`. */
const IMPACT_COLOR: Record<Impact, string> = { 1: '#8fd7ab', 2: '#3fae6a', 3: '#1f6b3e' }

/** A stat tile picks a whole impact level; a tag-row segment picks that level within one tag —
 * `tag: null` distinguishes the two so the chip list and its title can tell them apart. */
export interface Picked {
  impact: Impact
  tag: string | null
}

/**
 * deck-dashboard #19: the Fear segment's variant-D view — headline stat tiles, a 100%-stacked
 * impact bar, the by-tag facet as mini stacked bars, and click-to-drill chips, all driven by the
 * ratified `impact` data (#18). No by-expansion facet (owner's call from the prototype).
 */
/** `initialPicked` mirrors `DashboardTab`'s `initialSegment` — lets the server-rendered smoke
 * test reach a drilled state without simulating a click. */
export function FearImpactView({ cards, initialPicked }: { cards: FearCard[]; initialPicked?: Picked }) {
  const [picked, setPicked] = useState<Picked | null>(initialPicked ?? null)

  const overall = impactBreakdown(cards)
  const byTag = tagImpactBreakdown(cards)

  function toggle(impact: Impact, tag: string | null) {
    setPicked((prev) => (prev && prev.impact === impact && prev.tag === tag ? null : { impact, tag }))
  }

  function cardsFor(impact: Impact, tag: string | null): FearCard[] {
    if (tag === null) return overall.find((b) => b.impact === impact)?.cards ?? []
    return byTag.find((g) => g.label === tag)?.byImpact.find((b) => b.impact === impact)?.cards ?? []
  }

  const pickedCards = picked ? cardsFor(picked.impact, picked.tag) : []
  const pickedLabel = picked ? overall.find((b) => b.impact === picked.impact)!.label : undefined
  const pickedTitle = picked
    ? `${pickedLabel}${picked.tag ? ` × ${picked.tag}` : ''} · ${pickedCards.length} cards (${pct(pickedCards.length, cards.length)})`
    : ''

  return (
    <div className="rating-view">
      <p className="dashboard-assumption">Percentages are this pool's share, not next-draw odds off the physical deck.</p>
      <div className="rating-tiles" role="group" aria-label="Fear impact">
        {overall.map((bucket) => (
          <span
            key={bucket.impact}
            className="rating-tile"
            data-active={picked?.impact === bucket.impact && picked.tag === null}
          >
            <button
              type="button"
              className="rating-tile-pick"
              aria-pressed={picked?.impact === bucket.impact && picked.tag === null}
              onClick={() => toggle(bucket.impact, null)}
            >
              <span className="rating-tile-dot" style={{ background: IMPACT_COLOR[bucket.impact] }} />
              <span className="rating-tile-pct">{pct(bucket.cards.length, cards.length)}</span>
              <span className="rating-tile-count">({bucket.cards.length})</span>
            </button>
            <Term id={`impact-${bucket.label}`} className="rating-tile-label">
              {bucket.label}
            </Term>
          </span>
        ))}
      </div>

      <RatingStackedBar
        segments={overall.map((b) => ({ key: String(b.impact), label: b.label, count: b.cards.length, color: IMPACT_COLOR[b.impact] }))}
        total={cards.length}
      />

      {picked && picked.tag === null && (
        <CardChipList title={pickedTitle} cards={pickedCards} colorFor={() => IMPACT_COLOR[picked.impact]} onClear={() => setPicked(null)} />
      )}

      <h3>By fear tag</h3>
      <div className="rating-tag-breakdown">
        {byTag.map((group) => (
          <div key={group.label} className="rating-tag-row">
            <div className="deck-pool-row">
              <span className="deck-pool-label">
                <Term id={group.subtype ? `fear-tag-${group.subtype}` : 'fear-tag-unclassified'}>{group.label}</Term>
              </span>
              <RatingStackedBar
                segments={group.byImpact.map((b) => ({ key: String(b.impact), label: b.label, count: b.cards.length, color: IMPACT_COLOR[b.impact] }))}
                total={group.cards.length}
                onSegmentClick={(key) => toggle(Number(key) as Impact, group.label)}
                activeKey={picked?.tag === group.label ? String(picked.impact) : undefined}
              />
              <span className="deck-element-count">
                {group.cards.length} ({pct(group.cards.length, cards.length)})
              </span>
            </div>
            {picked && picked.tag === group.label && (
              <CardChipList title={pickedTitle} cards={pickedCards} colorFor={() => IMPACT_COLOR[picked.impact]} onClear={() => setPicked(null)} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
