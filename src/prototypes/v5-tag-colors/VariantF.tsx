import type { Spirit } from '../../domain/types'
import { COMPLEXITY_LEVEL, EXPANSION_COLOR, tagColor, tagLabel } from './palette'

/** v5 #08 PROTOTYPE — Variant F: "stripe for expansion, outlined chips for tags." Same idea as
 * E - stripe stays the only expansion signal, tags get their own distinct chip vocabulary - but
 * lighter-weight: an outlined pill (coloured border + coloured text, transparent fill) instead of
 * E's solid fill, so a spirit with 3 tags doesn't turn into a wall of solid colour blocks. Tests
 * whether the lighter chip still reads as clearly "a chip" (bounded, tag-shaped) rather than
 * regressing to C/D's plain-text problem. */
export function VariantF({ spirits }: { spirits: Spirit[] }) {
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
            <p className="tp-tag-line">{spirit.expansion}</p>
            <div className="tp-chip-row tp-chip-row-tight">
              {spirit.tags.map((tag) => (
                <span key={tag} className="tp-chip-outline" style={{ borderColor: tagColor(tag), color: tagColor(tag) }}>
                  {tagLabel(tag)}
                </span>
              ))}
            </div>
            <p>{spirit.summary}</p>
          </li>
        )
      })}
    </ul>
  )
}
