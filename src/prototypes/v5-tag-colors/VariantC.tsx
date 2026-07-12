import type { Spirit } from '../../domain/types'
import { COMPLEXITY_LEVEL, EXPANSION_COLOR, tagLabel, tagTextColor } from './palette'

/** v5 #08 PROTOTYPE — Variant C: "accent stripe, colour as wayfinding, not decoration". No
 * chips at all. Expansion becomes a thin coloured stripe down the tile's left edge (categorical,
 * peripheral - you learn to recognise "this is a Jagged Earth spirit" the way a book's spine
 * colour works, without it competing with the name). Complexity becomes a small dot-ramp next to
 * the name (ordinal, same idiom as B but tiny). Playstyle tags are plain inline text, each word
 * individually coloured, joined by " · " under the name - present but deliberately the lowest-
 * weight of the three variants. Tests the opposite end of the spectrum from A: how little colour
 * can carry the same information. */
export function VariantC({ spirits }: { spirits: Spirit[] }) {
  return (
    <ul className="tp-grid">
      {spirits.map((spirit) => {
        const level = COMPLEXITY_LEVEL[spirit.complexity]
        return (
          <li key={spirit.id} className="tp-tile tp-tile-stripe" style={{ borderLeftColor: EXPANSION_COLOR[spirit.expansion] }}>
            <div className="tp-name-row">
              <h3>{spirit.name}</h3>
              <span className="tp-complexity-dots" title={spirit.complexity}>
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={n <= level ? 'tp-dot tp-dot-filled' : 'tp-dot'} />
                ))}
              </span>
            </div>
            <p className="tp-tag-line">
              {spirit.expansion}
              {spirit.tags.length > 0 && ' · '}
              {spirit.tags.map((tag, i) => (
                <span key={tag}>
                  {i > 0 && ' · '}
                  <span style={{ color: tagTextColor(tag) }}>{tagLabel(tag)}</span>
                </span>
              ))}
            </p>
            <p>{spirit.summary}</p>
          </li>
        )
      })}
    </ul>
  )
}
