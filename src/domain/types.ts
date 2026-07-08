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
  delta: string
  /** Lightweight axis hint derived from the wiki, e.g. "+utility". Not a full OCFDU delta. */
  shiftsToward?: string
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
