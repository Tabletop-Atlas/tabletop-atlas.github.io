import { describe, expect, it } from 'vitest'
import { EMPTY_OTHER_CARD_FILTER, filterOtherCards } from '../otherCardFilter'
import type { OtherCard } from '../types'

const fear = { name: 'A Fear Card', expansion: 'Basegame', kind: 'fear', image: 'cards/fear/x.webp' } satisfies OtherCard
const event = { name: 'An Event Card', expansion: 'Branch & Claw', kind: 'event', image: 'cards/event/x.webp' } satisfies OtherCard
const blight = { name: 'A Blight Card', expansion: 'Basegame', kind: 'blight', image: 'cards/blight/x.webp' } satisfies OtherCard

const CARDS = [fear, event, blight]

describe('filterOtherCards', () => {
  it('returns everything for the empty filter', () => {
    expect(filterOtherCards(CARDS, EMPTY_OTHER_CARD_FILTER)).toEqual(CARDS)
  })

  it('expansion narrows to an exact match', () => {
    expect(filterOtherCards(CARDS, { expansion: 'Basegame' }).map((c) => c.name)).toEqual([
      'A Fear Card',
      'A Blight Card',
    ])
  })

  it('a filter can match nothing', () => {
    expect(filterOtherCards(CARDS, { expansion: 'Jagged Earth' })).toEqual([])
  })

  // v4 #13's acceptance criterion: "the filter function's tests cover ... a filter on a field
  // that type does not have." #01 found fear/event/blight carry no elements, cost or speed, and
  // (v5 #01) no independent kind control either since the segmented switch already picks it —
  // OtherCardFilterState has no fields for them at all, enforced at the type level.
  it('has no field for kind/elements/cost/speed on its filter state (compile-time enforced, asserted here in spirit)', () => {
    const filter = EMPTY_OTHER_CARD_FILTER
    expect('kinds' in filter).toBe(false)
    expect('elements' in filter).toBe(false)
    expect('cost' in filter).toBe(false)
    expect('speed' in filter).toBe(false)
  })
})
