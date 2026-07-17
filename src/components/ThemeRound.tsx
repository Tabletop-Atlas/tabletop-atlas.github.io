/**
 * ROUND 02 (island-retheme) — THROWAWAY variant scaffolding, delete on ship.
 *
 * Three base-direction candidates for the app-wide retheme, gated on `?theme=A|B|C` (the
 * `?panel=`/`?headerVariant=` pattern: namespaced param, floating switcher, byte-identical app
 * without the param). Tokens come from `.scratch/island-retheme/token-palette.md` (ticket 01) —
 * base palette / surface / light-dark only, no ornament (that's a later ticket).
 *
 * - A — light-parchment: the vibe sheet's sampled parchment field, ink text, presence-green accent.
 * - B — warm-dark, nature accent: the vibe sheet's proposed umber dark-translation, green accent
 *   (matches the shipped modal's `PANEL_COLOR` almost exactly — the "no modal changes needed" case).
 * - C — warm-dark, vibrant accent: same umber surface as B, but accent/warn swap to the freshly
 *   sampled vibrant water-blue/fire-orange pair, for a cooler, brighter mood within the same dark
 *   direction.
 *
 * Deleting the round = this file + its `deck.css` block (search "ROUND 02") + the class applied
 * in `AppShell.tsx` + the `'light'` tier-palette variant threaded through `TierBoard.tsx` /
 * `SpiritTile.tsx` (delete that branch too, `tierColors.ts` reverts to always the dark palette).
 */
export type ThemeVariant = 'A' | 'B' | 'C'

const VARIANTS: ThemeVariant[] = ['A', 'B', 'C']

export function readTheme(): ThemeVariant | null {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get('theme')
  return v === 'A' || v === 'B' || v === 'C' ? v : null
}

/** Only candidate A (light-parchment) needs `tierColors.ts`'s `'light'` palette (the
 * reconciliation's flagged re-tune risk) — B and C stay dark-family and keep the shipped palette.
 * One place for that mapping so `TierBoard.tsx`/`SpiritTile.tsx` don't each re-derive it. */
export function tierPaletteVariantFor(theme: ThemeVariant | null): 'light' | undefined {
  return theme === 'A' ? 'light' : undefined
}

const LABEL: Record<ThemeVariant, string> = {
  A: 'light-parchment',
  B: 'warm-dark, nature accent',
  C: 'warm-dark, vibrant accent',
}

export function ThemeVariantSwitcher({ current, onPick }: { current: ThemeVariant; onPick: (v: ThemeVariant) => void }) {
  function go(v: ThemeVariant) {
    const params = new URLSearchParams(window.location.search)
    params.set('theme', v)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    onPick(v)
  }

  return (
    <div className="variant-switcher" role="group" aria-label="Theme variant">
      <span className="variant-switcher-tag">ROUND 02 · {LABEL[current]}</span>
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
