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

const TAG_PALETTE = ['#8a6d3b', '#3b6d8a', '#6d3b8a', '#3b8a5c', '#8a3b5c', '#5c8a3b', '#3b5c8a', '#8a5c3b']
// Same hues, lifted for use as text colour on this app's dark background (deck.css) - the chip
// backgrounds above are dark enough to need white text on top; a tag rendered as bare text
// needs the colour itself to carry contrast.
const TAG_TEXT_PALETTE = ['#d9b876', '#76b8d9', '#b876d9', '#76d99e', '#d976a3', '#9ed976', '#76a3d9', '#d9a376']

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function tagColor(tag: string): string {
  return TAG_PALETTE[hashString(tag) % TAG_PALETTE.length]
}

export function tagTextColor(tag: string): string {
  return TAG_TEXT_PALETTE[hashString(tag) % TAG_TEXT_PALETTE.length]
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
