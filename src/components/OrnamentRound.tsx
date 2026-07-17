/**
 * ROUND 05 (island-retheme) — THROWAWAY variant scaffolding, delete on ship.
 *
 * Ticket #05: with the base direction settled on B (warm-dark, nature accent — ticket #02's
 * corrected pick), which CSS-only leaf/vine/flourish motif, if any, dresses the shell? `?ornament=
 * rules|corners|vines` toggles between three candidates, rendered on the app shell (sidebar) and
 * one other anchor surface (Browse tiles) — no query param at all is the fourth, implicit
 * candidate: the shipped look, undecorated. Intended to be viewed alongside `?theme=B`.
 *
 * No new art assets — every motif is CSS shapes/gradients only, per the "figurative + CSS
 * ornament, not illustrated art" call locked at charting.
 *
 * Deleting the round = this file + its `deck.css` block (search "ROUND 05") + the
 * `ornament-${ornament}` class in `AppShell.tsx` + the switcher call site there.
 */
export type OrnamentVariant = 'rules' | 'corners' | 'vines'

const VARIANTS: OrnamentVariant[] = ['rules', 'corners', 'vines']

export function readOrnamentVariant(): OrnamentVariant | null {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get('ornament')
  return v === 'rules' || v === 'corners' || v === 'vines' ? v : null
}

const LABEL: Record<OrnamentVariant, string> = {
  rules: 'accent rules only',
  corners: 'corner flourishes',
  vines: 'leaf/vine dividers',
}

export function OrnamentVariantSwitcher({ current, onPick }: { current: OrnamentVariant; onPick: (v: OrnamentVariant) => void }) {
  function go(v: OrnamentVariant) {
    const params = new URLSearchParams(window.location.search)
    params.set('ornament', v)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    onPick(v)
  }

  return (
    <div className="variant-switcher" role="group" aria-label="Ornament variant">
      <span className="variant-switcher-tag">ROUND 05 · {LABEL[current]}</span>
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
