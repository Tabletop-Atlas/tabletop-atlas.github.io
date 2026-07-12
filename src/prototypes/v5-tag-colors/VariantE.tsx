import type { Spirit } from '../../domain/types'
import { COMPLEXITY_LEVEL, EXPANSION_COLOR, tagColor, tagLabel } from './palette'

/** v5 #08 PROTOTYPE — Variant E: "stripe for expansion, solid chips for tags." Owner feedback on
 * the first round: A/B's chip styling for tags was good, but C/D's plain coloured *text* for tags
 * read as the same kind of thing as a coloured expansion name - no visual boundary between "this
 * is an expansion" and "this is a playstyle tag." This keeps C's liked stripe (expansion stays
 * peripheral, on the edge, name stays plain white) but brings back A's solid pill chips - just
 * for tags, not for expansion/complexity, so the eye reads two clearly different vocabularies:
 * a stripe is provenance, a chip is a fact about how the spirit plays. */
export function VariantE({ spirits }: { spirits: Spirit[] }) {
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
                <span key={tag} className="tp-chip tp-chip-small" style={{ background: tagColor(tag) }}>
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
