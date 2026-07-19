import type { DeckComposition } from '../domain/deckComposition'

/** v6 #06: horizontal per-element bars, hand-rolled CSS fill in `OcfduBars`' style — width scales
 * to each element's share of the deck, so a zero-count element still renders as an empty, labelled
 * row (PRD user story 15: absence reads as a fact, not a missing row). */
export function DeckElementBars({ composition }: { composition: DeckComposition }) {
  return (
    <div className="deck-element-bars">
      {composition.elements.map(({ element, count, share }) => (
        <div className="deck-element-row" key={element}>
          <span className="deck-element-label">{element}</span>
          <span className="deck-element-track">
            <span className="deck-element-fill" style={{ width: `${Math.min(100, share * 100)}%` }} />
          </span>
          <span className="deck-element-count">{count}</span>
        </div>
      ))}
    </div>
  )
}
