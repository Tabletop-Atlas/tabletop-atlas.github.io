import { BLIGHT_TAGS, EVENT_CLASSES, FEAR_TAGS, type BlightTag, type EventClass, type FearTag } from '../domain/types'
import type { OtherCardFilterState } from '../domain/otherCardFilter'

const FEAR_TAG_LABEL: Record<FearTag, string> = {
  removal: 'Removal',
  defensive: 'Defensive',
  weaken: 'Weaken',
  disruption: 'Disruption',
  displacement: 'Displacement',
}

const BLIGHT_TAG_LABEL: Record<BlightTag, string> = {
  presenceLoss: 'Presence loss',
  boardChange: 'Board change',
  damageBonus: 'Damage bonus',
  resourceSwing: 'Resource swing',
}

const EVENT_CLASS_LABEL: Record<EventClass, string> = {
  choice: 'Choice',
  stage: 'Stage',
  terrorLevel: 'Terror level',
  healthyBlightedLand: 'Healthy/blighted land',
  adversary: 'Adversary',
}

type Segment = 'Fear' | 'Events' | 'Blight'

/** v4 #13: the fear/event/blight filter bar — only the controls their fields can support
 * (expansion, sub-type). No elements/cost/speed controls, since #01 found these cards don't carry
 * those fields; `OtherCardFilterState` has no fields for them, so there is nothing to wire up. No
 * kind control (v5 #01) — the segmented switch above already picks the kind.
 *
 * The sub-type control itself differs per segment (v5 #02/#03: "a fear bucket is not a blight
 * bucket") - fear and blight get a multi-select of their own tag set plus an explicit
 * "Unclassified" option; events get a single-select of their one upstream class. */
export function OtherCardFilters({
  segment,
  filter,
  onChange,
  expansions,
}: {
  segment: Segment
  filter: OtherCardFilterState
  onChange: (filter: OtherCardFilterState) => void
  expansions: string[]
}) {
  const isCleared =
    !filter.expansion && !filter.eventClass && !filter.fearTags?.length && !filter.blightTags?.length

  function toggleFearTag(tag: FearTag | 'unclassified') {
    const has = filter.fearTags?.includes(tag) ?? false
    onChange({ ...filter, fearTags: has ? filter.fearTags!.filter((t) => t !== tag) : [...(filter.fearTags ?? []), tag] })
  }

  function toggleBlightTag(tag: BlightTag | 'unclassified') {
    const has = filter.blightTags?.includes(tag) ?? false
    onChange({ ...filter, blightTags: has ? filter.blightTags!.filter((t) => t !== tag) : [...(filter.blightTags ?? []), tag] })
  }

  return (
    <div className="card-filters">
      {segment === 'Fear' && (
        <div className="card-filters-row">
          <span className="card-filters-label">Sub-type</span>
          <div className="card-filters-kinds">
            {FEAR_TAGS.map((tag) => (
              <button key={tag} type="button" aria-pressed={filter.fearTags?.includes(tag) ?? false} onClick={() => toggleFearTag(tag)}>
                {FEAR_TAG_LABEL[tag]}
              </button>
            ))}
            <button type="button" aria-pressed={filter.fearTags?.includes('unclassified') ?? false} onClick={() => toggleFearTag('unclassified')}>
              Unclassified
            </button>
          </div>
        </div>
      )}

      {segment === 'Blight' && (
        <div className="card-filters-row">
          <span className="card-filters-label">Sub-type (judgment - see #02)</span>
          <div className="card-filters-kinds">
            {BLIGHT_TAGS.map((tag) => (
              <button key={tag} type="button" aria-pressed={filter.blightTags?.includes(tag) ?? false} onClick={() => toggleBlightTag(tag)}>
                {BLIGHT_TAG_LABEL[tag]}
              </button>
            ))}
            <button type="button" aria-pressed={filter.blightTags?.includes('unclassified') ?? false} onClick={() => toggleBlightTag('unclassified')}>
              Unclassified
            </button>
          </div>
        </div>
      )}

      {segment === 'Events' && (
        <div className="card-filters-row filters">
          <label>
            Class
            <select
              value={filter.eventClass ?? ''}
              onChange={(e) => onChange({ ...filter, eventClass: (e.target.value || undefined) as EventClass | undefined })}
            >
              <option value="">Any</option>
              {EVENT_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {EVENT_CLASS_LABEL[cls]}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

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
