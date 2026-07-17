/**
 * ROUND 03 (island-retheme) — THROWAWAY variant scaffolding, delete on ship.
 *
 * Owner's reaction to the light-parchment theme win (ticket 02): the chip systems (expansion,
 * tag, kind/speed, scenario-band, subtype) don't feel aligned with it. `?chips=original|warm`
 * toggles between the shipped dark-tuned hues and a warmed re-tint (every value mixed 22% toward
 * the vibe sheet's `gold`, `#eecb73` — see the `*_WARM` maps in `tagColors.ts`), rendered live
 * against the `?theme=A` shell from ticket 02.
 *
 * Deleting the round = this file + every `*_WARM` map/getter + `variant` param in `tagColors.ts`
 * (revert `tagColor`/`expansionColorFor`/`expansionChipColor`/`cardKindColor`/`cardSpeedColor`/
 * `scenarioBandColor`/`subtypeColor` to their pre-round signatures) + the `chipVariant` threading
 * in `SpiritTile.tsx`, `SpiritDetail.tsx`, `CardRows.tsx`, `OtherCardRows.tsx`,
 * `AdversaryRows.tsx`, `ScenarioRows.tsx`, `ScenarioGrid.tsx` + the switcher call site in
 * `AppShell.tsx` + `chipRoundColors.test.ts`.
 */
export type ChipVariant = 'original' | 'warm'

const VARIANTS: ChipVariant[] = ['original', 'warm']

export function readChipVariant(): ChipVariant | null {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get('chips')
  return v === 'original' || v === 'warm' ? v : null
}

/** The colour getters only branch on `'warm'` — `'original'` and absent both mean "use the
 * shipped palette." One call composing `readChipVariant` + this so the seven consuming
 * components don't each import and chain both themselves. */
export function readWarmChipVariant(): 'warm' | undefined {
  return readChipVariant() === 'warm' ? 'warm' : undefined
}

const LABEL: Record<ChipVariant, string> = {
  original: 'shipped (dark-tuned)',
  warm: 'warmed toward gold',
}

export function ChipVariantSwitcher({ current, onPick }: { current: ChipVariant; onPick: (v: ChipVariant) => void }) {
  function go(v: ChipVariant) {
    const params = new URLSearchParams(window.location.search)
    params.set('chips', v)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    onPick(v)
  }

  return (
    <div className="variant-switcher" role="group" aria-label="Chip colour variant">
      <span className="variant-switcher-tag">ROUND 03 · {LABEL[current]}</span>
      <div className="variant-switcher-buttons">
        {VARIANTS.map((v) => (
          <button key={v} type="button" aria-pressed={v === current} data-active={v === current} onClick={() => go(v)}>
            {v === 'original' ? 'orig' : 'warm'}
          </button>
        ))}
      </div>
    </div>
  )
}
