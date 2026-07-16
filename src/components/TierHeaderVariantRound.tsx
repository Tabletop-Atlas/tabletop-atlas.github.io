/**
 * ROUND 07 (legibility-pass) — THROWAWAY variant scaffolding, delete on ship.
 *
 * Three treatments for taming the tier-list page's header (the attribution block +
 * "create a personal list" affordance), gated on `?headerVariant=A|B|C` (the ticket 04/05/06/09
 * pattern: namespaced param, floating switcher, byte-identical app without the param).
 *
 * - A — collapsed citation: the attribution collapses to one summary line behind a `<details>`
 *   toggle; "Create a personal list" becomes a real button that opens the form inline.
 * - B — compact citation, promoted CTA: attribution shortens to two always-visible lines (no
 *   disclosure); "Create a personal list" becomes its own accent button row above the board.
 * - C — citation behind an info toggle: attribution hides entirely behind a small "ⓘ Source"
 *   button; "Create a personal list" sits as a button next to the tier-list picker.
 *
 * Deleting the round = this file + its `deck.css` block (search "ROUND 07") + the variant prop
 * threaded through `TierListControls.tsx`/`TierBoard.tsx` + the switcher call site in
 * `TierBoard.tsx`.
 */
export type TierHeaderVariant = 'A' | 'B' | 'C'

const VARIANTS: TierHeaderVariant[] = ['A', 'B', 'C']

export function readTierHeaderVariant(): TierHeaderVariant | null {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get('headerVariant')
  return v === 'A' || v === 'B' || v === 'C' ? v : null
}

const LABEL: Record<TierHeaderVariant, string> = {
  A: 'collapsed citation',
  B: 'compact citation, promoted CTA',
  C: 'citation behind info toggle',
}

export function TierHeaderVariantSwitcher({
  current,
  onPick,
}: {
  current: TierHeaderVariant
  onPick: (v: TierHeaderVariant) => void
}) {
  function go(v: TierHeaderVariant) {
    const params = new URLSearchParams(window.location.search)
    params.set('headerVariant', v)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    onPick(v)
  }

  return (
    <div className="variant-switcher" role="group" aria-label="Tier header variant">
      <span className="variant-switcher-tag">ROUND 07 · {LABEL[current]}</span>
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
