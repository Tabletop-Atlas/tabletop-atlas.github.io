import type { Complexity } from '../domain/types'

/**
 * v5 #08/#09: the spirit tile's colour scheme, decided via `/prototype` (variants A-H,
 * screenshots in `.scratch/v5/screenshots-08/`). Two axes, two different treatments,
 * deliberately separated from `tierColors.ts`'s bright pastel rainbow (`#c078c0`..`#ff7878`) by
 * lightness and saturation - these are darker and more saturated everywhere, even where a hue
 * lands near a tier hue (e.g. `fast-tempo` and the tier palette's magenta) - so a spirit chip
 * can never be mistaken for a tier badge. If either palette is ever brightened independently,
 * re-check the near-hue pairs for a genuine collision, not just this comment's claim.
 *
 * - Expansion: categorical (7 values) - muted, deep "jewel tone" hues, one per canonical
 *   expansion name. Used on both the tile's left-edge stripe and its solid expansion chip -
 *   same value in both places, verified byte-identical, so the two reinforce one signal.
 * - Playstyle tags: categorical, open-ish (11 seen today) - a distinct, saturated palette, one
 *   explicit colour per known tag (a hash-based palette with fewer slots than tags caused real
 *   collisions in the first prototype round - two different tags rendering identically defeats
 *   the point of colour-coding). The hash fallback only fires for a future tag added here later.
 *
 * Complexity does not get a colour - it's ordinal, shown as a dot meter (●●○○) plus its own
 * name as text (the "effort level" idiom), not a hue.
 */

export const EXPANSION_COLOR: Record<string, string> = {
  Base: '#4a6b8a',
  'Branch & Claw': '#5c7a4a',
  'Feather & Flame': '#8a5a3a',
  Horizons: '#3a7a6e',
  'Jagged Earth': '#7a4a6e',
  'Nature Incarnate': '#6e5a2a',
  Promo: '#5a5a7a',
}

/** Dot-meter position (●●○○) - ordinal, not a colour. */
export const COMPLEXITY_LEVEL: Record<Complexity, number> = { Low: 1, Moderate: 2, High: 3, 'Very High': 4 }

const TAG_COLOR: Record<string, string> = {
  aggressive: '#e0475a',
  'blight-positive': '#e0862f',
  'blight-sensitive': '#d4b32f',
  'board-control': '#3f9de0',
  coastal: '#2fb8c4',
  'dahan-synergy': '#4fb84a',
  'fast-tempo': '#e0479e',
  'fear-focused': '#8a5ce0',
  incarnate: '#5ce0a8',
  'ramping-economy': '#b8862f',
  'token-heavy': '#5c7ae0',
}
const TAG_FALLBACK_PALETTE = ['#e0475a', '#3f9de0', '#4fb84a', '#e0862f', '#8a5ce0', '#2fb8c4']

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function tagColor(tag: string): string {
  return TAG_COLOR[tag] ?? TAG_FALLBACK_PALETTE[hashString(tag) % TAG_FALLBACK_PALETTE.length]
}

export function tagLabel(tag: string): string {
  return tag.replace(/-/g, ' ')
}
