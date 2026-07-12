import type { OtherCard } from './types'

/**
 * Fear/event/blight's own filter — deliberately narrower than `PowerCardFilterState`. #01 found
 * these three types carry no elements, cost or speed, so `OtherCardFilterState` has no fields for
 * them: the type system is the enforcement that "no control is ever offered for a field the
 * selected card type lacks" (v4 #13's acceptance criterion), not a runtime check.
 *
 * No `kind` field: the Cards tab's segmented switch (Powers | Fear | Events | Blight) already
 * picks exactly one kind before this filter ever sees the array (v5 #01) - a second control over
 * the same axis let you contradict the segment.
 */
export interface OtherCardFilterState {
  expansion?: string
}

export const EMPTY_OTHER_CARD_FILTER: OtherCardFilterState = {}

export function filterOtherCards(cards: OtherCard[], filter: OtherCardFilterState): OtherCard[] {
  return cards.filter((card) => {
    if (filter.expansion && card.expansion !== filter.expansion) return false
    return true
  })
}
