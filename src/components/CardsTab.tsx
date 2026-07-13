import { useMemo, useState } from 'react'
import { ADVERSARIES } from '../domain/adversaries'
import otherCardsData from '../data/other-cards.json'
import powerCardsData from '../data/power-cards.json'
import { EMPTY_OTHER_CARD_FILTER, filterOtherCards, type OtherCardFilterState } from '../domain/otherCardFilter'
import { groupPowerCards, sortPowerCards, type PowerGroup, type PowerSort } from '../domain/powerCardArrange'
import { EMPTY_POWER_CARD_FILTER, filterPowerCards, type PowerCardFilterState } from '../domain/powerCardFilter'
import { SCENARIOS } from '../domain/scenarios'
import type { OtherCard, PowerCard } from '../domain/types'
import { AdversaryGrid } from './AdversaryGrid'
import { AdversaryRows } from './AdversaryRows'
import { CardFilters } from './CardFilters'
import { CardGrid } from './CardGrid'
import { CardRows } from './CardRows'
import { OtherCardFilters } from './OtherCardFilters'
import { OtherCardRows } from './OtherCardRows'
import { ScenarioDifficultyGrid } from '../prototypes/scenario-difficulty/ScenarioDifficultyGrid'
import { ScenarioRows } from './ScenarioRows'

const powerCards = powerCardsData as PowerCard[]
const otherCards = otherCardsData as OtherCard[]
const POWER_EXPANSIONS = [...new Set(powerCards.map((c) => c.expansion))].sort()
const ADVERSARY_EXPANSIONS = [...new Set(ADVERSARIES.map((a) => a.expansion))].sort()

const SEGMENTS = ['Powers', 'Fear', 'Events', 'Blight', 'Adversaries', 'Scenarios'] as const
type Segment = (typeof SEGMENTS)[number]

const OTHER_KIND_BY_SEGMENT: Record<'Fear' | 'Events' | 'Blight', OtherCard['kind']> = {
  Fear: 'fear',
  Events: 'event',
  Blight: 'blight',
}

const SEGMENT_LABEL: Record<Segment, string> = {
  Powers: 'power cards',
  Fear: 'fear cards',
  Events: 'event cards',
  Blight: 'blight cards',
  Adversaries: 'adversaries',
  Scenarios: 'scenarios',
}

function isOtherSegment(segment: Segment): segment is 'Fear' | 'Events' | 'Blight' {
  return segment === 'Fear' || segment === 'Events' || segment === 'Blight'
}

type View = 'grid' | 'rows'

/** v4 #11/#12/#13, v5 #05a/#05b: the Archive — all 471 cards plus the 8 adversaries and 16
 * scenarios, filterable per #03's spec. A segmented switch swaps the control set rather than
 * showing dead controls for fields a segment doesn't have (#01 found fear/event/blight carry no
 * elements/cost/speed; #05b found scenarios carry no expansion at all). Both v4 #04 result shapes
 * ship within each segment, switchable, per #04's "not on this map" for a detail view. */
