import type { CSSProperties } from 'react'

/**
 * ROUND 06 (legibility-pass) — THROWAWAY variant scaffolding, delete on ship.
 *
 * Three treatments for showing a Browse tile's active-list tier rank, gated on
 * `?tierVariant=A|B|C` (the ticket 04/05/09 pattern: namespaced param, floating switcher,
 * byte-identical app without the param). The badge *data* (`activeConfigTier` in
 * `tierColors.ts`) is NOT scaffolding — it survives the round regardless of which letter wins;
 * only the render treatment below is thrown away on ship.
 *
 * - A — corner badge: a small `tier-chip`-style letter chip pinned to the art's top-right corner.
 * - B — ribbon: a diagonal ribbon across the art's top-right corner.
 * - C — coloured ring: a tier-coloured outline around the whole tile (the expansion stripe stays
 *   on the left edge; this rings the remaining three sides so the two signals don't overlap).
 *
 * Deleting the round = this file + its `deck.css` block (search "ROUND 06") + the variant prop
 * threaded through `SpiritTile.tsx` + the switcher call site in `Browser.tsx`.
 */
export type TierBadgeVariant = 'A' | 'B' | 'C'

const VARIANTS: TierBadgeVariant[] = ['A', 'B', 'C']

export function readTierBadgeVariant(): TierBadgeVariant | null {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get('tierVariant')
  return v === 'A' || v === 'B' || v === 'C' ? v : null
}

const LABEL: Record<TierBadgeVariant, string> = {
  A: 'corner badge',
  B: 'ribbon',
  C: 'coloured ring',
}

/** The one place a variant + a tier colour become the tile's badge className/style, so A/B/C
 * can't drift between call sites. `tileStyle` layers onto the tile's own style (which already
 * sets the expansion `borderLeftColor`); only variant C needs it. */
export function tierBadgeProps(
  variant: TierBadgeVariant,
  color: string,
): { className: string; style: CSSProperties; tileStyle?: CSSProperties } {
  if (variant === 'A') return { className: 'tier-badge tier-badge-corner', style: { background: color } }
  if (variant === 'B') return { className: 'tier-badge tier-badge-ribbon', style: { background: color } }
  return {
    className: 'tier-badge tier-badge-ring-label',
    style: { color },
    tileStyle: { boxShadow: `inset 0 0 0 2px ${color}` },
  }
}

export function TierBadgeVariantSwitcher({
  current,
  onPick,
}: {
  current: TierBadgeVariant
  onPick: (v: TierBadgeVariant) => void
}) {
  function go(v: TierBadgeVariant) {
    const params = new URLSearchParams(window.location.search)
    params.set('tierVariant', v)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    onPick(v)
  }

  return (
    <div className="variant-switcher" role="group" aria-label="Tier badge variant">
      <span className="variant-switcher-tag">ROUND 06 · {LABEL[current]}</span>
      <div className="variant-switcher-buttons">
        {VARIANTS.map((v) => (
          <button key={v} type="button" aria-pressed={v === current} data-active={v === current} onClick={() => go(v)}>
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
