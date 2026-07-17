import { EXPANSIONS, type BlightTag, type Complexity, type EventClass, type ExpansionName, type FearTag } from '../domain/types'

/** ROUND 03 (island-retheme) — THROWAWAY: the one place every colour getter below chooses
 * between a shipped value and its warm re-tint. Delete alongside every `*_WARM` map/getter. */
function pick<T>(shipped: T, warm: T, variant?: 'warm'): T {
  return variant === 'warm' ? warm : shipped
}

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

/**
 * ROUND 03 (island-retheme) — THROWAWAY: the owner's reaction to the light-parchment theme
 * (ticket 02) was that the chip systems don't feel aligned with it. Judgment values, every entry
 * the same colour mixed 22% toward the vibe sheet's `gold` (`#eecb73`) — warms and slightly
 * desaturates each hue without moving its rank in the family, so the seven stay pairwise-distinct
 * (verified in `chipRoundColors.test.ts`) without becoming a fresh, unrelated palette. Delete this
 * and every other `*_WARM` map/getter below, plus `chips-${variant}` call sites, when the round
 * ships or is abandoned (see `ChipRound.tsx`'s docblock for the full teardown list).
 */
export const EXPANSION_COLOR_WARM: Record<string, string> = {
  Base: '#6e8085',
  'Branch & Claw': '#7c8c53',
  'Feather & Flame': '#a07347',
  Horizons: '#628c6f',
  'Jagged Earth': '#94666f',
  'Nature Incarnate': '#8a733a',
  Promo: '#7b7378',
}

/** ROUND 03: the direct-index equivalent of `expansionColorFor`, for the callers
 * (`SpiritTile.tsx`, `SpiritDetail.tsx`) that already hold a canonical `ExpansionName` and don't
 * need the raw-string normalization. */
export function expansionChipColor(name: string, variant?: 'warm'): string {
  return pick(EXPANSION_COLOR[name], EXPANSION_COLOR_WARM[name], variant) ?? EXPANSION_COLOR[name]
}

/**
 * legibility-pass #01: `EXPANSION_COLOR` keys off the 7 canonical `ExpansionName` values, but the
 * card datasets (`other-cards.json`, `power-cards.json`, `adversaries.json`) transcribe expansion
 * as whatever string the source printed, e.g. `Basegame`, `Horizons of Spirit Island`. This maps
 * every raw string seen in those datasets onto the canonical set so colour resolves everywhere.
 * `expansionCanon.test.ts` is the tripwire: it fails loudly if a future record's raw string isn't
 * in this table, rather than silently falling back to no colour.
 *
 * `Promo2` / `Promo Pack 2 / Feather and Flame` both resolve to `Feather & Flame`. This is not a
 * clean rename — `adversaries.json`'s own transcription ties Promo Pack 2 to Feather & Flame
 * ("Scotland", expansion `Promo Pack 2 / Feather and Flame`), but the data disagrees with itself
 * on the spirit side: Downpour Drenches the World is `Promo` (Promo Pack 1) in `spirits.json`, yet
 * every one of its own power cards is tagged `Promo2` in `power-cards.json` — not an occasional
 * bonus card, its whole card set. That contradiction couldn't be resolved from the data alone, so
 * it was escalated; **owner call (legibility-pass #01, 2026-07-14): `Promo2` always resolves to
 * `Feather & Flame`**, Downpour's own `Promo` tag notwithstanding. Bare `Promo` is untouched and
 * stays its own canonical entry.
 */
const EXPANSION_ALIASES: Record<string, ExpansionName> = {
  // Every canonical name is already its own alias (`spirits.json` uses these verbatim).
  ...Object.fromEntries(EXPANSIONS.map((name) => [name, name])),
  Basegame: 'Base',
  'Base Game': 'Base',
  'Branch and Claw': 'Branch & Claw',
  'Horizons of Spirit Island': 'Horizons',
  Promo2: 'Feather & Flame',
  'Promo Pack 2 / Feather and Flame': 'Feather & Flame',
  // legibility-pass #02: scenarios.json transcribes the wiki's own "Part of Promo Pack 2" line
  // verbatim. Same shape as the Promo2 case above, not a fresh ambiguity — the wiki category-tags
  // Promo Pack 2 content as Feather and Flame (the retail box that absorbed it), matching the
  // adversary record's own pairing. Carries forward the #01 owner call rather than re-escalating.
  'Promo Pack 2': 'Feather & Flame',
}

/** Absent means the raw string isn't in `EXPANSION_ALIASES` — never a guessed fallback. */
export function normalizeExpansion(raw: string): ExpansionName | undefined {
  return EXPANSION_ALIASES[raw]
}

