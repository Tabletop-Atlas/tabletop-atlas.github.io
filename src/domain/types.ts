export const COMPLEXITIES = ['Low', 'Moderate', 'High', 'Very High'] as const

export type Complexity = (typeof COMPLEXITIES)[number]

export const LIST_TYPES = ['strength', 'fun'] as const

export type TierListType = (typeof LIST_TYPES)[number]

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
 * `tiers` maps configId -> label. An absent key means the source never rated that configuration
 * — never null, never a default, never inherited from another list.
 */
export interface TierList {
  id: string
  name: string
  type: TierListType
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
  expansion: string
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
