import { useState } from 'react'
import type { Spirit } from '../domain/types'
import { PlaceholderArt } from './PlaceholderArt'

/**
 * Real spirit artwork, keyed off the spirit's slug (its id) unless an `image` override is set.
 * Falls back to the element-colored placeholder if the file is missing or fails to load.
 */
export function SpiritArt({ spirit }: { spirit: Spirit }) {
  const [failed, setFailed] = useState(false)

  if (failed) return <PlaceholderArt spirit={spirit} />

  return (
    <img
      className="spirit-art"
      src={`${import.meta.env.BASE_URL}spirits/${spirit.image ?? spirit.id}.webp`}
      alt={spirit.name}
      width={256}
      height={256}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
