export const COMPLEXITIES = ['Low', 'Moderate', 'High', 'Very High'] as const

export type Complexity = (typeof COMPLEXITIES)[number]

/** Tier vocabulary, strongest first. Matches the owner's source tier list (X sits above S). */
export const TIERS = ['X', 'S', 'A', 'B', 'C', 'D', 'F'] as const

export type Tier = (typeof TIERS)[number]

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
}
