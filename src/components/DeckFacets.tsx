import type { DeckComposition } from '../domain/deckComposition'
import type { DeckUnit } from './DeckUpset'

/** deck-dashboard #09/#03: the secondary facets — fast/slow tempo and cost distribution —
 * alongside elements, so a player can weigh tempo and affordability, not just elements (PRD user
 * story 17). Speed carries the official fast/slow icons (public/elements, mirrored from the wiki)
 * and their colours; `unit` comes from the tab so these numbers agree with the UpSet's. Takes the
 * whole composition, like `DeckUpset`, rather than its fields separately — they always travel
 * together from the one call site. */
export function DeckFacets({ composition, unit }: { composition: DeckComposition; unit: DeckUnit }) {
  const { deckSize, speedSplit, costDistribution } = composition
  const costMax = Math.max(1, ...costDistribution.map((b) => b.count))
  const fmt = (n: number) => (unit === 'percent' ? `${deckSize === 0 ? 0 : Math.round((n / deckSize) * 100)}%` : String(n))

  return (
    <div className="dashboard-facets">
      <div className="dashboard-facet">
        <h4>Speed</h4>
        <div className="dashboard-speed-row">
          <span className="dashboard-speed-item">
            <img className="dashboard-speed-icon" src={`${import.meta.env.BASE_URL}elements/fast.png`} alt="Fast" title="Fast" />
            {fmt(speedSplit.fast)}
          </span>
          <div className="dashboard-facet-bar">
            <span className="dashboard-facet-fast" style={{ width: `${deckSize === 0 ? 0 : (speedSplit.fast / deckSize) * 100}%` }} />
            <span className="dashboard-facet-slow" style={{ width: `${deckSize === 0 ? 0 : (speedSplit.slow / deckSize) * 100}%` }} />
          </div>
          <span className="dashboard-speed-item">
            <img className="dashboard-speed-icon" src={`${import.meta.env.BASE_URL}elements/slow.png`} alt="Slow" title="Slow" />
            {fmt(speedSplit.slow)}
          </span>
        </div>
      </div>
      <div className="dashboard-facet">
        <h4>Cost</h4>
        <div className="dashboard-cost-bars">
          {costDistribution.map(({ cost, count }) => (
            <div className="dashboard-cost-row" key={cost}>
              <span className="dashboard-cost-label">{cost}</span>
              <span className="deck-element-track">
                <span className="deck-element-fill" style={{ width: `${(count / costMax) * 100}%` }} />
              </span>
              <span className="deck-element-count">{fmt(count)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
