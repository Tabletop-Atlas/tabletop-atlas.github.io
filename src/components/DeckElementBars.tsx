import type { DeckComposition } from '../domain/deckComposition'
import type { Element } from '../domain/types'

/** v6 #06/#07/#10: horizontal per-element bars, hand-rolled CSS fill in `OcfduBars`' style —
 * width scales to each element's share of the deck, so a zero-count element still renders as an
 * empty, labelled row (PRD user story 15: absence reads as a fact, not a missing row). Each row
 * also carries its draw-odds figure — the chance of seeing the element at least once among the
 * composition's (already-clamped) draw count, from a full, untouched deck. `highlightElements`
 * (the optional spirit pick's own recorded elements) marks the rows that spirit cares about. */
export function DeckElementBars({ composition, highlightElements }: { composition: DeckComposition; highlightElements?: ReadonlySet<Element> }) {
  return (
    <div className="deck-element-bars">
      {composition.elements.map(({ element, count, share, probability }) => (
        <div className={highlightElements?.has(element) ? 'deck-element-row deck-element-row-highlight' : 'deck-element-row'} key={element}>
          <span className="deck-element-label">{element}</span>
          <span className="deck-element-track">
            <span className="deck-element-fill" style={{ width: `${Math.min(100, share * 100)}%` }} />
          </span>
          <span className="deck-element-count">{count}</span>
          <span className="deck-element-odds">{Math.round(probability * 100)}%</span>
        </div>
      ))}
    </div>
  )
}
