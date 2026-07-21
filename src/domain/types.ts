export const COMPLEXITIES = ['Low', 'Moderate', 'High', 'Very High'] as const

export type Complexity = (typeof COMPLEXITIES)[number]

export const LIST_TYPES = ['strength', 'fun'] as const

export type TierListType = (typeof LIST_TYPES)[number]

/** What a tier list ranks (#12/ADR 0002). The subject defines the id namespace of the list's
 * tier keys — `configurations` keys are configIds; the card subjects key power-card names —
 * and is the seam where a future game would plug in. No `game` field, deliberately. */
export const TIER_LIST_SUBJECTS = ['configurations', 'minor-powers', 'major-powers'] as const

export type TierListSubject = (typeof TIER_LIST_SUBJECTS)[number]

export interface SourceCitation {
  author: string
  title: string
  url: string
  published?: string
  retrievedAt: string
  method: string
}

/**
 * A tier list is a cited document, not a table of opinions: an author, a type, a player count
 * it was made for, its own tier vocabulary, and a partial set of ratings. Contract published at
 * `.scratch/v3/tier-list-schema.md`.
 *
 * `tiers` maps a subject-namespace key -> label. An absent key means the source never rated
 * that entity — never null, never a default, never inherited from another list.
 */
export interface TierList {
  id: string
  name: string
  type: TierListType
  /** The id namespace `tiers` keys live in. Every list declares one; see TIER_LIST_SUBJECTS. */
  subject: TierListSubject
  /** The player count the source ranked FOR. Absent = source never said. Never inferred. */
  players?: number
  /** cited => immutable in-app; personal => editable. */
  origin: 'cited' | 'personal'
  /** This list's own vocabulary, strongest first. Rank is a label's position in this array. */
  tierLabels: string[]
  methodology: string
  /** Required when origin is 'cited'. */
  source?: SourceCitation
  /** false until a human has checked the list against its source. */
  verified: boolean
  tiers: Record<string, string>
  /** configIds the source rated but the scraper wasn't confident in. */
  uncertain?: string[]
  /** Names the source used that could not be resolved to a configId. */
  unresolved?: { heard: string; at?: string }[]
}

export interface OCFDU {
  offense: number
  control: number
  fear: number
  defense: number
  utility: number
}

/**
 * v5 #06: the canonical expansion names, one checkbox per entry in the collection. Sourced from
 * `spirits.json`'s own expansion strings, which already use these names verbatim - cards' raw
 * expansion strings differ (`Basegame`, `Horizons of Spirit Island`, `Promo2`) and are mapped onto
 * this canonical set where the collection needs to reach cards (#07c), not here.
 *
 * qa-revision #02 (owner call, 2026-07-21): `Promo` is no longer canonical. Feather & Flame is
 * the retail box that combined Promo Packs 1 and 2 (wiki-verified), so promo content lives under
 * it; the raw string `Promo` now resolves via `EXPANSION_ALIASES`, like every other promo spelling.
 */
export const EXPANSIONS = ['Base', 'Branch & Claw', 'Feather & Flame', 'Horizons', 'Jagged Earth', 'Nature Incarnate'] as const
export type ExpansionName = (typeof EXPANSIONS)[number]

/** Printed on the aspect card as an up/level/down arrow. */
export type ComplexityDelta = 'up' | 'same' | 'down'

export interface Aspect {
  name: string
  /** One-line effect, transcribed from the aspect card. Absent until transcribed. */
  delta?: string
  /** Fact: the complexity arrow printed on the card. */
  complexityDelta?: ComplexityDelta
  /**
   * Judgment: which OCFDU axis the card's rules text pushes the spirit toward, e.g. "+utility".
   * Not a full OCFDU delta. Absent where the card changes economy or tempo rather than an
   * axis — the aspect nudge stays silent for those, because silence beats a guess.
   */
  shiftsToward?: string
  /** The aspect exists (wiki-verified) but its effect has not been transcribed yet. */
  reviewNeeded?: boolean
  /** v5 #06: which expansion's box the aspect deck ships in - independent of the base spirit's
   * own expansion (an aspect can ship in a later box than its spirit). Sourced live against
   * spiritislandwiki.com's aspect list, not the asset archive's incidental filename suffixes -
   * see #06's Comments for why that would have mis-tagged 2 of the 31 aspects. */
  expansion: ExpansionName
}

/** The eight canonical Spirit Island elements. */
export const ELEMENTS = ['Sun', 'Moon', 'Fire', 'Air', 'Water', 'Earth', 'Plant', 'Animal'] as const

export type Element = (typeof ELEMENTS)[number]

