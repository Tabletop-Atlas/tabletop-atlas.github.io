import type { ElementCombinationGroup } from '../domain/deckComposition'
import { ELEMENTS, type Element } from '../domain/types'

/** v6 #09/#10: an UpSet-style dot-matrix, hand-rolled — one row per exact element set (already
 * sorted by frequency by the domain module), one column per canonical element, a dot marking
 * membership. "No element" is just another row whose every dot is off — every card in the deck
 * lands in exactly one row, so the view accounts for all of them (PRD user story 14).
 * `highlightElements` (the optional spirit pick's own recorded elements) marks those columns. */
export function DeckCombinationMatrix({ combinations, highlightElements }: { combinations: ElementCombinationGroup[]; highlightElements?: ReadonlySet<Element> }) {
  return (
    <div className="deck-combo-matrix">
      <div className="deck-combo-row deck-combo-header">
        <span className="deck-combo-label" />
        {ELEMENTS.map((element) => (
          <span key={element} className={highlightElements?.has(element) ? 'deck-combo-col-label deck-combo-col-label-highlight' : 'deck-combo-col-label'} title={element}>
            {element[0]}
          </span>
        ))}
        <span className="deck-combo-count">Count</span>
      </div>
      {combinations.map((group) => (
        <div className="deck-combo-row" key={group.label}>
          <span className="deck-combo-label">{group.label}</span>
          {ELEMENTS.map((element) => (
            <span
              key={element}
              className={[
                'deck-combo-dot',
                group.elements.includes(element) && 'deck-combo-dot-on',
                highlightElements?.has(element) && 'deck-combo-dot-highlight',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
          <span className="deck-combo-count">{group.count}</span>
        </div>
      ))}
    </div>
  )
}
