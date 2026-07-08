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

/** Element-colored placeholder tile used until real spirit artwork (#13) lands. */
export function PlaceholderArt({ spirit }: { spirit: Spirit }) {
  const color = ELEMENT_COLOR[spirit.elements[0]] ?? DEFAULT_COLOR
  const initials = spirit.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 3)
    .join('')

  return (
    <div className="placeholder-art" style={{ backgroundColor: color }} aria-hidden="true">
      {initials}
    </div>
  )
}
