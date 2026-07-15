import { useState } from 'react'
import { toConfigId } from '../domain/configurations'
import type { ExpansionName, Spirit } from '../domain/types'
import { SpiritArt } from './SpiritArt'
import { COMPLEXITY_LEVEL, EXPANSION_COLOR, tagColor, tagLabel } from './tagColors'
import { type TierBadgeVariant, tierBadgeProps } from './TierBadgeVariantRound'
import { activeConfigTier, tierColor } from './tierColors'

/** v5 #07c: Browse annotates (never hides, unless the caller already dropped it via
 * hard-filter) a spirit outside the collection - dimmed with a note, same treatment as the
 * tier board's tiles (#06/#07a). Aspects are gated independently (#06): an aspect line only gets
 * its own note when its expansion is excluded *and the spirit's own note isn't already saying
 * the same thing* - a spirit already dimmed and noted unowned doesn't need every aspect
 * repeating it, that's new information only when the aspect's exclusion is independent of the
 * spirit's. `excluded` is passed down rather than read per-aspect from `collectionStore` - the
 * caller already reads it once per render (Browser.tsx).
 *
 * v5 #08/#09: colour scheme decided via `/prototype` (variant H, screenshots in
 * `.scratch/v5/screenshots-08/`) - a left-edge stripe and a solid chip (same colour, verified
 * identical) carry the expansion; the complexity dots carry a text word next to them; playstyle
 * tags get their own outlined chips on a separate line below the expansion chip. */
export function SpiritTile({
  spirit,
  onSelect,
  owned,
  excluded,
  tierVariant,
}: {
  spirit: Spirit
  onSelect?: (spirit: Spirit) => void
  owned: boolean
  excluded: ReadonlySet<ExpansionName>
  /** #06: throwaway variant-round prop — delete alongside `TierBadgeVariantRound.tsx` on ship. */
  tierVariant?: TierBadgeVariant
}) {
  const [expanded, setExpanded] = useState(false)
  const level = COMPLEXITY_LEVEL[spirit.complexity]
  const expansionColor = EXPANSION_COLOR[spirit.expansion]
  const tier = activeConfigTier(toConfigId(spirit.id))
  const badge = tierVariant && tier ? tierBadgeProps(tierVariant, tierColor(tier.position)) : undefined

  return (
    <li
      className={owned ? 'spirit-tile' : 'spirit-tile spirit-tile-unowned'}
      style={{ borderLeftColor: expansionColor, ...badge?.tileStyle }}
    >
      <button
        type="button"
        className="spirit-tile-open"
        onClick={() => onSelect?.(spirit)}
        aria-label={`View ${spirit.name} details`}
      >
        <div className="spirit-tile-art-wrap">
          <SpiritArt spirit={spirit} />
          {badge && (
            <span className={badge.className} style={badge.style}>
              {tier?.label}
            </span>
          )}
        </div>
        <div className="spirit-tile-name-row">
          <h3>{spirit.name}</h3>
          <span className="spirit-tile-complexity" title={spirit.complexity}>
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={n <= level ? 'spirit-tile-dot spirit-tile-dot-filled' : 'spirit-tile-dot'} />
            ))}
            <span className="spirit-tile-complexity-label">{spirit.complexity}</span>
          </span>
        </div>
      </button>
      <div className="spirit-tile-chip-row">
        <span className="spirit-tile-chip" style={{ background: expansionColor }}>
          {spirit.expansion}
        </span>
        {!owned && <span className="unowned-note"> · not in your collection</span>}
      </div>
      {spirit.tags.length > 0 && (
        <div className="spirit-tile-chip-row spirit-tile-tags">
          {spirit.tags.map((tag) => (
            <span key={tag} className="spirit-tile-tag-chip" style={{ borderColor: tagColor(tag), color: tagColor(tag) }}>
              {tagLabel(tag)}
            </span>
          ))}
        </div>
      )}
      <p>{spirit.summary}</p>

      {spirit.aspects.length > 0 && (
        <>
          <button type="button" onClick={() => setExpanded((e) => !e)}>
            {expanded ? 'Hide' : 'Show'} aspects ({spirit.aspects.length})
          </button>
          {expanded && (
            <ul className="aspects">
              {spirit.aspects.map((aspect) => (
                <li key={aspect.name}>
                  <strong>{aspect.name}:</strong>{' '}
                  {aspect.delta ?? <em className="meta">effect not transcribed yet</em>}
                  {owned && excluded.has(aspect.expansion) && <span className="unowned-note"> · not in your collection</span>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  )
}
