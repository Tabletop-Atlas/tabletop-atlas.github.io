import { useState } from 'react'
import { SCENARIOS, type Scenario } from '../../domain/scenarios'
import { CardGrid } from '../../components/CardGrid'
import { CardViewer } from '../../components/CardViewer'

/**
 * PROTOTYPE — phase-4 #20's variant round, awaiting the owner's pick. Three treatments of the
 * scenario-difficulty indicator on the real scenario grid, gated on `?variant=A|B|C` (the
 * #03/#13 pattern): nothing changes without the param — the plain CardGrid renders exactly as
 * before. Once the owner picks, the winner is rewritten properly and this file is deleted.
 *
 *   A  Corner badge   the verbatim printed value in a pill overlaid on the tile's corner
 *   B  Caption strip  a text line under each tile: name + "Difficulty N"
 *   C  Banded frame   tile edge tinted by difficulty band, value in a corner tab
 */
type VariantKey = 'A' | 'B' | 'C'
const VARIANTS: { key: VariantKey; name: string }[] = [
  { key: 'A', name: 'Corner badge' },
  { key: 'B', name: 'Caption strip' },
  { key: 'C', name: 'Banded frame' },
]

function readVariant(): VariantKey | null {
  const v = new URLSearchParams(window.location.search).get('variant')
  return v === 'A' || v === 'B' || v === 'C' ? v : null
}

function writeVariant(v: VariantKey | null) {
  const url = new URL(window.location.href)
  if (v) url.searchParams.set('variant', v)
  else url.searchParams.delete('variant')
  window.history.replaceState(null, '', url)
}

/** Hue only — the TEXT always stays the verbatim printed value. Qualified values (`1*`,
 * `+/- 1`) colour by their figure (`+/- 1` → 1, `-1*` → -1); parse failure falls back to the
 * neutral band. A colour is still a reading of a qualified value — flagged in the ticket for
 * the owner if this variant wins. */
function difficultyBand(difficulty: string): string {
  const match = difficulty.match(/[+-]?\d+/)
  if (!match) return 'var(--deck-dim)'
  const n = Number(match[0])
  if (n <= 0) return '#3a7d44'
  if (n <= 2) return '#8a7a1e'
  if (n <= 4) return '#a85b1e'
  return '#a33232'
}

function useEnlarge() {
  const [enlarged, setEnlarged] = useState<{ src: string; alt: string } | null>(null)
  const base = import.meta.env.BASE_URL
  const open = (s: Scenario) => setEnlarged({ src: `${base}${s.image}`, alt: s.name })
  const viewer = enlarged ? <CardViewer src={enlarged.src} alt={enlarged.alt} onClose={() => setEnlarged(null)} /> : null
  return { open, viewer, base }
}

function VariantA() {
  const { open, viewer, base } = useEnlarge()
  return (
    <div className="card-grid">
      {SCENARIOS.map((s) => (
        <button key={s.name} type="button" className="card-grid-tile" style={{ position: 'relative' }} onClick={() => open(s)}>
          <img src={`${base}${s.image}`} alt={s.name} loading="lazy" decoding="async" />
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              background: 'rgba(10, 14, 12, 0.85)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 999,
              padding: '0.15rem 0.5rem',
              font: '700 12px/1.2 var(--deck-mono)',
            }}
          >
            {s.difficulty}
          </span>
        </button>
      ))}
      {viewer}
    </div>
  )
}

function VariantB() {
  const { open, viewer, base } = useEnlarge()
  return (
    <div className="card-grid">
      {SCENARIOS.map((s) => (
        <button key={s.name} type="button" className="card-grid-tile" onClick={() => open(s)}>
          <img src={`${base}${s.image}`} alt={s.name} loading="lazy" decoding="async" />
          <span
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '0.3rem 0.15rem 0.1rem',
              font: '11px/1.3 var(--deck-mono)',
              color: 'var(--deck-text)',
              textAlign: 'left',
            }}
          >
            <span>{s.name}</span>
            <span style={{ whiteSpace: 'nowrap', color: 'var(--deck-dim)' }}>Difficulty {s.difficulty}</span>
          </span>
        </button>
      ))}
      {viewer}
    </div>
  )
}

function VariantC() {
  const { open, viewer, base } = useEnlarge()
  return (
    <div className="card-grid">
      {SCENARIOS.map((s) => {
        const band = difficultyBand(s.difficulty)
        return (
          <button
            key={s.name}
            type="button"
            className="card-grid-tile"
            style={{ position: 'relative', border: `2px solid ${band}`, borderRadius: 8 }}
            onClick={() => open(s)}
          >
            <img src={`${base}${s.image}`} alt={s.name} loading="lazy" decoding="async" style={{ display: 'block' }} />
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                background: band,
                color: '#fff',
                padding: '0.15rem 0.55rem',
                borderTopRightRadius: 8,
                font: '700 12px/1.2 var(--deck-mono)',
              }}
            >
              {s.difficulty}
            </span>
          </button>
        )
      })}
      {viewer}
    </div>
  )
}

function Switcher({ current, onChange }: { current: VariantKey; onChange: (v: VariantKey | null) => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 300,
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        background: 'var(--deck-panel)',
        border: '1px solid var(--deck-line)',
        borderRadius: 999,
        padding: '0.3rem 0.5rem',
        font: '600 11px/1 var(--deck-mono)',
      }}
    >
      <span style={{ color: 'var(--deck-dim)' }}>#20</span>
      {VARIANTS.map((v) => (
        <button
          key={v.key}
          type="button"
          title={v.name}
          aria-pressed={current === v.key}
          onClick={() => onChange(v.key)}
          style={{
            border: '1px solid var(--deck-line)',
            borderRadius: 999,
            padding: '0.2rem 0.55rem',
            cursor: 'pointer',
            background: current === v.key ? 'var(--deck-text)' : 'transparent',
            color: current === v.key ? 'var(--deck-panel-2)' : 'var(--deck-text)',
          }}
        >
          {v.key}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(null)}
        style={{ border: 'none', background: 'transparent', color: 'var(--deck-dim)', cursor: 'pointer' }}
      >
        off
      </button>
    </div>
  )
}

/** Drop-in for the Scenarios grid branch: identical to `<CardGrid cards={SCENARIOS} />` unless
 * `?variant=` is in the URL. */
export function ScenarioDifficultyGrid() {
  const [variant, setVariant] = useState<VariantKey | null>(readVariant)
  const change = (v: VariantKey | null) => {
    writeVariant(v)
    setVariant(v)
  }
  if (!variant) return <CardGrid cards={SCENARIOS} />
  return (
    <>
      {variant === 'A' && <VariantA />}
      {variant === 'B' && <VariantB />}
      {variant === 'C' && <VariantC />}
      <Switcher current={variant} onChange={change} />
    </>
  )
}
