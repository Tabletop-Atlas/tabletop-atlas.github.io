import { describe, expect, it } from 'vitest'
import { CARD_KIND_COLOR, CARD_SPEED_COLOR, EXPANSION_COLOR, PANEL_COLOR, SCENARIO_BAND_COLOR, SUBTYPE_COLOR, TAG_COLOR } from '../tagColors'
import { tierColor } from '../tierColors'

/** The tier palette is module-private behind `tierColor(position)`; enumerate its seven positions
 * so the panel palette can be pinned apart from it too (PRD story 17 names tier). */
const TIER_COLORS = Array.from({ length: 7 }, (_, i) => tierColor(i))

/**
 * phase-4 #21's acceptance: no two kinds (and neither speed) share a colour — the v5 lesson
 * (a hash palette that guaranteed collisions) as a pinned test. Also holds the chip system
 * apart from EXPANSION_COLOR byte-for-byte, per tagColors' own separation rule.
 */
describe('card chip colours', () => {
  const kinds = Object.values(CARD_KIND_COLOR)
  const speeds = Object.values(CARD_SPEED_COLOR)

  it('no two kinds nor speeds share a colour', () => {
    expect(new Set([...kinds, ...speeds]).size).toBe(kinds.length + speeds.length)
  })

  it('Fast is a red, Slow is a blue (the locked owner call)', () => {
    const channels = (hex: string) => [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((c) => parseInt(c, 16))
    const [fr, , fb] = channels(CARD_SPEED_COLOR.Fast)
    const [sr, , sb] = channels(CARD_SPEED_COLOR.Slow)
    expect(fr).toBeGreaterThan(fb)
    expect(sb).toBeGreaterThan(sr)
  })

  it('shares no value byte-identically with the expansion, tag, or scenario-band palettes', () => {
    const others = new Set([
      ...Object.values(EXPANSION_COLOR),
      ...Object.values(TAG_COLOR),
      ...Object.values(SCENARIO_BAND_COLOR),
    ])
    for (const colour of [...kinds, ...speeds]) {
      expect(others.has(colour), colour).toBe(false)
    }
  })
})

/**
 * legibility-pass #04: fear/blight/event subtype colours, pinned apart from every other chip
 * system the same way every prior palette in this file is — plus, since the three tag sets never
 * co-occur on one card, pairwise-distinct from each other too (a fear tag must never render the
 * same colour as a blight or event one, even seen out of context).
 */
describe('subtype colours', () => {
  const subtypes = Object.values(SUBTYPE_COLOR)

  it('has 14 pairwise-distinct values', () => {
    expect(new Set(subtypes).size).toBe(subtypes.length)
  })

  it('shares no value byte-identically with any other chip/band/panel/tier palette', () => {
    const others = new Set([
      ...TIER_COLORS,
      ...Object.values(EXPANSION_COLOR),
      ...Object.values(TAG_COLOR),
      ...Object.values(CARD_KIND_COLOR),
      ...Object.values(CARD_SPEED_COLOR),
      ...Object.values(SCENARIO_BAND_COLOR),
      ...Object.values(PANEL_COLOR),
    ])
    for (const colour of subtypes) {
      expect(others.has(colour), colour).toBe(false)
    }
  })
})

/**
 * panel-theming #03: the panel-treatment palette (the modal's C look) pinned apart from every
 * other colour system, byte-for-byte — the same separation rule tagColors.ts states, so a panel
 * surface/text colour can never be mistaken for a tier, tag, expansion, kind/speed, or
 * difficulty-band colour, and none of those can silently leak into the modal's theme.
 */
describe('panel treatment palette', () => {
  const panel = Object.values(PANEL_COLOR)

  it('has six distinct values', () => {
    expect(new Set(panel).size).toBe(panel.length)
  })

  it('shares no value byte-identically with the tier, expansion, tag, kind/speed, or scenario-band palettes', () => {
    const others = new Set([
      ...TIER_COLORS,
      ...Object.values(EXPANSION_COLOR),
      ...Object.values(TAG_COLOR),
      ...Object.values(CARD_KIND_COLOR),
      ...Object.values(CARD_SPEED_COLOR),
      ...Object.values(SCENARIO_BAND_COLOR),
    ])
    for (const colour of panel) {
      expect(others.has(colour), colour).toBe(false)
    }
  })
})
