import type { CSSProperties } from 'react'

/**
 * ROUND 04 (legibility-pass) — THROWAWAY variant scaffolding, delete on ship.
 *
 * Three treatments for rendering a fear/blight/event subtype tag in the Archive rows view, gated
 * on `?subtypeVariant=A|B|C` (the ticket 05/09 pattern: namespaced param, floating switcher,
 * byte-identical app without the param). The palette itself (`SUBTYPE_COLOR`, `subtypeLabel` in
 * tagColors.ts) is NOT scaffolding — it survives the round regardless of which letter wins; only
 * the render treatment below is thrown away on ship.
 *
 * - A — filled pill: the `CARD_KIND_COLOR`/`CARD_SPEED_COLOR` idiom already in `CardRows`.
 * - B — tinted text: no fill, the colour carried by the text itself.
 * - C — outlined tag: the `SpiritTile` playstyle-tag idiom (`spirit-tile-tag-chip` — border +
 *   colour text, transparent background).
 *
 * Deleting the round = this file + its `deck.css` block (search "ROUND 04") + the variant prop
 * threaded through `OtherCardRows.tsx` + the switcher call site in `CardsTab.tsx`.
 */
export type SubtypeVariant = 'A' | 'B' | 'C'

const VARIANTS: SubtypeVariant[] = ['A', 'B', 'C']

export function readSubtypeVariant(): SubtypeVariant | null {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get('subtypeVariant')
  return v === 'A' || v === 'B' || v === 'C' ? v : null
}

const LABEL: Record<SubtypeVariant, string> = {
  A: 'filled pill',
  B: 'tinted text',
  C: 'outlined tag',
}

/** The one place a variant + a colour become the subtype chip's className/style — shared so A/B/C
 * can't drift between the three card kinds that use it. */
export function subtypeChipProps(variant: SubtypeVariant, color: string): { className: string; style: CSSProperties } {
  if (variant === 'A') return { className: 'subtype-chip subtype-chip-fill', style: { background: color } }
  if (variant === 'B') return { className: 'subtype-chip subtype-chip-text', style: { color } }
  return { className: 'subtype-chip subtype-chip-outline', style: { borderColor: color, color } }
}

export function SubtypeVariantSwitcher({ current, onPick }: { current: SubtypeVariant; onPick: (v: SubtypeVariant) => void }) {
  function go(v: SubtypeVariant) {
    const params = new URLSearchParams(window.location.search)
    params.set('subtypeVariant', v)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    onPick(v)
  }

  return (
    <div className="variant-switcher" role="group" aria-label="Subtype chip variant">
      <span className="variant-switcher-tag">ROUND 04 · {LABEL[current]}</span>
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
