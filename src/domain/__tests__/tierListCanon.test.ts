import { describe, expect, it } from 'vitest'
import ownersBoard from '../../data/tier-lists/owners-board.json'
import siaFavoritesFunSolo from '../../data/tier-lists/sia-favorites-fun-solo-2026.json'
import threeMbgStrengthSolo from '../../data/tier-lists/3mbg-strength-solo-2025.json'
import spiritsData from '../../data/spirits.json'
import { expand } from '../configurations'
import type { Spirit, TierList } from '../types'

const spirits = spiritsData as Spirit[]
const configIds = new Set(expand(spirits).map((c) => c.configId))

/** Every shipped tier list. Extend this array as new lists land - this test is the tripwire
 * that keeps every one of them honest, modelled on `aspectCanon.test.ts`. */
const SHIPPED_LISTS: TierList[] = [
  ownersBoard as TierList,
  siaFavoritesFunSolo as TierList,
  threeMbgStrengthSolo as TierList,
]

/**
 * A deliberate duplication of the owner's 68 expected keys, so drift in `owners-board.json`
 * fails loudly rather than silently losing coverage. See `aspectCanon.test.ts` for why this
 * repo duplicates canonical data in tests rather than trusting the dataset to check itself.
 */
const OWNERS_BOARD_EXPECTED_KEYS = [
  'lightnings-swift-strike',
  'river-surges-in-sunlight',
  'vital-strength-of-the-earth',
  'shadows-flicker-like-flame',
  'thunderspeaker',
  'a-spread-of-rampant-green',
  'oceans-hungry-grasp',
  'bringer-of-dreams-and-nightmares',
  'sharp-fangs-behind-the-leaves',
  'keeper-of-the-forbidden-wilds',
  'heart-of-the-wildfire',
  'serpent-slumbering-beneath-the-island',
  'stones-unyielding-defiance',
  'shifting-memory-of-ages',
  'grinning-trickster-stirs-up-trouble',
  'lure-of-the-deep-wilderness',
  'many-minds-move-as-one',
  'volcano-looming-high',
  'shroud-of-silent-mist',
  'vengeance-as-a-burning-plague',
  'starlight-seeks-its-form',
  'fractured-days-split-the-sky',
  'downpour-drenches-the-world',
  'finder-of-paths-unseen',
  'hearth-vigil',
  'towering-roots-of-the-jungle',
  'ember-eyed-behemoth',
  'relentless-gaze-of-the-sun',
  'wandering-voice-keens-delirium',
  'wounded-waters-bleeding',
  'breath-of-darkness-down-your-spine',
  'dances-up-earthquakes',
  'devouring-teeth-lurk-underfoot',
  'eyes-watch-from-the-trees',
  'fathomless-mud-of-the-swamp',
  'rising-heat-of-stone-and-sand',
  'sun-bright-whirlwind',
  'lightnings-swift-strike::Pandemonium',
  'lightnings-swift-strike::Wind',
  'lightnings-swift-strike::Immense',
  'lightnings-swift-strike::Sparking',
  'river-surges-in-sunlight::Sunshine',
  'river-surges-in-sunlight::Travel',
  'river-surges-in-sunlight::Haven',
  'vital-strength-of-the-earth::Resilience',
  'vital-strength-of-the-earth::Might',
  'vital-strength-of-the-earth::Nourishing',
  'shadows-flicker-like-flame::Madness',
  'shadows-flicker-like-flame::Reach',
  'shadows-flicker-like-flame::Amorphous',
  'shadows-flicker-like-flame::Foreboding',
  'shadows-flicker-like-flame::Dark Fire',
  'thunderspeaker::Tactician',
  'thunderspeaker::Warrior',
  'a-spread-of-rampant-green::Regrowth',
  'a-spread-of-rampant-green::Tangles',
  'oceans-hungry-grasp::Deeps',
  'bringer-of-dreams-and-nightmares::Enticing',
  'bringer-of-dreams-and-nightmares::Violence',
  'sharp-fangs-behind-the-leaves::Encircle',
  'sharp-fangs-behind-the-leaves::Unconstrained',
  'keeper-of-the-forbidden-wilds::Spreading Hostility',
  'heart-of-the-wildfire::Transforming',
  'serpent-slumbering-beneath-the-island::Locus',
  'shifting-memory-of-ages::Intensify',
  'shifting-memory-of-ages::Mentor',
  'lure-of-the-deep-wilderness::Lair',
  'shroud-of-silent-mist::Stranded',
]

/**
 * A deliberate duplication of the 36 base spirits 3MBG's video covers, so drift in
 * `3mbg-strength-solo-2025.json` fails loudly. The source never mentions Fathomless Mud of the
 * Swamp and never covers aspects - those 32 keys must stay absent, not filled in.
 */
