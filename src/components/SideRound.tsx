/**
 * qa-revision #01 (sidebar visibility) — THROWAWAY variant scaffolding, delete on ship.
 *
 * Three coloring/contrast candidates for the command-deck sidebar, gated on `?side=A|B|C`
 * (the `?theme=` pattern: namespaced param, floating switcher, byte-identical app without the
 * param). The complaint: `.deck-side`'s `--deck-panel-2` (#150f09) is near-identical to the main
 * pane's `--deck-bg` (#1c160e), and inactive nav items are hardcoded low-contrast cool slate
 * (#7d8f9f) on a warm dark surface — the panel reads as "a bit invisible".
 *
 * - A — raised-panel: sidebar flips to the *lighter* panel surface with a stronger edge; inactive
 *   nav goes warm parchment-dim so it belongs to the palette instead of fighting it.
 * - B — accent-rail: keeps the deep surface but tints it toward the presence-green accent and
 *   hangs a full-height accent rail on the sidebar's edge; nav brightens on the tinted ground.
 * - C — inverted-parchment: the strong flip — sidebar takes the parchment-light surface with ink
 *   text, maximum separation from the dark main pane.
 *
 * Deleting the round = this file + its `deck.css` block (search "qa-revision #01") + the class
 * and switcher wiring in `AppShell.tsx`.
 */
export type SideVariant = 'A' | 'B' | 'C'

const VARIANTS: SideVariant[] = ['A', 'B', 'C']

export function readSideVariant(): SideVariant | null {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get('side')
  return v === 'A' || v === 'B' || v === 'C' ? v : null
}

const LABEL: Record<SideVariant, string> = {
  A: 'raised-panel',
  B: 'accent-rail',
  C: 'inverted-parchment',
}

export function SideVariantSwitcher({ current, onPick }: { current: SideVariant; onPick: (v: SideVariant) => void }) {
  function go(v: SideVariant) {
    const params = new URLSearchParams(window.location.search)
    params.set('side', v)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    onPick(v)
  }

  return (
    <div className="variant-switcher" role="group" aria-label="Sidebar variant">
      <span className="variant-switcher-tag">QA #01 · {LABEL[current]}</span>
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
