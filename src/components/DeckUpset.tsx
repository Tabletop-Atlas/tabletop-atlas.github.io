import { useState } from 'react'
import type { DeckComposition } from '../domain/deckComposition'
import { ELEMENTS, type Element } from '../domain/types'

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

/** Bar colours matched to the element icons' own art (deck-dashboard #03: the owner asked the
 * totals to read in the icon's colour — Moon whitish, Fire orange-red, …). Styling judgment
 * only, near `PlaceholderArt`'s map but tuned to the icon set. */
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

export function ElementIcon({ element }: { element: Element }) {
  return <img className="deck-upset-elicon" src={`${import.meta.env.BASE_URL}elements/${ELEMENT_ICON[element]}.webp`} alt={element} title={element} />
}

/** Set-size palette (deck-dashboard #03: sets of ≤2, 3, 4 and 5+ elements each get their own
 * colour — 1-element sets barely exist, so they share ≤2's). Size 0 is "No element", kept dim. */
function setSizeClass(size: number): string {
  if (size === 0) return 'deck-upset-size0'
  if (size <= 2) return 'deck-upset-size2'
  if (size === 3) return 'deck-upset-size3'
  if (size === 4) return 'deck-upset-size4'
  return 'deck-upset-size5'
}

const SIZE_BUCKETS = ['≤2', '3', '4', '5+'] as const
type SetSizeBucket = (typeof SIZE_BUCKETS)[number]
type RowSort = 'count' | 'alpha'
export type DeckUnit = 'count' | 'percent'

function bucketOf(size: number): SetSizeBucket {
  return size >= 5 ? '5+' : size === 4 ? '4' : size === 3 ? '3' : '≤2'
}

/**
 * deck-dashboard #03 (owner picked prototype B, "classic UpSet", after four feedback rounds):
 * the Minor/Major deck view. Combination counts as columns over a dot matrix, element totals as
 * icon-labelled bars in the element's own colour, each carrying its draw-odds figure (PRD user
 * story 10 — the odds survived the redesign). Columns and dots colour-code by set size. The
 * filter row narrows the columns — must-include elements (AND), elements-per-set buckets, a
 * min-cards threshold and a top-N cap — with a visible "showing X of Y" line so a narrowed view
 * never masquerades as the whole deck. Rows sort by count or A–Z; `unit` (lifted to the tab so
 * the facets agree) swaps counts for percentages. All filter state is session-only component
 * state, like the rest of the Dashboard (PRD user story 28).
 */
