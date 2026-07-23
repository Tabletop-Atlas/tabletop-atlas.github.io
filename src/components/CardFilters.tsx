import { ELEMENTS, type Element, type PowerCard } from '../domain/types'
import type { PowerCardFilterState } from '../domain/powerCardFilter'

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

const KINDS: PowerCard['kind'][] = ['minor', 'major', 'unique']
const COST_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/** v4 #12: the Powers filter bar. Elements are AND (a floor — a selected set must all be
 * present, called out in the label so the semantics are legible, not buried per #03/#12's own
 * acceptance criteria) and compose with every other control by AND; kinds are OR among
 * themselves since a card is only ever one kind. */
export function CardFilters({
  filter,
  onChange,
  expansions,
}: {
  filter: PowerCardFilterState
  onChange: (filter: PowerCardFilterState) => void
  expansions: string[]
}) {
  const base = import.meta.env.BASE_URL
  // maxCost === 0 (Cost ≤ 0) is a real selection, so test for `undefined`, not falsiness —
  // otherwise Clear greys out while the More-filters badge still counts it.
  const isCleared =
    filter.elements.length === 0 && filter.kinds.length === 0 && filter.maxCost === undefined && !filter.speed && !filter.expansion

  function toggleElement(el: Element) {
    const has = filter.elements.includes(el)
    onChange({ ...filter, elements: has ? filter.elements.filter((e) => e !== el) : [...filter.elements, el] })
  }

  function toggleKind(kind: PowerCard['kind']) {
    const has = filter.kinds.includes(kind)
    onChange({ ...filter, kinds: has ? filter.kinds.filter((k) => k !== kind) : [...filter.kinds, kind] })
  }

  function toggleSpeed(speed: PowerCard['speed']) {
    onChange({ ...filter, speed: filter.speed === speed ? undefined : speed })
  }

  // Cost/Speed/Expansion fold behind "More filters"; the badge keeps a set-but-hidden filter
  // visible. maxCost can legitimately be 0 (Cost ≤ 0), so test for `undefined`, not falsiness.
  const advancedCount =
    (filter.maxCost !== undefined ? 1 : 0) + (filter.speed ? 1 : 0) + (filter.expansion ? 1 : 0)

  return (
    <div className="card-filters">
      <div className="card-filters-row">
        <span className="card-filters-label">Elements (must have all selected)</span>
        <div className="card-filters-elements">
          {ELEMENTS.map((el) => (
            <button
              key={el}
              type="button"
              className="card-filters-element"
              aria-pressed={filter.elements.includes(el)}
              onClick={() => toggleElement(el)}
            >
              <img src={`${base}elements/${ELEMENT_ICON[el]}.webp`} alt={el} />
            </button>
          ))}
        </div>
      </div>

      <div className="card-filters-row">
        <span className="card-filters-label">Type</span>
        <div className="card-filters-kinds">
          {KINDS.map((kind) => (
            <button key={kind} type="button" aria-pressed={filter.kinds.includes(kind)} onClick={() => toggleKind(kind)}>
              {kind}
            </button>
          ))}
        </div>
      </div>

      <details className="card-filters-more">
        <summary>
          More filters
          {advancedCount > 0 && <span className="card-filters-badge">{advancedCount}</span>}
        </summary>
        <div className="card-filters-row filters">
          <label>
            Cost ≤
            <select
              value={filter.maxCost ?? ''}
              onChange={(e) => onChange({ ...filter, maxCost: e.target.value === '' ? undefined : Number(e.target.value) })}
            >
              <option value="">Any</option>
              {COST_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div className="card-filters-speed">
            <span className="card-filters-label">Speed</span>
            {(['Fast', 'Slow'] as const).map((speed) => (
              <button
                key={speed}
                type="button"
                className="card-filters-element"
                aria-pressed={filter.speed === speed}
                aria-label={speed}
                title={speed}
                onClick={() => toggleSpeed(speed)}
              >
                <img src={`${base}elements/${speed.toLowerCase()}.png`} alt={speed} />
              </button>
            ))}
          </div>
          <label>
            Expansion
            <select value={filter.expansion ?? ''} onChange={(e) => onChange({ ...filter, expansion: e.target.value || undefined })}>
              <option value="">Any</option>
              {expansions.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </label>
        </div>
      </details>

      <button type="button" className="card-filters-clear" disabled={isCleared} onClick={() => onChange({ elements: [], kinds: [] })}>
        Clear filters
      </button>
    </div>
  )
}
