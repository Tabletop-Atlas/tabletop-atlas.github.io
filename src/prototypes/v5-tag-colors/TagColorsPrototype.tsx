import { useEffect, useState } from 'react'
import spiritsData from '../../data/spirits.json'
import type { Spirit } from '../../domain/types'
import './prototype.css'
import { pickFixture } from './palette'
import { VariantA } from './VariantA'
import { VariantB } from './VariantB'
import { VariantC } from './VariantC'
import { VariantD } from './VariantD'

const spirits = spiritsData as Spirit[]
const fixture = pickFixture(spirits)

const VARIANTS = {
  A: { label: 'A — Chip row (all three axes as equal chips)', Component: VariantA },
  B: { label: 'B — Badge + dots, tags as text', Component: VariantB },
  C: { label: 'C — Accent stripe, colour as wayfinding', Component: VariantC },
  D: { label: 'D — C, but the name is coloured too', Component: VariantD },
} as const

type VariantKey = keyof typeof VARIANTS
const KEYS = Object.keys(VARIANTS) as VariantKey[]

function readVariant(): VariantKey {
  const v = new URLSearchParams(window.location.search).get('variant')
  return (KEYS as string[]).includes(v ?? '') ? (v as VariantKey) : 'A'
}

function cycle(current: VariantKey, dir: 1 | -1): VariantKey {
  const i = KEYS.indexOf(current)
  return KEYS[(i + dir + KEYS.length) % KEYS.length]
}

/** v5 #08 PROTOTYPE — throwaway. Answers: what should a spirit tile's expansion/complexity/
 * playstyle-tag colouring look like, and how many tags fit under a name at 375px? Delete this
 * whole directory, prototype-v5-tag-colors.html, and the App.tsx-adjacent nothing (deliberately
 * not wired into the real app) once #08's ## Comments records the owner's call. */
export function TagColorsPrototype() {
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
      if (e.key === 'ArrowLeft') setVariant((v) => cycle(v, -1))
      if (e.key === 'ArrowRight') setVariant((v) => cycle(v, 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const { label, Component } = VARIANTS[variant]

  return (
    <section className="tp-host">
      <p className="tp-warning">
        PROTOTYPE — v5 #08. Real spirits, real tags. This fixture is the worst case on purpose: the
        longest name ("{fixture.find((s) => s.name.length === Math.max(...fixture.map((f) => f.name.length)))?.name}"),
        the spirit with the most tags, and one spirit per expansion. Judge at this width and at 375px.
      </p>
      <Component spirits={fixture} />
      <div className="tp-switcher">
        <button type="button" onClick={() => setVariant((v) => cycle(v, -1))} aria-label="Previous variant">
          ←
        </button>
        <span>{label}</span>
        <button type="button" onClick={() => setVariant((v) => cycle(v, 1))} aria-label="Next variant">
          →
        </button>
      </div>
    </section>
  )
}
