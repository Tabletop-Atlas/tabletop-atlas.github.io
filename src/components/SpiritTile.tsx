import { useState } from 'react'
import type { Spirit } from '../domain/types'

const ELEMENT_COLOR: Record<string, string> = {
  Sun: '#e8b923',
  Moon: '#5b5f97',
  Fire: '#c8452b',
  Air: '#8fc1e3',
  Water: '#2e6f95',
  Earth: '#8a5a3b',
  Plant: '#4c8c4a',
  Animal: '#b07a3e',
}
const DEFAULT_COLOR = '#777'

export function SpiritTile({ spirit }: { spirit: Spirit }) {
  const [expanded, setExpanded] = useState(false)
  const color = ELEMENT_COLOR[spirit.elements[0]] ?? DEFAULT_COLOR

  return (
    <li className="spirit-tile">
      <div className="placeholder-art" style={{ backgroundColor: color }} aria-hidden="true">
        {spirit.name
          .split(' ')
          .map((w) => w[0])
          .slice(0, 3)
          .join('')}
      </div>
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
