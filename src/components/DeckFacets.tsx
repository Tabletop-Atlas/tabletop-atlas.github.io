import type { DeckComposition } from '../domain/deckComposition'

/** v6 #09: the secondary facets — fast/slow tempo and cost distribution — alongside elements, so
 * a player can weigh tempo and affordability, not just elements (PRD user story 17). Takes the
 * whole composition, like `DeckElementBars`, rather than its two fields separately — they always
 * travel together from the one call site. */
export function DeckFacets({ composition }: { composition: DeckComposition }) {
  const { speedSplit, costDistribution } = composition
  const speedTotal = speedSplit.fast + speedSplit.slow
  const costMax = Math.max(1, ...costDistribution.map((b) => b.count))

  return (
    <div className="dashboard-facets">
      <div className="dashboard-facet">
        <h4>Speed</h4>
        <div className="dashboard-facet-bar">
          <span className="dashboard-facet-fast" style={{ width: `${speedTotal === 0 ? 0 : (speedSplit.fast / speedTotal) * 100}%` }} />
          <span className="dashboard-facet-slow" style={{ width: `${speedTotal === 0 ? 0 : (speedSplit.slow / speedTotal) * 100}%` }} />
        </div>
        <p className="dashboard-facet-legend">
          {speedSplit.fast} Fast · {speedSplit.slow} Slow
        </p>
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
              <span className="deck-element-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
