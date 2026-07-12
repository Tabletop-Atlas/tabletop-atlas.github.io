import { useEffect, useState } from 'react'
import './prototype.css'
import { PROTO_CARDS } from './fixture'
import { VariantA } from './VariantA'
import { VariantB } from './VariantB'

const VARIANTS = {
  A: { label: 'A — Image grid', Component: VariantA },
  B: { label: 'B — Compact rows', Component: VariantB },
} as const

type VariantKey = keyof typeof VARIANTS

function readVariant(): VariantKey {
  const v = new URLSearchParams(window.location.search).get('variant')
  return v === 'B' ? 'B' : 'A'
}

/** v4 #04 PROTOTYPE — throwaway. Answers: does a Cards tab result read as a wall of card art
 * (A) or as compact scannable rows with art one tap away (B)? Delete this whole directory, its
 * App.tsx wiring, and public/_prototype-04/ once #04's ## Comments records the owner's call. */
export function CardsShapePrototype() {
  const [variant, setVariant] = useState<VariantKey>(readVariant)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('variant', variant)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  }, [variant])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (e.key === 'ArrowLeft') setVariant((v) => (v === 'A' ? 'B' : 'A'))
      if (e.key === 'ArrowRight') setVariant((v) => (v === 'A' ? 'B' : 'A'))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const { label, Component } = VARIANTS[variant]

  return (
    <section className="proto-host">
      <p className="proto-warning">
        PROTOTYPE — v4 #04. Not real data, not wired into the real app. {PROTO_CARDS.length} real cards,
        real images. Judge at this width and at desktop width.
      </p>
      <Component />
      <div className="proto-switcher">
        <button type="button" onClick={() => setVariant((v) => (v === 'A' ? 'B' : 'A'))} aria-label="Previous variant">
          ←
        </button>
        <span>{label}</span>
        <button type="button" onClick={() => setVariant((v) => (v === 'A' ? 'B' : 'A'))} aria-label="Next variant">
          →
        </button>
      </div>
    </section>
  )
}
