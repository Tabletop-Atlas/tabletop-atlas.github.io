import type { Spirit } from '../../domain/types'
import { COMPLEXITY_LEVEL, EXPANSION_COLOR, tagColor, tagLabel } from './palette'

/** v5 #08 PROTOTYPE — Variant H: G, with two refinements the owner asked for after picking G.
 * (1) The expansion chip gets its own row - tags start on a fresh line below it, rather than
 * wrapping onto the same row, so "identity" (expansion) and "attributes" (tags) are visually
 * separated, not just styled differently within one run. (2) The complexity dots gain a text
 * label next to them (e.g. "●●○○ Moderate"), the same idiom Claude Code's own effort-level
 * picker uses - dots alone are a legend you have to learn, dots-plus-word are self-explanatory
 * on first look. */
export function VariantH({ spirits }: { spirits: Spirit[] }) {
  return (
    <ul className="tp-grid">
      {spirits.map((spirit) => {
        const level = COMPLEXITY_LEVEL[spirit.complexity]
        const expansionColor = EXPANSION_COLOR[spirit.expansion]
        return (
          <li key={spirit.id} className="tp-tile tp-tile-stripe" style={{ borderLeftColor: expansionColor }}>
            <div className="tp-name-row">
              <h3>{spirit.name}</h3>
              <span className="tp-complexity-dots" title={spirit.complexity}>
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={n <= level ? 'tp-dot tp-dot-filled' : 'tp-dot'} />
                ))}
                <span className="tp-complexity-label">{spirit.complexity}</span>
              </span>
            </div>
            <div className="tp-chip-row tp-chip-row-tight">
              <span className="tp-chip tp-chip-small" style={{ background: expansionColor }}>
                {spirit.expansion}
              </span>
            </div>
            <div className="tp-chip-row tp-chip-row-tags">
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
