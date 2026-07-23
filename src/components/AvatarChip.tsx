import { useState } from 'react'
import { adversaryImage } from '../domain/adversaries'
import { slugify } from '../domain/slug'
import type { Spirit } from '../domain/types'
import { SpiritArt } from './SpiritArt'

function InitialsFallback({ name, className }: { name: string; className: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 3)
    .join('')
  return (
    <div className={className} aria-hidden="true">
      {initials}
    </div>
  )
}

function EntityArt({ kind, name }: { kind: 'adversary' | 'scenario'; name: string }) {
  const [failed, setFailed] = useState(false)
  const path = kind === 'adversary' ? adversaryImage(name) : `scenarios/${slugify(name)}.webp`
  if (failed) return <InitialsFallback name={name} className="avatar-chip-art avatar-chip-fallback" />
  return (
    <img
      className="avatar-chip-art"
      src={`${import.meta.env.BASE_URL}${path}`}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

export type AvatarChipProps =
  | { kind: 'spirit'; spirit: Spirit; name: string }
  | { kind: 'adversary'; name: string }
  | { kind: 'scenario'; name: string }

/**
 * Circular center-cropped avatar + always-visible name. Used for spirits, adversaries and
 * scenarios in the Log history (log-modernize #02). Spirit art reuses SpiritArt (and its
 * PlaceholderArt fallback); adversary/scenario art resolves via slugify with an initials tile.
 */
export function AvatarChip(props: AvatarChipProps) {
  return (
    <span className="avatar-chip">
      {props.kind === 'spirit' ? (
        <SpiritArt spirit={props.spirit} className="avatar-chip-art" />
      ) : (
        <EntityArt kind={props.kind} name={props.name} />
      )}
      <span className="avatar-chip-name">{props.name}</span>
    </span>
  )
}
