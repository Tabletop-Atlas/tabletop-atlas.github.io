/**
 * Central keyed glossary map. Every entry restates an in-repo definition (CONTEXT.md or a
 * classifier/data rule) and carries a `source`. A tripwire (`glossaryCanon.test.ts`) fails the
 * build on empty text or a bad source — the same discipline as `aspectCanon`. Terms with no
 * in-repo source are omitted and listed as an owner TODO; never invented.
 */
export type GlossarySource = 'context' | 'owner' | 'wiki'

export interface GlossaryEntry {
  text: string
  source: GlossarySource
}

export const GLOSSARY_SOURCES: readonly GlossarySource[] = ['context', 'owner', 'wiki']

export const GLOSSARY: Record<string, GlossaryEntry> = {
  // Impact (fear) — CONTEXT.md "Impact (fear)": three-level ordinal of how strongly a fear
  // card helps the players; every fear card is good.
  'impact-weak': {
    text: 'Impact 1 of 3 (weak) — how strongly this fear card helps the players. Every fear card is good; impact is how much, never whether.',
    source: 'context',
  },
  'impact-solid': {
    text: 'Impact 2 of 3 (solid) — how strongly this fear card helps the players. Every fear card is good; impact is how much, never whether.',
    source: 'context',
  },
  'impact-strong': {
    text: 'Impact 3 of 3 (strong) — how strongly this fear card helps the players. Every fear card is good; impact is how much, never whether.',
    source: 'context',
  },

  // Valence (event) — CONTEXT.md "Valence (event)".
  'valence-harmful': {
    text: 'Bad for the players. Valence is whether an event card helps or hurts — judged per card.',
    source: 'context',
  },
  'valence-mixed': {
    text: 'Neither clearly good nor bad — the honest rating for condition-dependent and choice cards, not a fallback.',
    source: 'context',
  },
  'valence-beneficial': {
    text: 'Good for the players. Valence is whether an event card helps or hurts — judged per card.',
    source: 'context',
  },

  // Fear tags — CONTEXT.md "Card sub-type" + otherCardClassifier keyword rules. What a card
  // does, never how good it is; multi-tag; keyword-derived.
  'fear-tag-removal': {
    text: "Removes or destroys Invaders. One of five keyword-derived fear tags — what the card does, never how good it is; a card can carry several as terror level rises.",
    source: 'context',
  },
  'fear-tag-defensive': {
    text: "Defends lands ('Defend N'), preventing damage. One of five keyword-derived fear tags — what the card does, never how good it is; a card can carry several as terror level rises.",
    source: 'context',
  },
  'fear-tag-weaken': {
    text: 'Adds Strife, or exploits Strife already placed. One of five keyword-derived fear tags — what the card does, never how good it is; a card can carry several as terror level rises.',
    source: 'context',
  },
  'fear-tag-disruption': {
    text: "Interrupts invader actions — Isolate, skipped Explores/Builds, or 'does not' effects. One of five keyword-derived fear tags — what the card does, never how good it is; a card can carry several as terror level rises.",
    source: 'context',
  },
  'fear-tag-displacement': {
    text: 'Pushes or gathers Invaders between lands. One of five keyword-derived fear tags — what the card does, never how good it is; a card can carry several as terror level rises.',
    source: 'context',
  },
  'fear-tag-unclassified': {
    text: 'No keyword matched — an empty tag set is Unclassified, never forced into a nearest bucket.',
    source: 'context',
  },
}

export function glossaryEntry(id: string): GlossaryEntry | undefined {
  return GLOSSARY[id]
}
