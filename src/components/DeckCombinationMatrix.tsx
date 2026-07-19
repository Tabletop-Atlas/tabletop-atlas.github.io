import type { ElementCombinationGroup } from '../domain/deckComposition'
import { ELEMENTS } from '../domain/types'

/** v6 #09: an UpSet-style dot-matrix, hand-rolled — one row per exact element set (already
 * sorted by frequency by the domain module), one column per canonical element, a dot marking
 * membership. "No element" is just another row whose every dot is off — every card in the deck
 * lands in exactly one row, so the view accounts for all of them (PRD user story 14). */
export function DeckCombinationMatrix({ combinations }: { combinations: ElementCombinationGroup[] }) {
  return (
    <div className="deck-combo-matrix">
      <div className="deck-combo-row deck-combo-header">
        <span className="deck-combo-label" />
        {ELEMENTS.map((element) => (
          <span key={element} className="deck-combo-col-label" title={element}>
            {element[0]}
          </span>
        ))}
        <span className="deck-combo-count">Count</span>
      </div>
      {combinations.map((group) => (
        <div className="deck-combo-row" key={group.label}>
          <span className="deck-combo-label">{group.label}</span>
          {ELEMENTS.map((element) => (
            <span key={element} className={group.elements.includes(element) ? 'deck-combo-dot deck-combo-dot-on' : 'deck-combo-dot'} />
          ))}
          <span className="deck-combo-count">{group.count}</span>
        </div>
      ))}
    </div>
  )
}
