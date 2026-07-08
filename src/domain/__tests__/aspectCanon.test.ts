import { describe, expect, it } from 'vitest'
import spiritsData from '../../data/spirits.json'
import type { Spirit } from '../types'

const spirits = spiritsData as Spirit[]

/**
 * The canonical aspect -> base spirit mapping, from the Spirit Island wiki's Aspects page
 * and independently corroborated by the owner's TierMaker board (art-matched), which lists
 * exactly these 31 aspects.
 *
 * This is a deliberate duplication of the dataset. An earlier pass invented five aspects
 * that do not exist (Sunshower, Entangling, Wrath, Reverie) and filed Regrowth under the
 * wrong spirit, and nothing caught it — the app shipped a nudge recommending a nonexistent
 * aspect. This test is the tripwire.
 */
const CANONICAL_ASPECTS: Record<string, string[]> = {
  'lightnings-swift-strike': ['Pandemonium', 'Wind', 'Immense', 'Sparking'],
  'river-surges-in-sunlight': ['Sunshine', 'Travel', 'Haven'],
  'shadows-flicker-like-flame': ['Madness', 'Reach', 'Amorphous', 'Foreboding', 'Dark Fire'],
  'vital-strength-of-the-earth': ['Resilience', 'Might', 'Nourishing'],
  'a-spread-of-rampant-green': ['Regrowth', 'Tangles'],
  'bringer-of-dreams-and-nightmares': ['Enticing', 'Violence'],
  'heart-of-the-wildfire': ['Transforming'],
  'keeper-of-the-forbidden-wilds': ['Spreading Hostility'],
  'lure-of-the-deep-wilderness': ['Lair'],
  'oceans-hungry-grasp': ['Deeps'],
  'serpent-slumbering-beneath-the-island': ['Locus'],
  'sharp-fangs-behind-the-leaves': ['Encircle', 'Unconstrained'],
  'shifting-memory-of-ages': ['Intensify', 'Mentor'],
  'shroud-of-silent-mist': ['Stranded'],
  thunderspeaker: ['Tactician', 'Warrior'],
}

const TOTAL_CANONICAL_ASPECTS = 31

describe('aspect canon', () => {
  it('gives every spirit exactly its canonical aspects', () => {
    for (const spirit of spirits) {
      const expected = [...(CANONICAL_ASPECTS[spirit.id] ?? [])].sort()
      const actual = spirit.aspects.map((a) => a.name).sort()
      expect(actual, `${spirit.name} has the wrong aspects`).toEqual(expected)
    }
  })

  it('invents no aspects and drops none', () => {
    const total = spirits.flatMap((s) => s.aspects).length
    expect(total).toBe(TOTAL_CANONICAL_ASPECTS)
  })

  it('has globally unique aspect names', () => {
    const names = spirits.flatMap((s) => s.aspects.map((a) => a.name))
    expect(new Set(names).size).toBe(names.length)
  })

  it('never carries a shiftsToward hint without a transcribed effect', () => {
    // A shift hint drives a user-facing recommendation, so it must rest on a real reading
    // of the card, not on the aspect's name.
    for (const spirit of spirits) {
      for (const aspect of spirit.aspects) {
        if (aspect.shiftsToward) {
          expect(aspect.delta, `${spirit.name}/${aspect.name} hints a shift but has no effect text`).toBeTruthy()
        }
      }
    }
  })

  it('marks untranscribed aspects for review', () => {
    for (const spirit of spirits) {
      for (const aspect of spirit.aspects) {
        if (!aspect.delta) {
          expect(aspect.reviewNeeded, `${spirit.name}/${aspect.name} has no effect and no review flag`).toBe(true)
        }
      }
    }
  })

  it('records the complexity arrow printed on every transcribed card', () => {
    const allowed = ['up', 'same', 'down']
    for (const spirit of spirits) {
      for (const aspect of spirit.aspects) {
        if (!aspect.delta) continue
        expect(allowed, `${spirit.name}/${aspect.name} has no complexity arrow`).toContain(aspect.complexityDelta)
      }
    }
  })

  it('leaves shiftsToward unset for the aspects whose cards point at no single axis', () => {
    // Immense and Regrowth change economy; Unconstrained and Spreading Hostility rework
    // setup/growth. Assigning them an OCFDU axis would be invention.
    const noAxis = ['Immense', 'Regrowth', 'Unconstrained', 'Spreading Hostility']
    const withoutHint = spirits.flatMap((s) => s.aspects).filter((a) => !a.shiftsToward).map((a) => a.name)
    expect(withoutHint.sort()).toEqual([...noAxis].sort())
  })
})
