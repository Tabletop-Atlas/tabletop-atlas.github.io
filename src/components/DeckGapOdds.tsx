import type { DeckComposition } from '../domain/deckComposition'
import { ElementIcon } from './DeckUpset'

/**
 * deck-dashboard #14: per-element exact odds of at least 1 / 2 / 3 cards carrying that element in
 * the segment's next `drawCount` draws — one row per canonical element, count and percentage
 * together so a player never has to divide by hand. Full-pool, nothing-drawn, like the rest of
 * the Dashboard; no spirit awareness here (that's #16's annotation ticket).
 */
export function DeckGapOdds({ composition }: { composition: DeckComposition }) {
  return (
    <div className="dashboard-gap-odds">
      <h3>Element-gap odds</h3>
      <p className="dashboard-assumption">
        Odds the next {composition.drawCount} draws include at least this many of each element — full deck, nothing drawn.
      </p>
      <table className="dashboard-gap-odds-table">
        <thead>
          <tr>
            <th scope="col">Element</th>
            <th scope="col">In deck</th>
            <th scope="col">≥1</th>
            <th scope="col">≥2</th>
            <th scope="col">≥3</th>
          </tr>
        </thead>
        <tbody>
          {composition.elements.map((stat) => (
            <tr key={stat.element}>
              <th scope="row" className="dashboard-gap-odds-elrow">
                <ElementIcon element={stat.element} />
                {stat.element}
              </th>
              <td>
                {stat.count} ({Math.round(stat.share * 100)}%)
              </td>
              {stat.gapOdds.map((odds, i) => (
                <td key={i}>{Math.round(odds * 100)}%</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