/** legibility-pass #05: the one place raw expansion strings become a colour. Undefined for a raw
 * string `normalizeExpansion` can't place — honest absence, never a guessed fallback colour. */
export function expansionColorFor(raw: string, variant?: 'warm'): string | undefined {
  const canonical = normalizeExpansion(raw)
  return canonical ? expansionChipColor(canonical, variant) : undefined
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

/** ROUND 03 (island-retheme) — THROWAWAY: same 22%-toward-gold mix as `EXPANSION_COLOR_WARM`. */
export const CARD_KIND_COLOR_WARM: Record<'minor' | 'major' | 'unique', string> = {
  minor: '#88a451',
  major: '#ac6a82',
  unique: '#7293a0',
}
export const CARD_SPEED_COLOR_WARM: Record<'Fast' | 'Slow', string> = {
  Fast: '#be5c49',
  Slow: '#62839a',
}

export function cardKindColor(kind: 'minor' | 'major' | 'unique', variant?: 'warm'): string {
  return pick(CARD_KIND_COLOR[kind], CARD_KIND_COLOR_WARM[kind], variant)
}
export function cardSpeedColor(speed: 'Fast' | 'Slow', variant?: 'warm'): string {
  return pick(CARD_SPEED_COLOR[speed], CARD_SPEED_COLOR_WARM[speed], variant)
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

/** ROUND 03 (island-retheme) — THROWAWAY: same 22%-toward-gold mix as `EXPANSION_COLOR_WARM`.
 * `none` already tokenizes via `var(--deck-dim)` and needs no warm override. */
export const SCENARIO_BAND_COLOR_WARM = {
  low: '#628e4e',
  mid: '#a08c31',
  high: '#b77431',
  top: '#b45440',
  none: 'var(--deck-dim)',
} as const

export function scenarioBandColor(band: 'low' | 'mid' | 'high' | 'top' | 'none', variant?: 'warm'): string {
  return pick(SCENARIO_BAND_COLOR[band], SCENARIO_BAND_COLOR_WARM[band], variant)
}

/**
 * panel-theming #02→#03: the owner picked variant C — a dark translation of the printed spirit
 * panels' palette, keeping #23's vertical OCFDU bars retinted. This is the spirit detail modal's
 * default surface palette. Sampled/proposed off the panel scans the repo hosts (provenance:
 * `.scratch/panel-theming/panel-vibe-sheet.md`, ticket #01) — `text`/`accent` are sampled hexes,
 * the umber `surface`/`raised`/`edge` are the vibe sheet's proposed dark-translations of the
 * parchment. Presentation only, not game data, so no canon tripwire (the round recorded
 * provenance instead).
 *
 * Lives here as the modal's one colour source — applied as inline CSS custom properties on the
 * modal root (`SpiritDetail`) and consumed by the `.modal.spirit-detail` rules in `deck.css`,
 * the same colour-from-map idiom the chip systems use. `cardChipColors.test.ts` pins it apart
 * from every other chip/band palette, byte-for-byte, so a panel colour can never be mistaken for
 * a tier, tag, expansion, kind/speed, or difficulty-band colour.
 *
 * Provenance per the vibe sheet: `text`/`accent` are sampled hexes; the umber `surface`/`raised`/
 * `edge` and the `body` brown are the sheet's *proposed dark-translations* (design judgment for a
 * dark theme, not sampled) — labelled honestly so a judgment value never reads as sampled data.
 */
export const PANEL_COLOR = {
  surface: '#241d12', // umber field — proposed dark-translation of the parchment #e7d19c
  raised: '#33291a', // gradient crown, modal-close, bar track — proposed dark-translation
  edge: '#463a24', // borders, chip borders — proposed dark-translation
  text: '#e7d19c', // headers, axis labels — sampled parchment
  body: '#c8b78f', // body text — proposed dark-translation of the ink-soft brown
  accent: '#d2b068', // bar fill, elements label — sampled band-tan
} as const

/**
 * legibility-pass #04: fear/blight/event subtypes, surfaced in the Archive rows view (previously
 * data that existed only as filters, per v5 #02/#03). Fear/blight tags are keyword-derived
 * (`otherCardClassifier.ts`); blight's are explicitly `tagsSource: 'judgment'` (types.ts) — a
 * presentation colour/label is fine, but the caller (`OtherCardRows`'s row-level note,
 * `OtherCardFilters`'s section header) carries that provenance once, never dressing judgment as
 * canon by baking it into the label itself. One combined record rather than three, since the
 * three tag sets never co-occur on one card (a card is fear XOR blight XOR event) — the pairwise-
 * distinctness `cardChipColors.test.ts` pins still holds across the whole set, kept simple rather
 * than three near-identical mini-palettes. Each is its own hue family so a fear tag can't be
 * mistaken for a blight or event one even out of context (e.g. in a legend).
 */
export const SUBTYPE_COLOR: Record<FearTag | BlightTag | EventClass, string> = {
  // Fear — violet/pink family
  removal: '#c23a5e',
  defensive: '#3a8ac2',
  weaken: '#a63ac2',
  disruption: '#c2823a',
  displacement: '#3ac28a',
  // Blight — brown/rust family (judgment data; the caller carries that note, not the colour/label)
  presenceLoss: '#6e3a1e',
  boardChange: '#8a6e1e',
  damageBonus: '#b23a1e',
  resourceSwing: '#3a6e4a',
  // Events — muted teal/slate family
  choice: '#2e6e6e',
  stage: '#5e5e8a',
  terrorLevel: '#8a2e4a',
  healthyBlightedLand: '#4a8a2e',
  adversary: '#6e4a8a',
}

/** The one label source for a subtype tag, across all three buckets — plain text; the
 * "(judgment)" provenance note is carried once per blight row/section by the caller
 * (`OtherCardRows`'s judgment note, `OtherCardFilters`'s section header), not repeated on every
 * individual tag chip. One combined, exhaustively-typed record rather than three lookups chained
 * with `??` — the three unions are disjoint by construction (types.ts), so a merged record can't
 * silently fall through to `undefined` the way a chained optional lookup could if that ever broke. */
const SUBTYPE_LABEL: Record<FearTag | BlightTag | EventClass, string> = {
  removal: 'Removal',
  defensive: 'Defensive',
  weaken: 'Weaken',
  disruption: 'Disruption',
  displacement: 'Displacement',
  presenceLoss: 'Presence loss',
  boardChange: 'Board change',
  damageBonus: 'Damage bonus',
  resourceSwing: 'Resource swing',
  choice: 'Choice',
  stage: 'Stage',
  terrorLevel: 'Terror level',
  healthyBlightedLand: 'Healthy/blighted land',
  adversary: 'Adversary',
}

export function subtypeLabel(tag: FearTag | BlightTag | EventClass): string {
  return SUBTYPE_LABEL[tag]
}

/** ROUND 03 (island-retheme) — THROWAWAY: same 22%-toward-gold mix as `EXPANSION_COLOR_WARM`. */
const SUBTYPE_COLOR_WARM: Record<FearTag | BlightTag | EventClass, string> = {
  removal: '#cc5a63',
  defensive: '#6298b1',
  weaken: '#b65ab1',
  disruption: '#cc9247',
  displacement: '#62c485',
  presenceLoss: '#8a5a31',
  boardChange: '#a08231',
  damageBonus: '#bf5a31',
  resourceSwing: '#628253',
  choice: '#58826f',
  stage: '#7e7685',
  terrorLevel: '#a05153',
  healthyBlightedLand: '#6e983d',
  adversary: '#8a6685',
}

export function subtypeColor(tag: FearTag | BlightTag | EventClass, variant?: 'warm'): string {
  return pick(SUBTYPE_COLOR[tag], SUBTYPE_COLOR_WARM[tag], variant)
}

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

/** ROUND 03 (island-retheme) — THROWAWAY: same 22%-toward-gold mix as `EXPANSION_COLOR_WARM`,
 * including the fallback palette so a future tag not yet in `TAG_COLOR` still warms consistently. */
const TAG_COLOR_WARM: Record<string, string> = {
  aggressive: '#e36460',
  'blight-positive': '#e3953e',
  'blight-sensitive': '#dab83e',
  'board-control': '#66a7c8',
  coastal: '#59bcb2',
  'dahan-synergy': '#72bc53',
  'fast-tempo': '#e36495',
  'fear-focused': '#a074c8',
  incarnate: '#7cdb9c',
  'ramping-economy': '#c4953e',
  'token-heavy': '#7c8cc8',
}
const TAG_FALLBACK_PALETTE_WARM = ['#e36460', '#66a7c8', '#72bc53', '#e3953e', '#a074c8', '#59bcb2']

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function tagColor(tag: string, variant?: 'warm'): string {
  const shipped = TAG_COLOR[tag] ?? TAG_FALLBACK_PALETTE[hashString(tag) % TAG_FALLBACK_PALETTE.length]
  const warm = TAG_COLOR_WARM[tag] ?? TAG_FALLBACK_PALETTE_WARM[hashString(tag) % TAG_FALLBACK_PALETTE_WARM.length]
  return pick(shipped, warm, variant)
}

export function tagLabel(tag: string): string {
  return tag.replace(/-/g, ' ')
}
