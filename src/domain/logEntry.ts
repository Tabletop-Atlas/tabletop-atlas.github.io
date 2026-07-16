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
