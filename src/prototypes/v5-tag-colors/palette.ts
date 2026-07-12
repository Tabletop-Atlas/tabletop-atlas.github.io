import type { Complexity, Spirit } from '../../domain/types'

/** v5 #08 PROTOTYPE — throwaway. Three axes, three different colour treatments, deliberately
 * not sharing hues with `tierColors.ts`'s bright pastel rainbow (`#c078c0`..`#ff7878`) so a
 * spirit chip can never be mistaken for a tier badge (the ticket's explicit constraint).
 *
 * - Expansion: categorical (7 values) - muted, deep "jewel tone" hues, one per canonical
 *   expansion name, all darker/more saturated than the tier palette's pastels.
 * - Complexity: ordinal (Low..Very High) - a single-hue slate ramp, light to dark. Colour
 *   intensity reads as "more," matching the axis's actual order - a rainbow would lie about it
 *   the same way #01 found a lying control.
 * - Playstyle tags: categorical, open-ish (11 seen today) - a third, distinct muted palette,
 *   assigned by a stable hash so a new tag added later gets *a* colour without editing this file.
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

// Same hues as EXPANSION_COLOR, lifted for use as text colour (e.g. colouring a spirit's name
// itself) - the swatch values above are dark background fills; a name rendered in that same dark
// hue on this app's dark background would barely read. v5 #08 follow-up: "should the whole name
// be coloured too, or is that too much" - variant D.
export const EXPANSION_TEXT_COLOR: Record<string, string> = {
  Base: '#8fb8e0',
  'Branch & Claw': '#a3cc85',
  'Feather & Flame': '#e0a875',
  Horizons: '#7cd4c0',
  'Jagged Earth': '#d491c0',
  'Nature Incarnate': '#d4b95a',
  Promo: '#a3a3d4',
}

const COMPLEXITY_RAMP: Record<Complexity, string> = {
  Low: '#3a4048',
  Moderate: '#525c68',
  High: '#6e7a88',
  'Very High': '#94a2b2',
}

export function complexityColor(c: Complexity): string {
  return COMPLEXITY_RAMP[c]
}

/** For Variant B's difficulty-pip idiom (●●○○) - ordinal position, not a colour. */
export const COMPLEXITY_LEVEL: Record<Complexity, number> = { Low: 1, Moderate: 2, High: 3, 'Very High': 4 }

// v5 #08 owner feedback on the first pass: the original 8-colour hash palette for 11 known tags
// guaranteed collisions (blight-sensitive and token-heavy both landed on the same green in
// Variant C's screenshot) - two *different* tags reading as the *same* colour breaks the whole
// point of colour-coding. Every known tag now gets an explicit, distinct, saturated hue - a
// different family entirely from EXPANSION_COLOR's muted "jewel tones", so a tag chip can never
// be mistaken for an expansion stripe by hue alone. The hash fallback only fires for a future tag
// this file hasn't been updated for yet.
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

// Tag colours above are already bright/saturated enough to read as text on this app's dark
// background - unlike the expansion palette, there's no separate darker "chip fill" version to
// lift from, so this is the same value. Kept as its own function so callers don't care which.
export function tagTextColor(tag: string): string {
  return tagColor(tag)
}

export function tagLabel(tag: string): string {
  return tag.replace(/-/g, ' ')
}

/** The worst-case fixture the ticket asks for: longest name, most tags, one per expansion so
 * the categorical palette is fully exercised on screen. */
export function pickFixture(spirits: Spirit[]): Spirit[] {
  const longestName = [...spirits].sort((a, b) => b.name.length - a.name.length)[0]
  const mostTags = [...spirits].sort((a, b) => b.tags.length - a.tags.length)[0]
  const seenExpansions = new Set<string>()
  const onePerExpansion = spirits.filter((s) => {
    if (seenExpansions.has(s.expansion)) return false
    seenExpansions.add(s.expansion)
    return true
  })
  const ids = new Set([longestName.id, mostTags.id, ...onePerExpansion.map((s) => s.id)])
  return spirits.filter((s) => ids.has(s.id))
}