export function DeckUpset({
  composition,
  highlightElements,
  unit,
  onUnitChange,
}: {
  composition: DeckComposition
  highlightElements?: ReadonlySet<Element>
  unit: DeckUnit
  onUnitChange: (unit: DeckUnit) => void
}) {
  const [mustInclude, setMustInclude] = useState<Set<Element>>(new Set())
  const [sizeBuckets, setSizeBuckets] = useState<Set<SetSizeBucket>>(new Set())
  const [minCount, setMinCount] = useState(1)
  const [topN, setTopN] = useState(20)
  const [rowSort, setRowSort] = useState<RowSort>('count')

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

  const fmt = (n: number, of: number) => (unit === 'percent' ? `${of === 0 ? 0 : Math.round((n / of) * 100)}%` : String(n))

  const allCombos = composition.combinations
  const combos = allCombos
    .filter(
      (g) =>
        g.count >= minCount &&
        (sizeBuckets.size === 0 || sizeBuckets.has(bucketOf(g.elements.length))) &&
        [...mustInclude].every((e) => g.elements.includes(e)),
    )
    .slice(0, topN)
  const shownCards = combos.reduce((sum, g) => sum + g.count, 0)
  const comboMax = Math.max(1, ...combos.map((g) => g.count))
  const totalMax = Math.max(1, ...composition.elements.map((e) => e.count))
  const statFor = (element: Element) => composition.elements.find((e) => e.element === element)
  const rows =
    rowSort === 'alpha'
      ? [...ELEMENTS].sort((a, b) => a.localeCompare(b))
      : [...ELEMENTS].sort((a, b) => (statFor(b)?.count ?? 0) - (statFor(a)?.count ?? 0))

  return (
    <div className="deck-upset">
      <div className="deck-upset-filters">
        <span className="deck-upset-filterlabel">Must include</span>
        {ELEMENTS.map((element) => (
          <button
            key={element}
            type="button"
            className="deck-upset-elchip"
            aria-pressed={mustInclude.has(element)}
            data-active={mustInclude.has(element)}
            onClick={() => toggleElement(element)}
          >
            <ElementIcon element={element} />
          </button>
        ))}
        <span className="deck-upset-filterlabel">Elements per set</span>
        {SIZE_BUCKETS.map((bucket) => (
          <button
            key={bucket}
            type="button"
            className={`deck-upset-sizechip ${setSizeClass(bucket === '5+' ? 5 : bucket === '≤2' ? 2 : Number(bucket))}`}
            aria-pressed={sizeBuckets.has(bucket)}
            data-active={sizeBuckets.has(bucket)}
            onClick={() => toggleSizeBucket(bucket)}
          >
            {bucket}
          </button>
        ))}
      </div>
      <div className="deck-upset-filters">
        <label className="dashboard-pill">
          Min cards
          <input type="number" min={1} max={99} value={minCount} onChange={(e) => setMinCount(Math.max(1, Number(e.target.value) || 1))} />
        </label>
        <label className="dashboard-pill">
          Top
          <input type="number" min={1} max={99} value={topN} onChange={(e) => setTopN(Math.max(1, Number(e.target.value) || 1))} />
        </label>
        <div className="deck-upset-toggle" role="group" aria-label="Sort elements">
          <button type="button" data-active={rowSort === 'count'} onClick={() => setRowSort('count')}>
            By count
          </button>
          <button type="button" data-active={rowSort === 'alpha'} onClick={() => setRowSort('alpha')}>
            A–Z
          </button>
        </div>
        <div className="deck-upset-toggle" role="group" aria-label="Counts or percentages">
          <button type="button" data-active={unit === 'count'} onClick={() => onUnitChange('count')}>
            Counts
          </button>
          <button type="button" data-active={unit === 'percent'} onClick={() => onUnitChange('percent')}>
            %
          </button>
        </div>
      </div>
      <p className="deck-upset-muted">
        Showing {combos.length} of {allCombos.length} element sets ({shownCards} of {composition.deckSize} cards).
      </p>
      <div className="deck-upset-panel">
        <div className="deck-upset-scroll">
          <div className="deck-upset-grid" style={{ ['--combos' as string]: combos.length }}>
            {/* top-left corner is empty; the column chart spans the combo columns */}
            <div className="deck-upset-corner" />
            {combos.map((g) => (
              <div key={g.label} className="deck-upset-colbar" title={`${g.label}: ${g.count}`}>
                <span className="deck-upset-colcount">{g.count}</span>
                <span className={`deck-upset-colfill ${setSizeClass(g.elements.length)}`} style={{ height: `${(g.count / comboMax) * 100}%` }} />
              </div>
            ))}
            {rows.map((element) => {
              const stat = statFor(element)
              return (
                <div key={element} className="deck-upset-rowgroup">
                  <div
                    className={
                      highlightElements?.has(element) ? 'deck-upset-rowlabel deck-upset-rowlabel-highlight' : 'deck-upset-rowlabel'
                    }
                  >
                    <ElementIcon element={element} />
                    <span className="deck-upset-totaltrack">
                      <span
                        className="deck-upset-totalfill"
                        style={{ width: `${((stat?.count ?? 0) / totalMax) * 100}%`, background: ELEMENT_BAR_COLOR[element] }}
                      />
                    </span>
                    <span className="deck-upset-totalcount">{fmt(stat?.count ?? 0, composition.deckSize)}</span>
                    <span className="deck-upset-odds">{Math.round((stat?.probability ?? 0) * 100)}%</span>
                  </div>
                  {combos.map((g) => (
                    <span
                      key={g.label}
                      className={[
                        'deck-upset-dot',
                        g.elements.includes(element) && `deck-upset-dot-on ${setSizeClass(g.elements.length)}`,
                        highlightElements?.has(element) && 'deck-upset-dot-highlight',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <p className="deck-upset-muted">
        Columns are exact element sets, tallest first — <span className="deck-upset-legend deck-upset-size2">≤2 elements</span>,{' '}
        <span className="deck-upset-legend deck-upset-size3">3</span>, <span className="deck-upset-legend deck-upset-size4">4</span>,{' '}
        <span className="deck-upset-legend deck-upset-size5">5+</span>; left bars are each element's deck total, with its chance of ≥1 in{' '}
        {composition.drawCount} draws.
      </p>
    </div>
  )
}
