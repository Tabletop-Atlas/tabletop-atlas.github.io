import { useState } from 'react'
import type { ExpansionName } from '../domain/types'
import type { Spirit } from '../domain/types'
import { SpiritArt } from './SpiritArt'

/** v5 #07c: Browse annotates (never hides, unless the caller already dropped it via
 * hard-filter) a spirit outside the collection - dimmed with a note, same treatment as the
 * tier board's tiles (#06/#07a). Aspects are gated independently (#06): an aspect line only gets
 * its own note when its expansion is excluded *and the spirit's own note isn't already saying
 * the same thing* - a spirit already dimmed and noted unowned doesn't need every aspect
 * repeating it, that's new information only when the aspect's exclusion is independent of the
 * spirit's. `excluded` is passed down rather than read per-aspect from `collectionStore` - the
 * caller already reads it once per render (Browser.tsx). */
export function SpiritTile({
  spirit,
  onSelect,
  owned,
  excluded,
}: {
  spirit: Spirit
  onSelect?: (spirit: Spirit) => void
  owned: boolean
  excluded: ReadonlySet<ExpansionName>
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <li className={owned ? 'spirit-tile' : 'spirit-tile spirit-tile-unowned'}>
      <button
        type="button"
        className="spirit-tile-open"
        onClick={() => onSelect?.(spirit)}
        aria-label={`View ${spirit.name} details`}
      >
        <SpiritArt spirit={spirit} />
        <h3>{spirit.name}</h3>
      </button>
      <p className="meta">
        {spirit.expansion} · {spirit.complexity}
        {!owned && <span className="unowned-note"> · not in your collection</span>}
      </p>
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
