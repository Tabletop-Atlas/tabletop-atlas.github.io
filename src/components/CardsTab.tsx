import { useMemo, useState } from 'react'
import otherCardsData from '../data/other-cards.json'
import powerCardsData from '../data/power-cards.json'
import { EMPTY_OTHER_CARD_FILTER, filterOtherCards, type OtherCardFilterState } from '../domain/otherCardFilter'
import { EMPTY_POWER_CARD_FILTER, filterPowerCards, type PowerCardFilterState } from '../domain/powerCardFilter'
import type { OtherCard, PowerCard } from '../domain/types'
import { CardFilters } from './CardFilters'
import { CardGrid } from './CardGrid'
import { CardRows } from './CardRows'
import { OtherCardFilters } from './OtherCardFilters'
import { OtherCardRows } from './OtherCardRows'

const powerCards = powerCardsData as PowerCard[]
const otherCards = otherCardsData as OtherCard[]
const POWER_EXPANSIONS = [...new Set(powerCards.map((c) => c.expansion))].sort()

const SEGMENTS = ['Powers', 'Fear', 'Events', 'Blight'] as const
type Segment = (typeof SEGMENTS)[number]

const OTHER_KIND_BY_SEGMENT: Record<Exclude<Segment, 'Powers'>, OtherCard['kind']> = {
  Fear: 'fear',
  Events: 'event',
  Blight: 'blight',
}

const SEGMENT_LABEL: Record<Segment, string> = {
  Powers: 'power cards',
  Fear: 'fear cards',
  Events: 'event cards',
  Blight: 'blight cards',
}

type View = 'grid' | 'rows'

/** v4 #11/#12/#13: the Cards tab — all 471 cards, filterable per #03's spec. A segmented switch
 * (Powers | Fear | Events | Blight) swaps the control set rather than showing dead controls for
 * fields a card type doesn't have (#01 found fear/event/blight carry no elements/cost/speed).
 * Both v4 #04 result shapes ship within each segment, switchable. */
export function CardsTab() {
  const [segment, setSegment] = useState<Segment>('Powers')
  const [view, setView] = useState<View>('grid')
  const [powerFilter, setPowerFilter] = useState<PowerCardFilterState>(EMPTY_POWER_CARD_FILTER)
  const [otherFilter, setOtherFilter] = useState<OtherCardFilterState>(EMPTY_OTHER_CARD_FILTER)

  const shownPowerCards = useMemo(() => filterPowerCards(powerCards, powerFilter), [powerFilter])

  const segmentOtherCards = useMemo(
    () => (segment === 'Powers' ? [] : otherCards.filter((c) => c.kind === OTHER_KIND_BY_SEGMENT[segment])),
    [segment],
  )
  const otherExpansions = useMemo(() => [...new Set(segmentOtherCards.map((c) => c.expansion))].sort(), [segmentOtherCards])
  const shownOtherCards = useMemo(() => filterOtherCards(segmentOtherCards, otherFilter), [segmentOtherCards, otherFilter])

  function selectSegment(next: Segment) {
    setSegment(next)
    setOtherFilter(EMPTY_OTHER_CARD_FILTER)
  }

  const shown = segment === 'Powers' ? shownPowerCards : shownOtherCards
  const total = segment === 'Powers' ? powerCards.length : segmentOtherCards.length

  return (
    <section>
      <h2>Cards</h2>
      <div className="card-view-switch" role="group" aria-label="Card type">
        {SEGMENTS.map((s) => (
          <button key={s} type="button" aria-pressed={segment === s} onClick={() => selectSegment(s)}>
            {s}
          </button>
        ))}
      </div>

      {segment === 'Powers' ? (
        <CardFilters filter={powerFilter} onChange={setPowerFilter} expansions={POWER_EXPANSIONS} />
      ) : (
        <OtherCardFilters segment={segment} filter={otherFilter} onChange={setOtherFilter} expansions={otherExpansions} />
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
        {shown.length} of {total} {SEGMENT_LABEL[segment]}
      </p>
      {view === 'grid' ? (
        <CardGrid cards={shown} />
      ) : segment === 'Powers' ? (
        <CardRows cards={shownPowerCards} />
      ) : (
        <OtherCardRows cards={shownOtherCards} />
      )}
    </section>
  )
}
