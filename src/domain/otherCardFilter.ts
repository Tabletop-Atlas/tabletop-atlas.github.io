import type { BlightTag, EventClass, FearTag, OtherCard } from './types'

/**
 * Fear/event/blight's own filter — deliberately narrower than `PowerCardFilterState`. #01 found
 * these three types carry no elements, cost or speed, so `OtherCardFilterState` has no fields for
 * them: the type system is the enforcement that "no control is ever offered for a field the
 * selected card type lacks" (v4 #13's acceptance criterion), not a runtime check.
 *
 * No `kind` field: the Cards tab's segmented switch (Powers | Fear | Events | Blight) already
 * picks exactly one kind before this filter ever sees the array (v5 #01) - a second control over
 * the same axis let you contradict the segment.
 *
 * `fearTags`/`blightTags` only apply to their own kind (v5 #03: "a fear bucket is not a blight
 * bucket") - each is OR-within-the-list, same convention as v4 #12's other multi-selects, and
 * ANDs with `expansion`. The literal string `'unclassified'` is a selectable value alongside the
 * real tags, matching cards with an empty tag list, rather than a real bucket in `FearTag`/
 * `BlightTag` - keeps "no rule matched" from being confused with a bucket this repo invented.
 */
export interface OtherCardFilterState {
  expansion?: string
  fearTags?: (FearTag | 'unclassified')[]
  blightTags?: (BlightTag | 'unclassified')[]
  eventClass?: EventClass
}

export const EMPTY_OTHER_CARD_FILTER: OtherCardFilterState = {}

function matchesTags<T extends string>(cardTags: T[], selected: (T | 'unclassified')[]): boolean {
  return selected.some((sel) => (sel === 'unclassified' ? cardTags.length === 0 : cardTags.includes(sel)))
}

export function filterOtherCards(cards: OtherCard[], filter: OtherCardFilterState): OtherCard[] {
  return cards.filter((card) => {
    if (filter.expansion && card.expansion !== filter.expansion) return false
    if (filter.fearTags && filter.fearTags.length > 0) {
      if (card.kind !== 'fear' || !matchesTags(card.tags, filter.fearTags)) return false
    }
    if (filter.blightTags && filter.blightTags.length > 0) {
      if (card.kind !== 'blight' || !matchesTags(card.tags, filter.blightTags)) return false
    }
    if (filter.eventClass) {
      if (card.kind !== 'event' || card.eventClass !== filter.eventClass) return false
    }
    return true
  })
}