const THREE_MBG_EXPECTED_KEYS = [
  'lightnings-swift-strike',
  'vital-strength-of-the-earth',
  'river-surges-in-sunlight',
  'shadows-flicker-like-flame',
  'thunderspeaker',
  'a-spread-of-rampant-green',
  'oceans-hungry-grasp',
  'bringer-of-dreams-and-nightmares',
  'sharp-fangs-behind-the-leaves',
  'keeper-of-the-forbidden-wilds',
  'serpent-slumbering-beneath-the-island',
  'heart-of-the-wildfire',
  'shifting-memory-of-ages',
  'many-minds-move-as-one',
  'lure-of-the-deep-wilderness',
  'grinning-trickster-stirs-up-trouble',
  'stones-unyielding-defiance',
  'volcano-looming-high',
  'vengeance-as-a-burning-plague',
  'shroud-of-silent-mist',
  'starlight-seeks-its-form',
  'fractured-days-split-the-sky',
  'downpour-drenches-the-world',
  'finder-of-paths-unseen',
  'eyes-watch-from-the-trees',
  'rising-heat-of-stone-and-sand',
  'devouring-teeth-lurk-underfoot',
  'sun-bright-whirlwind',
  'ember-eyed-behemoth',
  'hearth-vigil',
  'towering-roots-of-the-jungle',
  'relentless-gaze-of-the-sun',
  'wounded-waters-bleeding',
  'wandering-voice-keens-delirium',
  'breath-of-darkness-down-your-spine',
  'dances-up-earthquakes',
]

describe('tier list canon', () => {
  for (const list of SHIPPED_LISTS) {
    describe(list.id, () => {
      it('references only configIds that exist in spirits.json', () => {
        for (const configId of Object.keys(list.tiers)) {
          expect(configIds, `${list.id} rates unknown configuration "${configId}"`).toContain(configId)
        }
      })

      it('uses only labels declared in its own tierLabels', () => {
        for (const [configId, label] of Object.entries(list.tiers)) {
          expect(list.tierLabels, `${list.id}/${configId} uses label "${label}" outside its vocabulary`).toContain(
            label,
          )
        }
      })

      it('has no duplicate tierLabels', () => {
        expect(new Set(list.tierLabels).size).toBe(list.tierLabels.length)
      })

      it('has a source with a URL if origin is cited', () => {
        if (list.origin === 'cited') {
          expect(list.source, `${list.id} is cited but has no source`).toBeDefined()
          expect(list.source?.url, `${list.id}'s source has no URL`).toBeTruthy()
        }
      })

      it('declares verified as a boolean', () => {
        expect(typeof list.verified).toBe('boolean')
      })
    })
  }

  it('the owner\'s board covers all 68 configurations (deliberate duplication - drift fails loudly)', () => {
    expect(Object.keys(ownersBoard.tiers).sort()).toEqual([...OWNERS_BOARD_EXPECTED_KEYS].sort())
  })

  it('3mbg-strength-solo-2025 covers exactly the 36 base spirits the video rates (deliberate duplication - drift fails loudly)', () => {
    expect(Object.keys(threeMbgStrengthSolo.tiers).sort()).toEqual([...THREE_MBG_EXPECTED_KEYS].sort())
  })

  it('3mbg-strength-solo-2025 never rates an aspect configId', () => {
    for (const configId of Object.keys(threeMbgStrengthSolo.tiers)) {
      expect(configId, `${configId} should not appear - 3MBG never covers aspects`).not.toContain('::')
    }
  })

  it('3mbg-strength-solo-2025 never rates Fathomless Mud of the Swamp', () => {
    expect('fathomless-mud-of-the-swamp' in threeMbgStrengthSolo.tiers).toBe(false)
  })

  describe('sia-favorites-fun-solo-2026 - the dash/"None" edge case', () => {
    // The source video marks six spirits with a dash rather than a letter (it rated only their
    // aspects, not the plain base). That is "the source declined to rate this", the same fact
    // an absent key always represents - so those six configIds must have NO key at all, not a
    // "None" tier. This is the edge case the owner supplied this list to test.
    const DASH_MAPPED_TO_ABSENT = [
      'river-surges-in-sunlight',
      'lightnings-swift-strike',
      'shadows-flicker-like-flame',
      'bringer-of-dreams-and-nightmares',
      'shifting-memory-of-ages',
      'shroud-of-silent-mist',
    ]

    it('never carries the literal string "None" as a tier value', () => {
      expect(Object.values(siaFavoritesFunSolo.tiers)).not.toContain('None')
    })

    it('omits the key entirely for every dash-marked base spirit', () => {
      for (const configId of DASH_MAPPED_TO_ABSENT) {
        expect(configId in siaFavoritesFunSolo.tiers, `${configId} should be absent, not "None"`).toBe(false)
      }
    })

    it('still rates that spirit\'s aspects even though its own base is unrated', () => {
      // river-surges-in-sunlight itself is absent, but the source did rate its three aspects.
      expect(siaFavoritesFunSolo.tiers['river-surges-in-sunlight::Travel']).toBe('A')
      expect(siaFavoritesFunSolo.tiers['river-surges-in-sunlight::Sunshine']).toBe('F')
      expect(siaFavoritesFunSolo.tiers['river-surges-in-sunlight::Haven']).toBe('B')
    })

    it('covers exactly 62 of 68 configurations (68 minus the 6 dash-marked bases)', () => {
      expect(Object.keys(siaFavoritesFunSolo.tiers)).toHaveLength(62)
    })

    it('uses only the four-band vocabulary the source actually printed (no C or D band)', () => {
      expect(siaFavoritesFunSolo.tierLabels).toEqual(['S', 'A', 'B', 'F'])
    })
  })
})
