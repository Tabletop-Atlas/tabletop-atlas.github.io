import { ELEMENTS, type PowerCard } from './types'

export type PowerSort = 'none' | 'cost-asc' | 'cost-desc'
export type PowerGroup = 'none' | 'cost' | 'speed' | 'element'

/** phase-4 #19: arrange the Powers segment after filtering. Sorts are stable copies — ties keep the
 * deck's input order, so composing with filters never reshuffles equal-cost cards. */
export function sortPowerCards(cards: PowerCard[], sort: PowerSort): PowerCard[] {
  if (sort === 'none') return [...cards]
  return [...cards].sort((a, b) => (sort === 'cost-asc' ? a.cost - b.cost : b.cost - a.cost))
}

export interface PowerCardGroup {
  label: string
  cards: PowerCard[]
}

/** Groups follow a fixed canonical order (costs ascending, Fast before Slow, the ELEMENTS
 * order), empty groups omitted. Under 'element' a card appears in EVERY group whose element it
 * carries; the 3 element-less cards in the real deck land in a trailing "No element" group. */
export function groupPowerCards(cards: PowerCard[], group: Exclude<PowerGroup, 'none'>): PowerCardGroup[] {
  if (group === 'cost') {
    const costs = [...new Set(cards.map((c) => c.cost))].sort((a, b) => a - b)
    return costs.map((cost) => ({ label: `Cost ${cost}`, cards: cards.filter((c) => c.cost === cost) }))
  }
  if (group === 'speed') {
    return (['Fast', 'Slow'] as const)
      .map((speed) => ({ label: speed, cards: cards.filter((c) => c.speed === speed) }))
      .filter((g) => g.cards.length > 0)
  }
  const byElement: PowerCardGroup[] = ELEMENTS.map((el) => ({
    label: el,
    cards: cards.filter((c) => c.elements.includes(el)),
  }))
  byElement.push({ label: 'No element', cards: cards.filter((c) => c.elements.length === 0) })
  return byElement.filter((g) => g.cards.length > 0)
}
