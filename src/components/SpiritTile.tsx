import { useState } from 'react'
import type { Spirit } from '../domain/types'
import { PlaceholderArt } from './PlaceholderArt'

export function SpiritTile({ spirit }: { spirit: Spirit }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <li className="spirit-tile">
      <PlaceholderArt spirit={spirit} />
      <h3>{spirit.name}</h3>
      <p className="meta">
        {spirit.expansion} · {spirit.complexity}
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
                  <strong>{aspect.name}:</strong> {aspect.delta}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  )
}
