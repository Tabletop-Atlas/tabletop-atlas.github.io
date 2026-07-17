import { describe, expect, it } from 'vitest'
import { groupOtherCards } from '../otherCardArrange'
import type { OtherCard } from '../types'

function fearCard(overrides: Partial<Extract<OtherCard, { kind: 'fear' }>> & Pick<OtherCard, 'name'>): OtherCard {
  return { kind: 'fear', expansion: 'Base', image: 'cards/fear/x.webp', tags: [], ...overrides } as OtherCard
}

function blightCard(overrides: Partial<Extract<OtherCard, { kind: 'blight' }>> & Pick<OtherCard, 'name'>): OtherCard {
  return {
    kind: 'blight',
    expansion: 'Base',
    image: 'cards/blight/x.webp',
    tags: [],
    tagsSource: 'judgment',
    ...overrides,
  } as OtherCard
}

function eventCard(overrides: Partial<Extract<OtherCard, { kind: 'event' }>> & Pick<OtherCard, 'name'>): OtherCard {
  return { kind: 'event', expansion: 'Base', image: 'cards/event/x.webp', eventClass: 'choice', ...overrides } as OtherCard
}

describe('groupOtherCards by subtype — fear', () => {
  const removalOnly = fearCard({ name: 'A', tags: ['removal'] })
  const removalAndWeaken = fearCard({ name: 'B', tags: ['removal', 'weaken'] })
  const untagged = fearCard({ name: 'C', tags: [] })

  it('a multi-tag card appears under EVERY tag it carries; groups follow the canonical FEAR_TAGS order', () => {
    expect(groupOtherCards([removalAndWeaken, removalOnly], 'subtype')).toEqual([
      { label: 'Removal', cards: [removalAndWeaken, removalOnly] },
      { label: 'Weaken', cards: [removalAndWeaken] },
    ])
  })

  it('zero-tag cards land in a trailing "Unclassified" group, no judgment note', () => {
    expect(groupOtherCards([removalOnly, untagged], 'subtype')).toEqual([
      { label: 'Removal', cards: [removalOnly] },
      { label: 'Unclassified', cards: [untagged] },
    ])
  })

  it('omits tags no card carries — no empty groups', () => {
    expect(groupOtherCards([removalOnly], 'subtype')).toEqual([{ label: 'Removal', cards: [removalOnly] }])
  })
})

describe('groupOtherCards by subtype — blight (judgment)', () => {
  const presenceLossOnly = blightCard({ name: 'A', tags: ['presenceLoss'] })
  const presenceLossAndBoard = blightCard({ name: 'B', tags: ['presenceLoss', 'boardChange'] })
  const untagged = blightCard({ name: 'C', tags: [] })

  it('a multi-tag card appears under EVERY tag it carries; group headers carry the "(judgment)" note', () => {
    expect(groupOtherCards([presenceLossAndBoard, presenceLossOnly], 'subtype')).toEqual([
      { label: 'Presence loss (judgment)', cards: [presenceLossAndBoard, presenceLossOnly] },
      { label: 'Board change (judgment)', cards: [presenceLossAndBoard] },
    ])
  })

  it('zero-tag cards land in a trailing "Unclassified (judgment)" group', () => {
    expect(groupOtherCards([presenceLossOnly, untagged], 'subtype')).toEqual([
      { label: 'Presence loss (judgment)', cards: [presenceLossOnly] },
      { label: 'Unclassified (judgment)', cards: [untagged] },
    ])
  })
})

describe('groupOtherCards by subtype — event (single-valued, never judgment)', () => {
  const choice = eventCard({ name: 'A', eventClass: 'choice' })
  const stage = eventCard({ name: 'B', eventClass: 'stage' })

  it('groups follow the canonical EVENT_CLASSES order; no judgment note', () => {
    expect(groupOtherCards([stage, choice], 'subtype')).toEqual([
      { label: 'Choice', cards: [choice] },
      { label: 'Stage', cards: [stage] },
    ])
  })

  it('omits classes no card has — no empty groups, and no Unclassified (every event has exactly one class)', () => {
    expect(groupOtherCards([choice], 'subtype')).toEqual([{ label: 'Choice', cards: [choice] }])
  })
})

describe('groupOtherCards by expansion', () => {
  const base = fearCard({ name: 'A', expansion: 'Base' })
  const jaggedEarth = fearCard({ name: 'B', expansion: 'Jagged Earth' })
  const jaggedEarth2 = fearCard({ name: 'C', expansion: 'Jagged Earth' })
  const unrecognized = fearCard({ name: 'D', expansion: 'Some Future Box' })

  it('groups follow the canonical EXPANSIONS order; cards within a group keep input order', () => {
    expect(groupOtherCards([jaggedEarth, base, jaggedEarth2], 'expansion')).toEqual([
      { label: 'Base', cards: [base] },
      { label: 'Jagged Earth', cards: [jaggedEarth, jaggedEarth2] },
    ])
  })

  it('a card whose expansion string is not in the canonical set still groups under its raw label, never dropped', () => {
    expect(groupOtherCards([base, unrecognized], 'expansion')).toEqual([
      { label: 'Base', cards: [base] },
      { label: 'Some Future Box', cards: [unrecognized] },
    ])
  })
})
