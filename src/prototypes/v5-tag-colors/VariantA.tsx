import type { Spirit } from '../../domain/types'
import { EXPANSION_COLOR, complexityColor, tagColor, tagLabel } from './palette'

/** v5 #08 PROTOTYPE — Variant A: "chip row". Expansion, complexity, and every playstyle tag
 * render as equal-weight pill chips in one wrapping row under the name. Tests: does treating all
 * three axes as the same kind of thing (a chip) read as noise, and how many chips fit at 375px. */
export function VariantA({ spirits }: { spirits: Spirit[] }) {
  return (
    <ul className="tp-grid">
      {spirits.map((spirit) => (
        <li key={spirit.id} className="tp-tile">
          <h3>{spirit.name}</h3>
          <div className="tp-chip-row">
            <span className="tp-chip" style={{ background: EXPANSION_COLOR[spirit.expansion] }}>
              {spirit.expansion}
            </span>
            <span className="tp-chip" style={{ background: complexityColor(spirit.complexity) }}>
              {spirit.complexity}
            </span>
            {spirit.tags.map((tag) => (
              <span key={tag} className="tp-chip" style={{ background: tagColor(tag) }}>
                {tagLabel(tag)}
              </span>
            ))}
          </div>
          <p>{spirit.summary}</p>
        </li>
      ))}
    </ul>
  )
}
