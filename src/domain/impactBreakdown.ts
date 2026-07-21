import { groupOtherCards } from './otherCardArrange'
import type { Impact, OtherCard } from './types'

export type FearCard = Extract<OtherCard, { kind: 'fear' }>

/** deck-dashboard #19: display labels only — the #02 taxonomy and its 1|2|3 data values are
 * unchanged (PRD-2 user story 17); "minor/major" would collide with minor/major *powers* on the
 * same screen. */
export type ImpactLabel = 'weak' | 'solid' | 'strong'

export const IMPACT_LEVELS: readonly Impact[] = [1, 2, 3]

export const IMPACT_LABELS: Record<Impact, ImpactLabel> = { 1: 'weak', 2: 'solid', 3: 'strong' }

export interface ImpactBucket {
  impact: Impact
  label: ImpactLabel
  cards: FearCard[]
  share: number
}

/** One bucket per impact level, zero-count included — an absent level reads as a fact, never a
 * missing row, same discipline as the element-gap odds rows (#14). */
export function impactBreakdown(cards: FearCard[]): ImpactBucket[] {
  return IMPACT_LEVELS.map((impact) => {
    const bucketCards = cards.filter((c) => c.impact === impact)
    return { impact, label: IMPACT_LABELS[impact], cards: bucketCards, share: cards.length === 0 ? 0 : bucketCards.length / cards.length }
  })
}

export interface TagImpactGroup {
  label: string
  cards: FearCard[]
  byImpact: ImpactBucket[]
}

/** Crosses `groupOtherCards`' by-tag grouping with impact, for the tag facet's mini stacked bars
 * (#19). A multi-tag card's own count lands in every tag group it belongs to, same as the plain
 * by-tag breakdown (#11) — only the per-tag impact split is new here. */
export function tagImpactBreakdown(cards: FearCard[]): TagImpactGroup[] {
  return groupOtherCards(cards, 'subtype').map((group) => {
    const groupCards = group.cards as FearCard[]
    return { label: group.label, cards: groupCards, byImpact: impactBreakdown(groupCards) }
  })
}
