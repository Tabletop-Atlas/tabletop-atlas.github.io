import type { DeckComposition } from '../domain/deckComposition'
import { thresholdAnnotationsFor, thresholdElements, type SpiritInnateThresholds } from '../domain/innateThresholds'
import { ElementIcon } from './DeckUpset'

/**
 * deck-dashboard #14/#16: per-element exact odds of at least 1 / 2 / 3 cards carrying that element
 * in the segment's next `drawCount` draws — one row per canonical element, count and percentage
 * together so a player never has to divide by hand. Full-pool, nothing-drawn, like the rest of
 * the Dashboard. With `thresholds` (a picked spirit), rows the spirit's innate(s) actually
 * reference get an annotation naming what that innate wants; every other row is untouched. When
 * that spirit has an aspect that changes its innate(s) (#16), a caption states the thresholds
 * shown are the base spirit's — #15 only transcribed base panels, so the aspect's own numbers
 * aren't available to show instead.
 */
export function DeckGapOdds({ composition, thresholds }: { composition: DeckComposition; thresholds?: SpiritInnateThresholds }) {
  const annotatedElements = thresholds ? thresholdElements(thresholds) : undefined
  return (
    <div className="dashboard-gap-odds">
      <h3>Element-gap odds</h3>
      <p className="dashboard-assumption">
        Odds the next {composition.drawCount} draws include at least this many of each element — full deck, nothing drawn.
      </p>
      {thresholds?.aspectModifiesInnates && (
        <p className="dashboard-assumption dashboard-gap-odds-caption">
          Thresholds shown are the base spirit's — this aspect changes its innate(s).
        </p>
      )}
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
          {composition.elements.map((stat) => {
            const annotations = thresholds && annotatedElements?.has(stat.element) ? thresholdAnnotationsFor(stat.element, thresholds) : []
            return (
              <tr key={stat.element}>
                <th scope="row" className="dashboard-gap-odds-elrow">
                  <ElementIcon element={stat.element} />
                  {stat.element}
                  {annotations.length > 0 && (
                    <span className="dashboard-gap-odds-annotation">
                      {annotations.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </span>
                  )}
                </th>
                <td>
                  {stat.count} ({Math.round(stat.share * 100)}%)
                </td>
                {stat.gapOdds.map((odds, i) => (
                  <td key={i}>{Math.round(odds * 100)}%</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
