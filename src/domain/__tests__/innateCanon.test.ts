import { describe, expect, it } from 'vitest'
import innatePowersData from '../../data/innate-powers.json'
import spiritsData from '../../data/spirits.json'
import { ELEMENTS } from '../types'
import type { InnatePower, Spirit } from '../types'

const innatePowers = innatePowersData as InnatePower[]
const spirits = spiritsData as Spirit[]

const TOTAL_INNATE_POWERS = 67
const TOTAL_THRESHOLD_ROWS = 214

/**
 * deck-dashboard #15: sentinel spirits spanning every expansion that ships spirits, hand-checked
 * against the wiki's raw wikitext and the on-disk TTS mod JSON's decoded element-count strings at
 * transcription time (2026-07-21) — this is the tripwire: drift, omission, or invention on any of
 * these exact rows fails the build. Eyes Watch from the Trees is the #01 research's own worked
 * example (`1M2P/2M3P/2M2A4P/3M3A5P`, decoded from TTS `01000020/02000030/02020040/03030050`).
 */
const SENTINELS: Record<string, { name: string; speed: 'Fast' | 'Slow'; thresholds: InnatePower['thresholds'] }[]> = {
  'river-surges-in-sunlight': [
    { name: 'Massive Flooding', speed: 'Slow', thresholds: [{ Sun: 1, Water: 2 }, { Sun: 2, Water: 3 }, { Sun: 3, Water: 4, Earth: 1 }] },
  ],
  'eyes-watch-from-the-trees': [
    {
      name: 'Mischief and Sabotage',
      speed: 'Fast',
      thresholds: [{ Moon: 1, Plant: 2 }, { Moon: 2, Plant: 3 }, { Moon: 2, Air: 2, Plant: 4 }, { Moon: 3, Air: 3, Plant: 5 }],
    },
  ],
  'fractured-days-split-the-sky': [
    { name: 'Slip the Flow of Time', speed: 'Fast', thresholds: [{ Moon: 3, Air: 1 }, { Sun: 2, Moon: 2 }, { Sun: 3, Air: 2 }] },
    { name: 'Visions of a Shifting Future', speed: 'Slow', thresholds: [{ Sun: 1, Moon: 2, Air: 2 }, { Sun: 2, Moon: 3, Air: 2 }] },
  ],
  'wounded-waters-bleeding': [
    { name: 'Swirl and Spill', speed: 'Slow', thresholds: [{ Water: 2 }, { Water: 3, Animal: 1 }, { Water: 5, Plant: 2, Animal: 2 }] },
    { name: 'Sanguinary Taint', speed: 'Slow', thresholds: [{ Animal: 2 }, { Water: 1, Animal: 3 }, { Fire: 2, Water: 2, Animal: 5 }] },
  ],
  'starlight-seeks-its-form': [
    { name: 'Air Moves, Earth Endures', speed: 'Fast', thresholds: [{ Air: 3 }, { Earth: 3 }] },
    { name: 'Fire Burns, Water Soothes', speed: 'Slow', thresholds: [{ Fire: 3 }, { Water: 3 }] },
    { name: 'Wood Seeks Growth, Humans Seek Freedom', speed: 'Slow', thresholds: [{ Plant: 3 }, { Animal: 3 }] },
    { name: 'Sidereal Guidance', speed: 'Slow', thresholds: [{ Moon: 2 }, { Moon: 3 }] },
    { name: 'Stars Blaze in the Daytime Sky', speed: 'Slow', thresholds: [{ Sun: 4 }] },
  ],
}

describe('innate-threshold canon', () => {
  it('covers all 37 spirits, each with at least one innate power', () => {
    const bySpirit = new Map<string, InnatePower[]>()
    for (const power of innatePowers) {
      bySpirit.set(power.spirit, [...(bySpirit.get(power.spirit) ?? []), power])
    }
    for (const spirit of spirits) {
      expect(bySpirit.get(spirit.id), `${spirit.name} has no innate powers`).toBeTruthy()
      expect(bySpirit.get(spirit.id)!.length).toBeGreaterThan(0)
    }
    expect(bySpirit.size).toBe(spirits.length)
  })

  it('carries no innate power for a spirit id outside the canon', () => {
    const spiritIds = new Set(spirits.map((s) => s.id))
    for (const power of innatePowers) {
      expect(spiritIds.has(power.spirit), `unknown spirit id "${power.spirit}"`).toBe(true)
    }
  })

  it('invents no innate powers and drops none (exact transcribed counts)', () => {
    expect(innatePowers.length).toBe(TOTAL_INNATE_POWERS)
    const totalThresholds = innatePowers.reduce((sum, p) => sum + p.thresholds.length, 0)
    expect(totalThresholds).toBe(TOTAL_THRESHOLD_ROWS)
  })

  it('matches sentinel spirits spanning every expansion, exactly (wiki+TTS cross-checked)', () => {
    for (const [spiritId, expected] of Object.entries(SENTINELS)) {
      const actual = innatePowers.filter((p) => p.spirit === spiritId).map(({ name, speed, thresholds }) => ({ name, speed, thresholds }))
      expect(actual, `${spiritId} innate powers drifted from the sentinel`).toEqual(expected)
    }
  })

  it('keys every threshold only with the 8 canonical elements', () => {
    for (const power of innatePowers) {
      for (const threshold of power.thresholds) {
        for (const key of Object.keys(threshold)) {
          expect(ELEMENTS, `${power.spirit}/${power.name} has an unknown element key "${key}"`).toContain(key)
        }
      }
    }
  })

  it('gives every threshold at least one required element (never an empty row)', () => {
    for (const power of innatePowers) {
      for (const threshold of power.thresholds) {
        expect(Object.keys(threshold).length, `${power.spirit}/${power.name} has an empty threshold`).toBeGreaterThan(0)
      }
    }
  })

  it('carries the wiki+tts provenance on every record, no unsourced rows', () => {
    for (const power of innatePowers) {
      expect(power.source, `${power.spirit}/${power.name} is missing provenance`).toBe('wiki+tts')
    }
  })

  it('carries no effect text, cost, range, or target - only spirit, name, speed, thresholds, source', () => {
    const allowedKeys = new Set(['spirit', 'name', 'speed', 'thresholds', 'source'])
    for (const power of innatePowers) {
      for (const key of Object.keys(power)) {
        expect(allowedKeys.has(key), `${power.spirit}/${power.name} has an unexpected field "${key}"`).toBe(true)
      }
    }
  })

  it('gives every power one of the two canonical speeds', () => {
    for (const power of innatePowers) {
      expect(['Fast', 'Slow'], `${power.spirit}/${power.name} has an invalid speed`).toContain(power.speed)
    }
  })
})
