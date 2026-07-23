import { groupOtherCards } from './otherCardArrange'
import type { EventClass, OtherCard, Valence } from './types'
import { VALENCES } from './types'

export type EventCard = Extract<OtherCard, { kind: 'event' }>

export interface ValenceBucket {
  valence: Valence
  cards: EventCard[]
  share: number
}

/** One bucket per valence, zero-count included — an absent valence reads as a fact, never a
 * missing row, same discipline as `impactBreakdown` (#19). */
export function valenceBreakdown(cards: EventCard[]): ValenceBucket[] {
  return VALENCES.map((valence) => {
    const bucketCards = cards.filter((c) => c.valence === valence)
    return { valence, cards: bucketCards, share: cards.length === 0 ? 0 : bucketCards.length / cards.length }
  })
}

export interface ClassValenceGroup {
  label: string
  /** Raw event class when the group is a named bucket. */
  subtype?: EventClass
  cards: EventCard[]
  byValence: ValenceBucket[]
}

/** Crosses `groupOtherCards`' by-class grouping with valence, for the class facet's mini stacked
 * bars (#20) — event class is single-valued so every card lands in exactly one group, unlike
 * fear's multi-tag crossing. */
export function classValenceBreakdown(cards: EventCard[]): ClassValenceGroup[] {
  return groupOtherCards(cards, 'subtype').map((group) => {
    const groupCards = group.cards as EventCard[]
    return {
      label: group.label,
      subtype: group.subtype as EventClass | undefined,
      cards: groupCards,
      byValence: valenceBreakdown(groupCards),
    }
  })
}
