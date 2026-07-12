import type { Spirit } from '../../domain/types'
import { COMPLEXITY_LEVEL, EXPANSION_COLOR, EXPANSION_TEXT_COLOR, tagLabel, tagTextColor } from './palette'

/** v5 #08 PROTOTYPE — Variant D: "C, but the name itself carries the expansion colour too."
 * Owner follow-up after seeing C: does colouring the whole spirit name (not just the edge
 * stripe) read as reinforcement or as noise/harder-to-read text? Identical to C in every other
 * respect - same stripe, same complexity dots, same tag-text line - so this is a true minimal-
 * diff comparison, not a new structural idea. Judge C and D back to back. */
export function VariantD({ spirits }: { spirits: Spirit[] }) {
  return (
    <ul className="tp-grid">
      {spirits.map((spirit) => {
        const level = COMPLEXITY_LEVEL[spirit.complexity]
        return (
          <li key={spirit.id} className="tp-tile tp-tile-stripe" style={{ borderLeftColor: EXPANSION_COLOR[spirit.expansion] }}>
            <div className="tp-name-row">
              <h3 style={{ color: EXPANSION_TEXT_COLOR[spirit.expansion] }}>{spirit.name}</h3>
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
