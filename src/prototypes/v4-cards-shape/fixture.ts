import spiritsData from '../../data/spirits.json'
import raw from './fixture.json'

/** v4 #04 PROTOTYPE — throwaway fixture. 36 real cards spread across power (minor/major/unique),
 * fear, event and blight, pulled from the same source #01 verified (oberien/spirit-island-card-katalog's
 * DB.CARDS) and joined to the real archive images copied into public/_prototype-04/cards/. Not a
 * dataset for #11 to build on - it exists only so this prototype isn't judged on fake cards. */
export interface ProtoCard {
  name: string
  type: 'minor' | 'major' | 'unique' | 'fear' | 'event' | 'blight'
  expansion: string
  cost: number | null
  speed: 'Fast' | 'Slow' | null
  elements: string[] | null
  spirit: string | null
  image: string
}

const spiritNameById = new Map(spiritsData.map((s) => [s.id, s.name]))

export const PROTO_CARDS: (ProtoCard & { spiritName: string | null })[] = (raw as ProtoCard[]).map((c) => ({
  ...c,
  spiritName: c.spirit ? (spiritNameById.get(c.spirit) ?? c.spirit) : null,
}))
