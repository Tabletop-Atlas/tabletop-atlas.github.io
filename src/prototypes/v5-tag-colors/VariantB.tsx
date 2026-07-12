import type { Spirit } from '../../domain/types'
import { COMPLEXITY_LEVEL, EXPANSION_COLOR, tagColor, tagLabel } from './palette'

/** v5 #08 PROTOTYPE — Variant B: "badge + dots, tags as text". Expansion and complexity fuse
 * into one compact badge - expansion sets the badge's hue (categorical), complexity is drawn as
 * filled dots inside it (●●○○, ordinal - a difficulty-pip idiom, not a hue). Playstyle tags stay
 * outside the badge as small plain-text labels, only their leading dot coloured, so "fact"
 * (what box, how hard) is visually heavier than "flavour" (playstyle). Tests: does separating the
 * two kinds of information reduce noise instead of just moving it. */
export function VariantB({ spirits }: { spirits: Spirit[] }) {
  return (
    <ul className="tp-grid">
      {spirits.map((spirit) => {
        const level = COMPLEXITY_LEVEL[spirit.complexity]
        return (
          <li key={spirit.id} className="tp-tile">
            <h3>{spirit.name}</h3>
            <div className="tp-badge-row">
              <span className="tp-badge" style={{ background: EXPANSION_COLOR[spirit.expansion] }}>
                {spirit.expansion}
                <span className="tp-badge-dots">
                  {[1, 2, 3, 4].map((n) => (
                    <span key={n} className={n <= level ? 'tp-dot tp-dot-filled' : 'tp-dot'} />
                  ))}
                </span>
              </span>
              <span className="tp-tags-inline">
                {spirit.tags.map((tag, i) => (
                  <span key={tag} className="tp-tag-text">
                    {i > 0 && ' · '}
                    <span className="tp-tag-dot" style={{ background: tagColor(tag) }} />
                    {tagLabel(tag)}
                  </span>
                ))}
              </span>
            </div>
            <p>{spirit.summary}</p>
          </li>
        )
      })}
    </ul>
  )
}
