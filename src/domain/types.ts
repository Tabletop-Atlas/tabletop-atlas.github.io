export type Complexity = 'Low' | 'Moderate' | 'High' | 'Very High'

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D'

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

export interface Spirit {
  id: string
  name: string
  expansion: string
  complexity: Complexity
  ratings: OCFDU
  elements: string[]
  summary: string
  tags: string[]
  aspects: Aspect[]
  notes?: string
  image?: string
  reviewNeeded?: boolean
}
