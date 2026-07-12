import type { BlightTag, EventClass, FearTag } from './types'

/**
 * v5 #02/#03: deterministic keyword rules over the card's real rules text — never a model reading
 * a card. Every tag traces back to one of these patterns matching a literal substring of the
 * text; `explainFear`/`explainBlight` return that substring so it can be spot-checked by hand.
 *
 * The rule set itself is judgment (a human's reading of what a phrase implies), same footing as
 * `shiftsToward`/`ratingsSource` elsewhere in this repo — it is not read off the source, it is
 * authored here. Fear's buckets are keyword-derived but fairly clear-cut; blight's are a coarser
 * read of more heterogeneous text (v5 #02), which is why blight's field is documented as judgment
 * data on `OtherCard` while fear's is not.
 *
 * The upstream source (sick.oberien.de/cards.js) has a couple of literal typos in its rules text
 * ("resence" for "Presence", "1Blight" with no space) — these rules match on substrings rather
 * than whole words for the target nouns so a real typo doesn't silently fail to classify.
 */
const FEAR_RULES: { tag: FearTag; pattern: RegExp }[] = [
  { tag: 'removal', pattern: /\b(remov\w*|destroy\w*)\b/i },
  { tag: 'defensive', pattern: /\bDefend\b/i },
  { tag: 'weaken', pattern: /\badds?\s+\d+\s*Strife\b|\bper\s+Strife\b|\bwith\s+Strife\b/i },
  { tag: 'disruption', pattern: /\bIsolate\b|\bskip\b|\bdoes not affect\b|\bdo(es)?\s+not\s+(Explore|Build|act|Ravage)\b/i },
  { tag: 'displacement', pattern: /\bPush(es)?\b|\bGather(s)?\b/i },
]

const BLIGHT_RULES: { tag: BlightTag; pattern: RegExp }[] = [
  // "resence" catches both "Presence" (substring) and the source's own typo for it.
  { tag: 'presenceLoss', pattern: /\b(destroy\w*|remov\w*|replac\w*)\b[\s\S]*resence|resence[\s\S]*\b(destroy\w*|remov\w*|replac\w*)\b/i },
  { tag: 'boardChange', pattern: /\b(adds?|Build|Replac\w*)\b[\s\S]*(Town|City|Dahan|Blight)/i },
  { tag: 'damageBonus', pattern: /\bRavage\b[\s\S]*Damage|Damage[\s\S]*\bRavage\b/i },
  { tag: 'resourceSwing', pattern: /\bEnergy\b|\bCard Play\b|\bPower Card\b|\bdraw\b/i },
]

const EVENT_CLASS_BY_CONSTRUCTOR: Record<string, EventClass> = {
  ChoiceEventCard: 'choice',
  StageEventCard: 'stage',
  TerrorLevelEventCard: 'terrorLevel',
  HealthyBlightedLandEventCard: 'healthyBlightedLand',
  AdversaryEvent: 'adversary',
}

function firstMatch(text: string, pattern: RegExp): string | undefined {
  return pattern.exec(text)?.[0]
}

/** Fear's tags, derived from the card's own level1/2/3 text (levels concatenated, not just one). */
export function classifyFear(levelText: string): FearTag[] {
  return FEAR_RULES.filter((rule) => rule.pattern.test(levelText)).map((rule) => rule.tag)
}

/** The matched phrase per tag, for the "print the trace" acceptance criterion. */
export function explainFear(levelText: string): Partial<Record<FearTag, string>> {
  const out: Partial<Record<FearTag, string>> = {}
  for (const rule of FEAR_RULES) {
    const match = firstMatch(levelText, rule.pattern)
    if (match) out[rule.tag] = match
  }
  return out
}

/** Blight's tags, derived from the card's `effect` text (not `description`, which appends
 * boilerplate about Blight-per-player that would spuriously match every card). */
export function classifyBlight(effectText: string): BlightTag[] {
  return BLIGHT_RULES.filter((rule) => rule.pattern.test(effectText)).map((rule) => rule.tag)
}

export function explainBlight(effectText: string): Partial<Record<BlightTag, string>> {
  const out: Partial<Record<BlightTag, string>> = {}
  for (const rule of BLIGHT_RULES) {
    const match = firstMatch(effectText, rule.pattern)
    if (match) out[rule.tag] = match
  }
  return out
}

/** Source data, not judgment: the upstream class already draws the line the owner asked for. */
export function eventClassFromConstructorName(constructorName: string): EventClass {
  const eventClass = EVENT_CLASS_BY_CONSTRUCTOR[constructorName]
  if (!eventClass) throw new Error(`unknown event constructor: ${constructorName}`)
  return eventClass
}