export function CardsTab() {
  const [segment, setSegment] = useState<Segment>('Powers')
  const [view, setView] = useState<View>('grid')
  const [powerFilter, setPowerFilter] = useState<PowerCardFilterState>(EMPTY_POWER_CARD_FILTER)
  const [powerSort, setPowerSort] = useState<PowerSort>('none')
  const [powerGroup, setPowerGroup] = useState<PowerGroup>('none')
  const [otherFilter, setOtherFilter] = useState<OtherCardFilterState>(EMPTY_OTHER_CARD_FILTER)
  const [adversaryExpansion, setAdversaryExpansion] = useState<string>('')

  // phase-4 #19: the Powers pipeline is filter → sort → group; the locked call keeps every other
  // segment's ordering untouched (their data can't support more).
  const shownPowerCards = useMemo(() => sortPowerCards(filterPowerCards(powerCards, powerFilter), powerSort), [powerFilter, powerSort])
  const powerGroups = useMemo(
    () => (powerGroup === 'none' ? null : groupPowerCards(shownPowerCards, powerGroup)),
    [shownPowerCards, powerGroup],
  )

  const segmentOtherCards = useMemo(
    () => (isOtherSegment(segment) ? otherCards.filter((c) => c.kind === OTHER_KIND_BY_SEGMENT[segment]) : []),
    [segment],
  )
  const otherExpansions = useMemo(() => [...new Set(segmentOtherCards.map((c) => c.expansion))].sort(), [segmentOtherCards])
  const shownOtherCards = useMemo(() => filterOtherCards(segmentOtherCards, otherFilter), [segmentOtherCards, otherFilter])

  const shownAdversaries = useMemo(
    () => (adversaryExpansion ? ADVERSARIES.filter((a) => a.expansion === adversaryExpansion) : ADVERSARIES),
    [adversaryExpansion],
  )

  function selectSegment(next: Segment) {
    setSegment(next)
    setOtherFilter(EMPTY_OTHER_CARD_FILTER)
    setAdversaryExpansion('')
  }

  // Only Powers/Fear/Events/Blight share the {name, image} shape CardGrid/CardRows take -
  // Adversaries and Scenarios render through their own components below, so this stays narrowly
  // typed as PowerCard[] | OtherCard[] rather than widening to a union that needs an unsafe cast.
  const shownCards = segment === 'Powers' ? shownPowerCards : shownOtherCards
  const shownCount =
    segment === 'Powers' ? shownPowerCards.length : isOtherSegment(segment) ? shownOtherCards.length : segment === 'Adversaries' ? shownAdversaries.length : SCENARIOS.length
  const total =
    segment === 'Powers' ? powerCards.length : isOtherSegment(segment) ? segmentOtherCards.length : segment === 'Adversaries' ? ADVERSARIES.length : SCENARIOS.length

  return (
    <section>
      <h2>Archive</h2>
      <div className="card-view-switch" role="group" aria-label="Card type">
        {SEGMENTS.map((s) => (
          <button key={s} type="button" aria-pressed={segment === s} onClick={() => selectSegment(s)}>
            {s}
          </button>
        ))}
      </div>

      {segment === 'Powers' && (
        <>
          <CardFilters filter={powerFilter} onChange={setPowerFilter} expansions={POWER_EXPANSIONS} />
          <div className="card-filters-row filters">
            <label>
              Sort
              <select value={powerSort} onChange={(e) => setPowerSort(e.target.value as PowerSort)}>
                <option value="none">Deck order</option>
                <option value="cost-asc">Cost (low → high)</option>
                <option value="cost-desc">Cost (high → low)</option>
              </select>
            </label>
            <label>
              Group by
              <select value={powerGroup} onChange={(e) => setPowerGroup(e.target.value as PowerGroup)}>
                <option value="none">No grouping</option>
                <option value="cost">Cost</option>
                <option value="speed">Speed</option>
                <option value="element">Element</option>
              </select>
            </label>
          </div>
        </>
      )}
      {isOtherSegment(segment) && (
        <OtherCardFilters segment={segment} filter={otherFilter} onChange={setOtherFilter} expansions={otherExpansions} />
      )}
      {segment === 'Adversaries' && (
        <div className="card-filters">
          <div className="card-filters-row filters">
            <label>
              Expansion
              <select value={adversaryExpansion} onChange={(e) => setAdversaryExpansion(e.target.value)}>
                <option value="">Any</option>
                {ADVERSARY_EXPANSIONS.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" disabled={!adversaryExpansion} onClick={() => setAdversaryExpansion('')}>
              Clear filters
            </button>
          </div>
        </div>
      )}

      <div className="card-view-switch" role="group" aria-label="Card view">
        <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
          Grid
        </button>
        <button type="button" aria-pressed={view === 'rows'} onClick={() => setView('rows')}>
          Rows
        </button>
      </div>
      <p>
        {shownCount} of {total} {SEGMENT_LABEL[segment]}
      </p>
      {segment === 'Adversaries' ? (
        view === 'grid' ? (
          <AdversaryGrid adversaries={shownAdversaries} />
        ) : (
          <AdversaryRows adversaries={shownAdversaries} />
        )
      ) : segment === 'Scenarios' ? (
        view === 'grid' ? (
          // phase-4 #20 variant round (awaiting the owner's pick): plain CardGrid unless
          // ?variant= is set. Reverts to <CardGrid cards={SCENARIOS} /> when the round closes.
          <ScenarioDifficultyGrid />
        ) : (
          <ScenarioRows scenarios={SCENARIOS} />
        )
      ) : segment === 'Powers' && powerGroups ? (
        powerGroups.map((group) => (
          <section key={group.label} className="card-group">
            <h3>{group.label}</h3>
            {view === 'grid' ? <CardGrid cards={group.cards} /> : <CardRows cards={group.cards} />}
          </section>
        ))
      ) : view === 'grid' ? (
        <CardGrid cards={shownCards} />
      ) : segment === 'Powers' ? (
        <CardRows cards={shownPowerCards} />
      ) : (
        <OtherCardRows cards={shownOtherCards} />
      )}
    </section>
  )
}
