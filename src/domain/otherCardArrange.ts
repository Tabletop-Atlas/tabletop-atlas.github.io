import { subtypeLabel } from '../components/tagColors'
import { BLIGHT_TAGS, EVENT_CLASSES, EXPANSIONS, FEAR_TAGS, type BlightTag, type EventClass, type FearTag, type OtherCard } from './types'

export type OtherGroup = 'none' | 'expansion' | 'subtype'

export interface OtherCardGroup {
  label: string
  cards: OtherCard[]
}

function subtypesOf(card: OtherCard): (FearTag | BlightTag | EventClass)[] {
  return card.kind === 'event' ? [card.eventClass] : card.tags
}

/** Sibling of `powerCardArrange.ts`'s `groupPowerCards`, mirroring its conventions for the 139
 * fear/event/blight cards `PowerCard` doesn't cover. Kept in its own module so the power-only file
 * stays power-only (archive-grouping #03). */
export function groupOtherCards(cards: OtherCard[], group: Exclude<OtherGroup, 'none'>): OtherCardGroup[] {
  if (group === 'expansion') {
    const byExpansion = new Map<string, OtherCard[]>()
    for (const card of cards) {
      const bucket = byExpansion.get(card.expansion)
      if (bucket) bucket.push(card)
      else byExpansion.set(card.expansion, [card])
    }
    const canonicalSet: ReadonlySet<string> = new Set(EXPANSIONS)
    const canonical = EXPANSIONS.filter((exp) => byExpansion.has(exp)).map((exp) => ({ label: exp, cards: byExpansion.get(exp)! }))
    const raw = [...byExpansion.keys()]
      .filter((label) => !canonicalSet.has(label))
      .map((label) => ({ label, cards: byExpansion.get(label)! }))
    return [...canonical, ...raw]
  }

  // 'subtype': fear/blight are multi-valued (the `element` pattern — a card appears under EVERY
  // tag it carries, zero-tag cards land in a trailing "Unclassified" group); event is
  // single-valued (every event carries exactly one class, so it never has an Unclassified group).
  // Precondition: `cards` is homogeneous by `kind` — the Cards tab's segmented switch (Fear |
  // Events | Blight) already isolates one kind before calling this, same assumption
  // `groupPowerCards` makes about its own input.
  const kind = cards[0]?.kind
  if (kind === undefined) return []
  const isJudgment = kind === 'blight'
  const canonicalOrder: readonly (FearTag | BlightTag | EventClass)[] =
    kind === 'fear' ? FEAR_TAGS : kind === 'blight' ? BLIGHT_TAGS : EVENT_CLASSES
  const label = (text: string) => (isJudgment ? `${text} (judgment)` : text)

  const groups = canonicalOrder
    .map((tag) => ({ label: label(subtypeLabel(tag)), cards: cards.filter((c) => subtypesOf(c).includes(tag)) }))
    .filter((g) => g.cards.length > 0)

  const unclassified = cards.filter((c) => subtypesOf(c).length === 0)
  if (unclassified.length > 0) groups.push({ label: label('Unclassified'), cards: unclassified })

  return groups
}
