import { describe, expect, it } from 'vitest'
import adversariesData from '../../data/adversaries.json'
import otherCardsData from '../../data/other-cards.json'
import powerCardsData from '../../data/power-cards.json'
import scenariosData from '../../data/scenarios.json'
import spiritsData from '../../data/spirits.json'
import type { ExpansionName } from '../../domain/types'
import { EXPANSION_COLOR, normalizeExpansion } from '../tagColors'

/**
 * legibility-pass #01: the fabrication tripwire for expansion normalisation. If a future record
 * (transcribed or hand-edited) introduces a raw expansion string `normalizeExpansion` doesn't
 * know, colour silently fails to resolve for it — this test turns that silence into a failure.
 *
 * Pins the exact raw-string -> canonical mapping seen in each dataset today, not just "resolves
 * to something" — a wrong alias (e.g. `Basegame` mapped to `Promo`) would still "resolve" but
 * would be silently wrong; `toEqual` against a literal table catches that too.
 */
function rawExpansionMapping(raws: string[]): Record<string, ExpansionName | undefined> {
  return Object.fromEntries([...new Set(raws)].map((raw) => [raw, normalizeExpansion(raw)]))
}

describe('expansion canon', () => {
  it('resolves every other-card expansion string to its known canonical value', () => {
    const seen = rawExpansionMapping((otherCardsData as { expansion: string }[]).map((c) => c.expansion))
    expect(seen).toEqual({
      Basegame: 'Base',
      'Branch & Claw': 'Branch & Claw',
      'Jagged Earth': 'Jagged Earth',
      'Nature Incarnate': 'Nature Incarnate',
      Promo2: 'Feather & Flame',
    })
  })

  it('resolves every power-card expansion string to its known canonical value', () => {
    const seen = rawExpansionMapping((powerCardsData as { expansion: string }[]).map((c) => c.expansion))
    expect(seen).toEqual({
      Basegame: 'Base',
      'Branch & Claw': 'Branch & Claw',
      'Horizons of Spirit Island': 'Horizons',
      'Jagged Earth': 'Jagged Earth',
      'Nature Incarnate': 'Nature Incarnate',
      Promo: 'Feather & Flame',
      Promo2: 'Feather & Flame',
    })
  })

  it('resolves every adversary expansion string to its known canonical value', () => {
    const seen = rawExpansionMapping((adversariesData.adversaries as { expansion: string }[]).map((a) => a.expansion))
    expect(seen).toEqual({
      Base: 'Base',
      'Branch and Claw': 'Branch & Claw',
      'Jagged Earth': 'Jagged Earth',
      'Nature Incarnate': 'Nature Incarnate',
      'Promo Pack 2 / Feather and Flame': 'Feather & Flame',
    })
  })

  it('resolves every spirit expansion string to its known canonical value (already canonical)', () => {
    for (const spirit of spiritsData as { expansion: string }[]) {
      expect(normalizeExpansion(spirit.expansion), spirit.expansion).toBe(spirit.expansion)
    }
  })

  it('resolves every scenario expansion string to its known canonical value', () => {
    const seen = rawExpansionMapping((scenariosData.scenarios as { expansion: string }[]).map((s) => s.expansion))
    expect(seen).toEqual({
      'Base Game': 'Base',
      'Branch and Claw': 'Branch & Claw',
      'Jagged Earth': 'Jagged Earth',
      'Nature Incarnate': 'Nature Incarnate',
      'Promo Pack 2': 'Feather & Flame',
    })
  })

  it('every value normalizeExpansion can produce is a known EXPANSION_COLOR key', () => {
    const allRaw = [
      ...(otherCardsData as { expansion: string }[]).map((c) => c.expansion),
      ...(powerCardsData as { expansion: string }[]).map((c) => c.expansion),
      ...(adversariesData.adversaries as { expansion: string }[]).map((a) => a.expansion),
      ...(spiritsData as { expansion: string }[]).map((s) => s.expansion),
      ...(scenariosData.scenarios as { expansion: string }[]).map((s) => s.expansion),
    ]
    const unresolved = allRaw.filter((raw) => {
      const canonical = normalizeExpansion(raw)
      return !canonical || !(canonical in EXPANSION_COLOR)
    })
    expect([...new Set(unresolved)]).toEqual([])
  })
})
