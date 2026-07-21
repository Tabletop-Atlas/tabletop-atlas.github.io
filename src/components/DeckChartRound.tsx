import { useMemo, useState } from 'react'
import type { DeckComposition, ElementCombinationGroup } from '../domain/deckComposition'
import { ELEMENTS, type Element } from '../domain/types'

/**
 * ROUND 03 (deck-dashboard) — THROWAWAY variant scaffolding, delete on ship.
 *
 * Three chart-vocabulary candidates for the Minor/Major power-deck view, gated on
 * `?deckchart=A|B|C` (the `?theme=`/`?side=` pattern: namespaced param, floating switcher,
 * byte-identical app without the param). The baseline (no param) is the shipped stack —
 * element bars + dot-matrix + facets. The ticket's question
 * (.scratch/deck-dashboard/issues/03-power-deck-chart-vocabulary.md): is UpSet the right
 * vocabulary, or do simpler forms serve the at-the-table question better?
 *
 * - A — odds-first table: one dense table, elements sorted by draw-N odds descending, plus a
 *   plain-text "top pairings" list. The no-chart candidate — is a number column all the table
 *   ever needed?
 * - B — classic UpSet: combination counts as vertical columns over a dot matrix (combos as
 *   columns, elements as rows), element totals as left-anchored bars. The full-vocabulary
 *   candidate the owner originally named.
 * - C — pair heat grid: an 8×8 element co-occurrence triangle (diagonal = element totals),
 *   odds chips above. Answers "chance of a card advancing two of my thresholds at once"
 *   head-on, without UpSet's row explosion.
 *
 * All three derive from the same `DeckComposition` — no domain changes, per the map ("the
 * domain seam's outputs are fixed by the spec"; refinements change components only).
 *
 * Deleting the round = this file + its `deck.css` block (search "ROUND 03") + the
 * `readDeckChartVariant`/`DeckChartVariantView`/`DeckChartVariantSwitcher` references in
 * `DashboardTab.tsx`. Winner folds back as a rewrite of the shipped components.
 */
export type DeckChartVariant = 'A' | 'B' | 'C'

const VARIANTS: DeckChartVariant[] = ['A', 'B', 'C']

const LABEL: Record<DeckChartVariant, string> = {
  A: 'odds-first table',
  B: 'classic UpSet',
  C: 'pair heat grid',
}

export function readDeckChartVariant(): DeckChartVariant | null {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get('deckchart')
  return v === 'A' || v === 'B' || v === 'C' ? v : null
}

