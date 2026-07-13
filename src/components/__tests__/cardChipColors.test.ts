import { describe, expect, it } from 'vitest'
import { CARD_KIND_COLOR, CARD_SPEED_COLOR, EXPANSION_COLOR, SCENARIO_BAND_COLOR, TAG_COLOR } from '../tagColors'

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
