import { describe, expect, it } from 'vitest'
import ownersBoard from '../../data/tier-lists/owners-board.json'
import spiritsData from '../../data/spirits.json'
import { expand } from '../configurations'
import type { Spirit, TierList } from '../types'

const spirits = spiritsData as Spirit[]
const configIds = new Set(expand(spirits).map((c) => c.configId))

/** Every shipped tier list. Extend this array as new lists land (#08 and onward) - this test
 * is the tripwire that keeps every one of them honest, modelled on `aspectCanon.test.ts`. */
const SHIPPED_LISTS: TierList[] = [ownersBoard as TierList]

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
})
