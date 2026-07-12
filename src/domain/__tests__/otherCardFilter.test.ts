import { describe, expect, it } from 'vitest'
import { EMPTY_OTHER_CARD_FILTER, filterOtherCards } from '../otherCardFilter'
import type { OtherCard } from '../types'

const fear1 = { name: 'A Fear Card', expansion: 'Basegame', kind: 'fear', image: 'x.webp', tags: ['removal'] } satisfies OtherCard
const fear2 = { name: 'Another Fear Card', expansion: 'Basegame', kind: 'fear', image: 'x.webp', tags: ['defensive', 'removal'] } satisfies OtherCard
const fearUnclassified = { name: 'A Blank Fear Card', expansion: 'Basegame', kind: 'fear', image: 'x.webp', tags: [] } satisfies OtherCard
const event = { name: 'An Event Card', expansion: 'Branch & Claw', kind: 'event', image: 'x.webp', eventClass: 'choice' } satisfies OtherCard
const blight = {
  name: 'A Blight Card',
  expansion: 'Basegame',
  kind: 'blight',
  image: 'x.webp',
  tags: ['presenceLoss'],
  tagsSource: 'judgment',
} satisfies OtherCard

const CARDS = [fear1, fear2, fearUnclassified, event, blight]

describe('filterOtherCards', () => {
  it('returns everything for the empty filter', () => {
    expect(filterOtherCards(CARDS, EMPTY_OTHER_CARD_FILTER)).toEqual(CARDS)
  })

  it('expansion narrows to an exact match', () => {
    expect(filterOtherCards(CARDS, { expansion: 'Branch & Claw' })).toEqual([event])
  })

  it('fearTags is OR within the list and only ever matches fear cards', () => {
    const result = filterOtherCards(CARDS, { fearTags: ['defensive'] })
    expect(result).toEqual([fear2])
  })

  it('"unclassified" in fearTags matches only cards with an empty tag list', () => {
    const result = filterOtherCards(CARDS, { fearTags: ['unclassified'] })
    expect(result).toEqual([fearUnclassified])
  })

  it('"unclassified" combines by OR with a real tag, same as any other multi-select', () => {
    const result = filterOtherCards(CARDS, { fearTags: ['unclassified', 'defensive'] })
    expect(result.map((c) => c.name)).toEqual(['Another Fear Card', 'A Blank Fear Card'])
  })

  it('blightTags only matches blight cards', () => {
    expect(filterOtherCards(CARDS, { blightTags: ['presenceLoss'] })).toEqual([blight])
    expect(filterOtherCards(CARDS, { blightTags: ['boardChange'] })).toEqual([])
  })

  it('eventClass only matches event cards', () => {
    expect(filterOtherCards(CARDS, { eventClass: 'choice' })).toEqual([event])
    expect(filterOtherCards(CARDS, { eventClass: 'stage' })).toEqual([])
  })

  it('a filter can match nothing', () => {
    expect(filterOtherCards(CARDS, { expansion: 'Jagged Earth' })).toEqual([])
  })

  it('has no field for elements/cost/speed on its filter state (compile-time enforced, asserted here in spirit)', () => {
    const filter = EMPTY_OTHER_CARD_FILTER
    expect('elements' in filter).toBe(false)
    expect('cost' in filter).toBe(false)
    expect('speed' in filter).toBe(false)
  })
})