interface PowerCardBase {
  name: string
  /** `set` on the source card object — a `ProductSet` enum value, e.g. "Basegame", "Jagged Earth". */
  expansion: string
  cost: number
  speed: 'Fast' | 'Slow'
  elements: Element[]
  /** Path under `public/`, e.g. "cards/minor/steam_vents.webp". */
  image: string
}

export type PowerCard =
  | (PowerCardBase & { kind: 'minor' })
  | (PowerCardBase & { kind: 'major' })
  | (PowerCardBase & { kind: 'unique'; spirit: string; spiritName: string })

/** v5 #02: the 5 upstream event classes, carried through as-is — source data, not judgment. */
export const EVENT_CLASSES = ['choice', 'stage', 'terrorLevel', 'healthyBlightedLand', 'adversary'] as const
export type EventClass = (typeof EVENT_CLASSES)[number]

/**
 * v5 #02: fear's sub-type buckets — keyword-derived from the card's own `level1/2/3` text.
 * A card may carry more than one (its effect can cross buckets as terror level scales up).
 */
export const FEAR_TAGS = ['removal', 'defensive', 'weaken', 'disruption', 'displacement'] as const
export type FearTag = (typeof FEAR_TAGS)[number]

/**
 * v5 #02: blight's sub-type buckets — keyword-derived, multi-tag, and judgment data (like
 * `shiftsToward`): the bucket boundaries are a coarser read of the text than fear's. The
 * "aggressive/less aggressive" axis the owner first asked for was dropped — no honest descriptive
 * equivalent exists; it would be rating cards, out of scope for this repo.
 */
export const BLIGHT_TAGS = ['presenceLoss', 'boardChange', 'damageBonus', 'resourceSwing'] as const
export type BlightTag = (typeof BLIGHT_TAGS)[number]

/**
 * Fear, event and blight cards (v4 #01/#13) — the 139 cards outside `PowerCard`. #01 found none
 * of them carry elements, cost or speed, so `OtherCard` does not carry those fields either; a
 * missing field here is a fact about the card, not a gap in extraction.
 *
 * A discriminated union rather than one shape with optional fields (v5 #03): a fear bucket is not
 * a blight bucket, and the type system should say so — `card.tags` on an event card is a compile
 * error, not a field that happens to be empty. An empty `tags` array means no keyword rule
 * matched (v5 #02's "Unclassified"), never a forced nearest-bucket guess.
 */
export type OtherCard =
  | { name: string; expansion: string; kind: 'fear'; image: string; tags: FearTag[] }
  | { name: string; expansion: string; kind: 'event'; image: string; eventClass: EventClass }
  // `tagsSource: 'judgment'` is in the data itself, not just a doc comment - same discipline as
  // `ratingsSource` on Spirit, so anyone reading other-cards.json in a year sees the provenance
  // without reading this file.
  | { name: string; expansion: string; kind: 'blight'; image: string; tags: BlightTag[]; tagsSource: 'judgment' }

export interface Spirit {
  id: string
  name: string
  expansion: ExpansionName
  complexity: Complexity
  ratings: OCFDU
  elements: Element[]
  summary: string
  tags: string[]
  aspects: Aspect[]
  notes?: string
  image?: string
  /** Absent means the OCFDU came off the printed reference sheet. "estimate" means nobody has verified them. */
  ratingsSource?: 'estimate'
  reviewNeeded?: boolean
  /** The four starting Unique Power Card names, in panel order, read off the spirit's panel
   * front. Nothing else about a card (cost, speed, range, target, element, effect) is recorded
   * here - see #11. Absent means the panel could not be sourced; a partial array is never
   * shipped, so #12 can safely map card image n to this array's index n. */
  startingCards?: string[]
}

/**
 * deck-dashboard #15: one spirit's innate power, sourced from the wiki's raw wikitext
 * `{{Threshold|...}}` templates and cross-checked against the on-disk TTS mod JSON's
 * element-count strings (panel images are the tiebreaker on a mismatch - none arose across all
 * 37 spirits). Effect text, range, and target are deliberately omitted: omitting is safer than
 * paraphrasing, and only element counts matter for the gap-odds annotations this feeds (#16).
 * Spirits only; aspect modifications are a marked future extension.
 */
export interface InnatePower {
  /** `Spirit['id']`. */
  spirit: string
  name: string
  speed: 'Fast' | 'Slow'
  /** Ordered ascending (the panel's top-to-bottom order); each entry only keys the elements it
   * requires - an element absent from a threshold contributes nothing to it. */
  thresholds: Partial<Record<Element, number>>[]
  source: 'wiki+tts'
}
