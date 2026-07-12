import type { OtherCardFilterState } from '../domain/otherCardFilter'

/** v4 #13: the fear/event/blight filter bar — only the controls their fields can support
 * (expansion). No elements/cost/speed controls, since #01 found these cards don't carry those
 * fields; `OtherCardFilterState` has no fields for them, so there is nothing to wire up. No kind
 * control either (v5 #01) — the segmented switch above already picks the kind. */
export function OtherCardFilters({
  filter,
  onChange,
  expansions,
}: {
  filter: OtherCardFilterState
  onChange: (filter: OtherCardFilterState) => void
  expansions: string[]
}) {
  const isCleared = !filter.expansion

  return (
    <div className="card-filters">
      <div className="card-filters-row filters">
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
        <button type="button" disabled={isCleared} onClick={() => onChange({})}>
          Clear filters
        </button>
      </div>
    </div>
  )
}
