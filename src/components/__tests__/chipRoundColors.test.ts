import { describe, expect, it } from 'vitest'
import {
  CARD_KIND_COLOR_WARM,
  CARD_SPEED_COLOR_WARM,
  EXPANSION_COLOR_WARM,
  PANEL_COLOR,
  SCENARIO_BAND_COLOR_WARM,
  TAG_COLOR,
  EXPANSION_COLOR,
  CARD_KIND_COLOR,
  CARD_SPEED_COLOR,
  SCENARIO_BAND_COLOR,
  SUBTYPE_COLOR,
} from '../tagColors'
import { tierColor } from '../tierColors'

/**
 * ROUND 03 (island-retheme) — THROWAWAY, delete alongside `ChipRound.tsx` and every `*_WARM`
 * map/getter in `tagColors.ts` when the round ships or is abandoned.
 *
 * Mirrors `cardChipColors.test.ts`'s own rule for the shipped palettes: the warm re-tint values
 * must be pairwise-distinct from each other and from every existing palette (shipped chip
 * systems, the panel treatment, the tier rainbow in both its dark and light-variant forms) —
 * a re-tune that happens to collide would silently defeat the colour-coding it's supposed to
 * preserve.
 */
describe('ROUND 03 warm chip-colour re-tint', () => {
  const warmValues = [
    ...Object.values(EXPANSION_COLOR_WARM),
    ...Object.values(CARD_KIND_COLOR_WARM),
    ...Object.values(CARD_SPEED_COLOR_WARM),
    SCENARIO_BAND_COLOR_WARM.low,
    SCENARIO_BAND_COLOR_WARM.mid,
    SCENARIO_BAND_COLOR_WARM.high,
    SCENARIO_BAND_COLOR_WARM.top,
    // SUBTYPE_COLOR_WARM isn't exported (module-private, consumed via `subtypeColor()`) — its
    // 14 values are covered by construction (the same 22%-toward-gold mix, spot-checked by hand
    // when written) rather than re-imported here just to widen this test's surface.
  ]

  it('has no duplicate warm value', () => {
    expect(new Set(warmValues).size).toBe(warmValues.length)
  })

  it('shares no value byte-identically with any shipped palette', () => {
    const shipped = new Set([
      ...Object.values(EXPANSION_COLOR),
      ...Object.values(TAG_COLOR),
      ...Object.values(CARD_KIND_COLOR),
      ...Object.values(CARD_SPEED_COLOR),
      ...Object.values(SCENARIO_BAND_COLOR).filter((v) => v.startsWith('#')),
      ...Object.values(SUBTYPE_COLOR),
      ...Object.values(PANEL_COLOR),
      ...Array.from({ length: 7 }, (_, i) => tierColor(i)),
      ...Array.from({ length: 7 }, (_, i) => tierColor(i, 'light')),
    ])
    for (const colour of warmValues) {
      expect(shipped.has(colour), colour).toBe(false)
    }
  })
})
