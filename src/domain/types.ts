export type Complexity = 'Low' | 'Moderate' | 'High' | 'Very High'

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

export interface Aspect {
  name: string
  /** One-line description of how the aspect changes play. Absent until transcribed from the card. */
  delta?: string
  /**
   * Lightweight axis hint, e.g. "+utility". Not a full OCFDU delta.
   * Absent means the aspect nudge will not fire for it — silence beats a guess.
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