export function DeckChartVariantSwitcher({ current, onPick }: { current: DeckChartVariant; onPick: (v: DeckChartVariant) => void }) {
  function go(v: DeckChartVariant) {
    const params = new URLSearchParams(window.location.search)
    params.set('deckchart', v)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    onPick(v)
  }

  return (
    <div className="variant-switcher" role="group" aria-label="Deck chart variant">
      <span className="variant-switcher-tag">ROUND 03 · {LABEL[current]}</span>
      <div className="variant-switcher-buttons">
        {VARIANTS.map((v) => (
          <button key={v} type="button" aria-pressed={v === current} data-active={v === current} onClick={() => go(v)}>
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

function isHighlighted(element: Element, highlight?: ReadonlySet<Element>): boolean {
  return highlight?.has(element) ?? false
}

/* ---------------------------------- A — odds-first table ---------------------------------- */

function topPairings(combinations: ElementCombinationGroup[], limit: number): { label: string; count: number }[] {
  const pairCounts = new Map<string, number>()
  for (const group of combinations) {
    for (let i = 0; i < group.elements.length; i++) {
      for (let j = i + 1; j < group.elements.length; j++) {
        const key = `${group.elements[i]} + ${group.elements[j]}`
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + group.count)
      }
    }
  }
  return [...pairCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function VariantA({ composition, highlightElements }: { composition: DeckComposition; highlightElements?: ReadonlySet<Element> }) {
  const rows = useMemo(() => [...composition.elements].sort((a, b) => b.probability - a.probability), [composition])
  const pairs = useMemo(() => topPairings(composition.combinations, 6), [composition])

  return (
    <div className="deckchart-a">
      <table className="deckchart-a-table">
        <thead>
          <tr>
            <th>Element</th>
            <th>Cards</th>
            <th>Share</th>
            <th>≥1 in {composition.drawCount}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ element, count, share, probability }) => (
            <tr key={element} className={isHighlighted(element, highlightElements) ? 'deckchart-a-highlight' : undefined}>
              <td>{element}</td>
              <td>{count}</td>
              <td>{Math.round(share * 100)}%</td>
              <td className="deckchart-a-odds">{Math.round(probability * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="deckchart-a-pairs">
        <h4>Top pairings</h4>
        {pairs.length === 0 ? (
          <p className="deckchart-muted">No multi-element cards in this set.</p>
        ) : (
          <ol>
            {pairs.map(({ label, count }) => (
              <li key={label}>
                {label} <span className="deckchart-muted">· {count} cards</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

/* ----------------------------------- B — classic UpSet ------------------------------------ */

/** Same names the Cards tab's `CardFilters`/`CardRows` use for `public/elements/*.webp`. */
const ELEMENT_ICON: Record<Element, string> = {
  Sun: 'sun',
  Moon: 'moon',
  Fire: 'fire',
  Air: 'air',
  Water: 'water',
  Earth: 'earth',
  Plant: 'plant',
  Animal: 'animal',
}

function ElementIcon({ element }: { element: Element }) {
  return <img className="deckchart-b-elicon" src={`${import.meta.env.BASE_URL}elements/${ELEMENT_ICON[element]}.webp`} alt={element} title={element} />
}

/** Bar colours matched to the element icons' own art (owner: moon whitish, fire orange-red, …).
 * Styling judgment only — near `PlaceholderArt`'s map but tuned to the icon set. */
const ELEMENT_BAR_COLOR: Record<Element, string> = {
  Sun: '#e8b923',
  Moon: '#cdd2e4',
  Fire: '#d4502e',
  Air: '#a7c7e7',
  Water: '#3a7ca5',
  Earth: '#8a5a3b',
  Plant: '#4c8c4a',
  Animal: '#a53232',
}

/** Set-size palette, round 3 (owner: sets of ≤2, 3, 4, 5 each get their own colour — 1-element
 * sets barely exist, so they share ≤2's). Size 0 is the "No element" set, kept dim. */
function setSizeClass(size: number): string {
  if (size === 0) return 'deckchart-b-size0'
  if (size <= 2) return 'deckchart-b-size2'
  if (size === 3) return 'deckchart-b-size3'
  if (size === 4) return 'deckchart-b-size4'
  return 'deckchart-b-size5'
}

type SetSizeBucket = '≤2' | '3' | '4' | '5+'
type RowSort = 'count' | 'alpha'
type Unit = 'count' | 'percent'

/** ROUND 03 follow-up rounds (owner picked B, then asked for): element icons instead of words,
 * set-size colour coding (1 / 2 / 3+), pill-styled filters, element-row sort (count/alphabetical),
 * and a set-size filter alongside must-include / min-cards / top-N. All prototype-grade. */
function VariantB({ composition, highlightElements }: { composition: DeckComposition; highlightElements?: ReadonlySet<Element> }) {
  const [mustInclude, setMustInclude] = useState<Set<Element>>(new Set())
  const [sizeBuckets, setSizeBuckets] = useState<Set<SetSizeBucket>>(new Set())
  const [minCount, setMinCount] = useState(1)
  const [topN, setTopN] = useState(20)
  const [rowSort, setRowSort] = useState<RowSort>('count')
  const [unit, setUnit] = useState<Unit>('count')

  function toggleElement(element: Element) {
    setMustInclude((prev) => {
      const next = new Set(prev)
      if (next.has(element)) next.delete(element)
      else next.add(element)
      return next
    })
  }

  function toggleSizeBucket(bucket: SetSizeBucket) {
    setSizeBuckets((prev) => {
      const next = new Set(prev)
      if (next.has(bucket)) next.delete(bucket)
      else next.add(bucket)
      return next
    })
  }

  function inSizeBuckets(size: number): boolean {
    if (sizeBuckets.size === 0) return true
    return sizeBuckets.has(size >= 5 ? '5+' : size === 4 ? '4' : size === 3 ? '3' : '≤2')
  }

  const fmt = (n: number, of: number) => (unit === 'percent' ? `${of === 0 ? 0 : Math.round((n / of) * 100)}%` : String(n))

  const allCombos = composition.combinations
  const combos = allCombos
    .filter((g) => g.count >= minCount && inSizeBuckets(g.elements.length) && [...mustInclude].every((e) => g.elements.includes(e)))
    .slice(0, topN)
  const shownCards = combos.reduce((sum, g) => sum + g.count, 0)
  const comboMax = Math.max(1, ...combos.map((g) => g.count))
  const totalMax = Math.max(1, ...composition.elements.map((e) => e.count))
  const countFor = (element: Element) => composition.elements.find((e) => e.element === element)?.count ?? 0
  const rows =
    rowSort === 'alpha'
      ? [...ELEMENTS].sort((a, b) => a.localeCompare(b))
      : [...ELEMENTS].sort((a, b) => countFor(b) - countFor(a))

  return (
    <div className="deckchart-b">
      <div className="deckchart-b-filters">
        <span className="deckchart-b-filterlabel">Must include</span>
        {ELEMENTS.map((element) => (
          <button
            key={element}
            type="button"
            className="deckchart-b-elchip"
            aria-pressed={mustInclude.has(element)}
            data-active={mustInclude.has(element)}
            onClick={() => toggleElement(element)}
          >
            <ElementIcon element={element} />
          </button>
        ))}
        <span className="deckchart-b-filterlabel">Elements per set</span>
        {(['≤2', '3', '4', '5+'] as const).map((bucket) => (
          <button
            key={bucket}
            type="button"
            className={`deckchart-b-sizechip ${setSizeClass(bucket === '5+' ? 5 : bucket === '≤2' ? 2 : Number(bucket))}`}
            aria-pressed={sizeBuckets.has(bucket)}
            data-active={sizeBuckets.has(bucket)}
            onClick={() => toggleSizeBucket(bucket)}
          >
            {bucket}
          </button>
        ))}
      </div>
      <div className="deckchart-b-filters">
        <label className="deckchart-b-filterpill">
          Min cards
          <input type="number" min={1} max={99} value={minCount} onChange={(e) => setMinCount(Math.max(1, Number(e.target.value) || 1))} />
        </label>
        <label className="deckchart-b-filterpill">
          Top
          <input type="number" min={1} max={99} value={topN} onChange={(e) => setTopN(Math.max(1, Number(e.target.value) || 1))} />
        </label>
        <div className="deckchart-b-sort" role="group" aria-label="Sort elements">
          <button type="button" data-active={rowSort === 'count'} onClick={() => setRowSort('count')}>
            By count
          </button>
          <button type="button" data-active={rowSort === 'alpha'} onClick={() => setRowSort('alpha')}>
            A–Z
          </button>
        </div>
        <div className="deckchart-b-sort" role="group" aria-label="Counts or percentages">
          <button type="button" data-active={unit === 'count'} onClick={() => setUnit('count')}>
            Counts
          </button>
          <button type="button" data-active={unit === 'percent'} onClick={() => setUnit('percent')}>
            %
          </button>
        </div>
      </div>
      <p className="deckchart-muted">
        Showing {combos.length} of {allCombos.length} element sets ({shownCards} of {composition.deckSize} cards).
      </p>
      <div className="deckchart-b-panel">
        <div className="deckchart-b-scroll">
          <div className="deckchart-b-grid" style={{ ['--combos' as string]: combos.length }}>
          {/* top-left corner is empty; column chart spans the combo columns */}
          <div className="deckchart-b-corner" />
          {combos.map((g) => (
            <div key={g.label} className="deckchart-b-colbar" title={`${g.label}: ${g.count}`}>
              <span className="deckchart-b-colcount">{g.count}</span>
              <span className={`deckchart-b-colfill ${setSizeClass(g.elements.length)}`} style={{ height: `${(g.count / comboMax) * 100}%` }} />
            </div>
          ))}
          {rows.map((element) => (
            <div key={element} className="deckchart-b-rowgroup">
              <div className={isHighlighted(element, highlightElements) ? 'deckchart-b-rowlabel deckchart-b-rowlabel-highlight' : 'deckchart-b-rowlabel'}>
                <ElementIcon element={element} />
                <span className="deckchart-b-totaltrack">
                  <span
                    className="deckchart-b-totalfill"
                    style={{ width: `${(countFor(element) / totalMax) * 100}%`, background: ELEMENT_BAR_COLOR[element] }}
                  />
                </span>
                <span className="deckchart-b-totalcount">{fmt(countFor(element), composition.deckSize)}</span>
              </div>
              {combos.map((g) => (
                <span
                  key={g.label}
                  className={[
                    'deckchart-b-dot',
                    g.elements.includes(element) && `deckchart-b-dot-on ${setSizeClass(g.elements.length)}`,
                    isHighlighted(element, highlightElements) && 'deckchart-b-dot-highlight',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              ))}
            </div>
          ))}
          </div>
        </div>
      </div>
      <p className="deckchart-muted">
        Columns are exact element sets, tallest first — <span className="deckchart-b-legend deckchart-b-size2">≤2 elements</span>,{' '}
        <span className="deckchart-b-legend deckchart-b-size3">3</span>, <span className="deckchart-b-legend deckchart-b-size4">4</span>,{' '}
        <span className="deckchart-b-legend deckchart-b-size5">5+</span>; left bars are each element's deck total.
      </p>

      <h3>Facets</h3>
      <div className="dashboard-facets">
        <div className="dashboard-facet">
          <h4>Speed</h4>
          <div className="deckchart-b-speedrow">
            <span className="deckchart-b-speeditem">
              <img className="deckchart-b-speedicon" src={`${import.meta.env.BASE_URL}elements/fast.png`} alt="Fast" title="Fast" />
              {fmt(composition.speedSplit.fast, composition.deckSize)}
            </span>
            <div className="dashboard-facet-bar">
              <span
                className="deckchart-b-speedfast"
                style={{ width: `${composition.deckSize === 0 ? 0 : (composition.speedSplit.fast / composition.deckSize) * 100}%` }}
              />
              <span
                className="deckchart-b-speedslow"
                style={{ width: `${composition.deckSize === 0 ? 0 : (composition.speedSplit.slow / composition.deckSize) * 100}%` }}
              />
            </div>
            <span className="deckchart-b-speeditem">
              <img className="deckchart-b-speedicon" src={`${import.meta.env.BASE_URL}elements/slow.png`} alt="Slow" title="Slow" />
              {fmt(composition.speedSplit.slow, composition.deckSize)}
            </span>
          </div>
        </div>
        <div className="dashboard-facet">
          <h4>Cost</h4>
          <div className="dashboard-cost-bars">
            {composition.costDistribution.map(({ cost, count }) => (
              <div className="dashboard-cost-row" key={cost}>
                <span className="dashboard-cost-label">{cost}</span>
                <span className="deck-element-track">
                  <span
                    className="deck-element-fill"
                    style={{ width: `${(count / Math.max(1, ...composition.costDistribution.map((b) => b.count))) * 100}%` }}
                  />
                </span>
                <span className="deck-element-count">{fmt(count, composition.deckSize)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------- C — pair heat grid ------------------------------------ */

function VariantC({ composition, highlightElements }: { composition: DeckComposition; highlightElements?: ReadonlySet<Element> }) {
  const pairCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const g of composition.combinations) {
      for (let i = 0; i < g.elements.length; i++) {
        for (let j = i + 1; j < g.elements.length; j++) {
          const key = `${g.elements[i]}|${g.elements[j]}`
          m.set(key, (m.get(key) ?? 0) + g.count)
        }
      }
    }
    return m
  }, [composition])

  const cellMax = Math.max(1, ...pairCount.values())
  const countFor = (element: Element) => composition.elements.find((e) => e.element === element)?.count ?? 0
  const cell = (row: Element, col: Element) => pairCount.get(`${row}|${col}`) ?? pairCount.get(`${col}|${row}`) ?? 0

  return (
    <div className="deckchart-c">
      <div className="deckchart-c-chips">
        {composition.elements.map(({ element, probability }) => (
          <span key={element} className={isHighlighted(element, highlightElements) ? 'deckchart-c-chip deckchart-c-chip-highlight' : 'deckchart-c-chip'}>
            {element} {Math.round(probability * 100)}%
          </span>
        ))}
      </div>
      <p className="deckchart-muted">Chance of ≥1 in {composition.drawCount} draws, per element.</p>
      <div className="deckchart-c-scroll">
        <table className="deckchart-c-grid">
          <thead>
            <tr>
              <th />
              {ELEMENTS.map((col) => (
                <th key={col} className={isHighlighted(col, highlightElements) ? 'deckchart-c-head-highlight' : undefined} title={col}>
                  {col[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ELEMENTS.map((row, ri) => (
              <tr key={row}>
                <th className={isHighlighted(row, highlightElements) ? 'deckchart-c-head-highlight' : undefined}>{row}</th>
                {ELEMENTS.map((col, ci) => {
                  if (ci < ri) return <td key={col} className="deckchart-c-blank" />
                  if (ci === ri)
                    return (
                      <td key={col} className="deckchart-c-diag" title={`${row}: ${countFor(row)} cards total`}>
                        {countFor(row)}
                      </td>
                    )
                  const n = cell(row, col)
                  return (
                    <td
                      key={col}
                      className="deckchart-c-cell"
                      style={{ ['--heat' as string]: n / cellMax }}
                      title={`${row} + ${col}: ${n} cards`}
                    >
                      {n > 0 ? n : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="deckchart-muted">Off-diagonal cells: cards carrying both elements. Diagonal: the element's deck total.</p>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */

export function DeckChartVariantView({
  variant,
  composition,
  highlightElements,
}: {
  variant: DeckChartVariant
  composition: DeckComposition
  highlightElements?: ReadonlySet<Element>
}) {
  if (variant === 'A') return <VariantA composition={composition} highlightElements={highlightElements} />
  if (variant === 'B') return <VariantB composition={composition} highlightElements={highlightElements} />
  return <VariantC composition={composition} highlightElements={highlightElements} />
}
