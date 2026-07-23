/** #17: the game log's number inputs advertise a `min`/`max`, but that markup only constrains the
 * spinner - a typed or pasted value (or `Number('')`, which is `0`) sails past it. Enforcing the
 * range where the entry is built, not only in the markup, means an out-of-range value is clamped
 * rather than recorded verbatim. An empty or non-numeric field means "not recorded" (`undefined`),
 * never a fabricated `0`. */
export function clampOptionalInt(raw: string, min: number, max = Infinity): number | undefined {
  if (raw.trim() === '') return undefined
  const n = Number(raw)
  if (!Number.isFinite(n)) return undefined
  return Math.min(Math.max(Math.round(n), min), max)
}

/** "HH:MM" start/end -> "2h 15m". An end before start is read as crossing midnight (+24h).
 * Either input missing -> undefined, never "0m" or NaN. */
export function formatDuration(start?: string, end?: string): string | undefined {
  if (!start || !end) return undefined
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if (![sh, sm, eh, em].every(Number.isFinite)) return undefined
  let minutes = eh * 60 + em - (sh * 60 + sm)
  if (minutes < 0) minutes += 24 * 60
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
