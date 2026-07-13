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

/**
 * phase-4 #21 (owner picked variant B, filled pills): kind and speed chips in the Archive's
 * Powers rows. Fast red / Slow blue is the locked owner call. Near-hue check per this file's
 * own rule: these sit a lightness/saturation step off EXPANSION_COLOR's jewel tones (same
 * filled treatment, different surface) and off SCENARIO_BAND_COLOR — cardChipColors.test.ts
 * pins that no value is shared byte-identically with the expansion, tag, or band palettes.
 */
export const CARD_KIND_COLOR: Record<'minor' | 'major' | 'unique', string> = {
  minor: '#6b9948',
  major: '#9a4f86',
  unique: '#4f83ad',
}
export const CARD_SPEED_COLOR: Record<'Fast' | 'Slow', string> = {
  Fast: '#b03d3d',
  Slow: '#3a6fa5',
}

/** phase-4 #20 (owner picked C, banded frame): scenario difficulty bands, keyed by the figure
 * ranges ScenarioGrid maps (≤0, 1–2, 3–4, 5+; `none` = no readable figure). Presentation only —
 * the verbatim printed value is what renders. Lives here so cardChipColors.test.ts can pin
 * every chip system apart in one place. */
export const SCENARIO_BAND_COLOR = {
  low: '#3a7d44',
  mid: '#8a7a1e',
  high: '#a85b1e',
  top: '#a33232',
  none: 'var(--deck-dim)',
} as const

export const TAG_COLOR: Record<string, string> = {
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
