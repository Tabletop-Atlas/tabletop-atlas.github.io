import { EXPANSIONS, type Complexity, type ExpansionName } from '../domain/types'

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
  'Branch and Claw': 'Branch & Claw',
  'Horizons of Spirit Island': 'Horizons',
  Promo2: 'Feather & Flame',
  'Promo Pack 2 / Feather and Flame': 'Feather & Flame',
}

/** Absent means the raw string isn't in `EXPANSION_ALIASES` — never a guessed fallback. */
export function normalizeExpansion(raw: string): ExpansionName | undefined {
  return EXPANSION_ALIASES[raw]
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
