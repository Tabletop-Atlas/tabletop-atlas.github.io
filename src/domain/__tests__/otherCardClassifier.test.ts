import { describe, expect, it } from 'vitest'
import { classifyBlight, classifyFear, eventClassFromConstructorName, explainBlight, explainFear } from '../otherCardClassifier'

describe('classifyFear', () => {
  it('tags removal from "removes"/"destroys" phrasing', () => {
    expect(classifyFear('Each player removes 1 Explorer / Town from a land with SacredSite.')).toContain('removal')
    expect(classifyFear('Each Town destroys 1 Explorer in its land.')).toContain('removal')
  })

  it('tags defensive from "Defend N"', () => {
    expect(classifyFear('Defend 2 in all lands with Presence.')).toContain('defensive')
  })

  it('tags weaken from Strife phrasing, not from Strife as a listed trigger condition', () => {
    expect(classifyFear('Each player adds 1 Strife to a Town.')).toContain('weaken')
    expect(classifyFear('Each Invader takes 1 Damage per Strife it has.')).toContain('weaken')
    // Beset by Many Troubles: Strife is one of several trigger tokens, not an added effect.
    expect(classifyFear('In each land with Badlands / Beasts / Disease / Wilds / Strife, Defend 3.')).not.toContain('weaken')
  })

  it('tags disruption from Isolate / skip Explore-Build / "does not affect"', () => {
    expect(classifyFear('On Each Board: Isolate one land.')).toContain('disruption')
    expect(classifyFear('During the next normal Explore, skip the lowest-numbered land.')).toContain('disruption')
    expect(classifyFear('Explore does not affect Coastal lands.')).toContain('disruption')
    expect(classifyFear('Invaders do not Build in lands with Dahan.')).toContain('disruption')
  })

  it('tags displacement from Push/Gather', () => {
    expect(classifyFear('Each player may Push up to 2 Explorer from an Inland land.')).toContain('displacement')
    expect(classifyFear('Each player may Gather 1 Explorer into a land with Town / City.')).toContain('displacement')
  })

  it('a card can carry more than one tag (Belief Takes Root crosses buckets by level)', () => {
    const combined = [
      'Defend 2 in all lands with Presence.',
      'Defend 2 in all lands with Presence. Each Spirit gains 1 Energy per SacredSite they have in lands with Invaders.',
      'Each player chooses a different land and removes up to 2 Health worth of Invaders per Presence there.',
    ].join(' ')
    expect(classifyFear(combined)).toEqual(expect.arrayContaining(['defensive', 'removal']))
  })

  it('returns no tags for text that matches nothing (the honest "Unclassified" case)', () => {
    expect(classifyFear('Nothing here matches any known bucket at all.')).toEqual([])
  })

  it('explainFear reports the literal matched phrase per tag', () => {
    const explanation = explainFear('Defend 2 in all lands with Presence.')
    expect(explanation.defensive).toBe('Defend')
  })
})

describe('classifyBlight', () => {
  it('tags presenceLoss from destroy/remove/replace + Presence, including the source typo "resence"', () => {
    expect(classifyBlight('At the start of each Invader Phase each Spirit destroys 1 of their Presence.')).toContain(
      'presenceLoss',
    )
    expect(classifyBlight('Immediately, destroy 3 resence from each Spirit.')).toContain('presenceLoss')
    expect(classifyBlight('Each Spirit Replaces 1 Presence with their chosen type of Spirit Token.')).toContain('presenceLoss')
  })

  it('tags boardChange from add/Build/Replace + a board token, including the unspaced typo "1Blight"', () => {
    expect(classifyBlight('Add 1 Town and 1 City to an Inland land with no Town / City.')).toContain('boardChange')
    expect(classifyBlight('Destroy 1 Beasts, then add 1Blight to a land with Town / City.')).toContain('boardChange')
  })

  it('tags damageBonus from Ravage + Damage', () => {
    expect(classifyBlight('Ongoing, starting next turn: During Ravage Actions, Invaders deal +2 Damage (per land).')).toContain(
      'damageBonus',
    )
  })

  it('tags resourceSwing from Energy/Card Play/Power Card/draw', () => {
    expect(classifyBlight('Every Spirit Phase each Spirit gains +1 Energy and +1 Card Play.')).toContain('resourceSwing')
    expect(classifyBlight('Immediately, draw 1 Minor Power Card per player plus 1 more.')).toContain('resourceSwing')
  })

  it('does not invent an "aggressive" tag - only the four descriptive buckets exist', () => {
    const tags = classifyBlight('Immediately, on each board: Add 1 Town and 1 City to an Inland land with no Town / City.')
    expect(tags.every((t) => ['presenceLoss', 'boardChange', 'damageBonus', 'resourceSwing'].includes(t))).toBe(true)
  })

  it('returns no tags for text that matches nothing (the honest "Unclassified" case)', () => {
    expect(classifyBlight('Nothing here matches any known bucket at all.')).toEqual([])
  })

  it('explainBlight reports the literal matched phrase per tag', () => {
    const explanation = explainBlight('Immediately, destroy 3 resence from each Spirit.')
    expect(explanation.presenceLoss).toContain('destroy')
  })
})

describe('eventClassFromConstructorName', () => {
  it('maps each of the five upstream classes to its event class', () => {
    expect(eventClassFromConstructorName('ChoiceEventCard')).toBe('choice')
    expect(eventClassFromConstructorName('StageEventCard')).toBe('stage')
    expect(eventClassFromConstructorName('TerrorLevelEventCard')).toBe('terrorLevel')
    expect(eventClassFromConstructorName('HealthyBlightedLandEventCard')).toBe('healthyBlightedLand')
    expect(eventClassFromConstructorName('AdversaryEvent')).toBe('adversary')
  })

  it('throws rather than guessing on an unknown constructor', () => {
    expect(() => eventClassFromConstructorName('SomeNewCardType')).toThrow()
  })
})
