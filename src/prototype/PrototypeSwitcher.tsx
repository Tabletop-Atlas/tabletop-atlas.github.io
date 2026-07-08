/** PROTOTYPE — throwaway. Floating variant switcher. */
import { useEffect } from 'react'

export type VariantKey = 'A' | 'B' | 'C'

export const VARIANTS: { key: VariantKey; name: string }[] = [
  { key: 'A', name: 'Dossier — dark editorial, one column' },
  { key: 'B', name: 'Command deck — sidebar, dense, live knobs' },
  { key: 'C', name: 'Gallery — light, art-forward podium' },
]

export function setVariant(key: VariantKey) {
  const url = new URL(window.location.href)
  url.searchParams.set('variant', key)
  window.history.replaceState({}, '', url)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null
  if (!node) return false
  const tag = node.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable
}

export function PrototypeSwitcher({
  current,
  variants,
}: {
  current: VariantKey
  variants: { key: VariantKey; name: string }[]
}) {
  const index = variants.findIndex((v) => v.key === current)
  const cycle = (delta: number) => {
    const next = variants[(index + delta + variants.length) % variants.length]
    setVariant(next.key)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      if (e.key === 'ArrowLeft') cycle(-1)
      if (e.key === 'ArrowRight') cycle(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="proto-switcher">
      <button type="button" onClick={() => cycle(-1)} aria-label="Previous variant">
        ←
      </button>
      <span>
        <strong>{current}</strong> — {variants[index]?.name}
      </span>
      <button type="button" onClick={() => cycle(1)} aria-label="Next variant">
        →
      </button>
    </div>
  )
}
