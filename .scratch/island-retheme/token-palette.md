# Full-app token palette — buildable ingredients for the island retheme

Resolves ticket [01](issues/01-full-app-token-palette.md). Feeds the variant round
([02](issues/02-theme-variant-round.md)): candidates build from these sampled/judgment hexes, not
from guessed "floral-ish" colours. Extends
[panel-vibe-sheet.md](../panel-theming/panel-vibe-sheet.md) (modal-only ingredients) to the whole
app shell.

## Provenance

Every hex below is marked **sampled** (asset + coverage) or **judgment** (a labelled derivation —
brightened, darkened, interpolated, or carried over from a prior sampled value). This is
presentation, not game data, so no canon tripwire is owed (CLAUDE.md) — provenance is recorded
instead, exactly as the panel vibe sheet did. No hex below is fabricated without one of these two
labels.

- **Shell role tokens** reuse the panel vibe sheet's already-sampled panel scans
  (`public/panels/*.webp`, six fronts spanning Base/Branch & Claw/Jagged Earth) — the vibe sheet's
  light column *is* the parchment raw material; its dark-translation column *is* the warm-dark raw
  material. Nothing is re-sampled here, only re-mapped onto the app shell's own role names
  (`--deck-*` in `src/deck.css`, vs. the modal-only roles the vibe sheet named).
- **The vibrant/floral range** is freshly sampled here, off all 37 `public/spirits/*.webp`
  portraits, by the same adaptive-palette quantisation the vibe sheet used
  (`PIL … quantize(FASTOCTREE)`, 12 colours per image, coverage recorded), then filtered to
  saturated, mid-value clusters (excluding near-black/near-white/desaturated backdrop colours,
  which dominate the illustration style) and grouped by hue family.

## Shell role tokens — light-parchment vs warm-dark

`src/deck.css`'s `:root` today (cool dark theme, no relation to this map): `--deck-bg`,
`--deck-panel`, `--deck-panel-2`, `--deck-line`, `--deck-line-soft`, `--deck-text`, `--deck-body`,
`--deck-dim`, `--deck-accent`, `--deck-accent-bg`, `--deck-warn`. The columns below are each
variant's candidate replacement, by role.

| Role (`--deck-*` analogue) | Light-parchment | Provenance | Warm-dark | Provenance |
|---|---|---|---|---|
| `bg` — page backdrop | `#f2e7c8` | sampled, keeper (8.6%) — vibe sheet's `parchment-lit` | `#1c160e` | judgment — one step darker than the vibe sheet's `parchment` dark-translation (`#241d12`), so the shell's outermost field sits behind the modal's, not level with it |
| `panel` — card/sidebar surface | `#e7d19c` | sampled, river-surges (38%) — vibe sheet's `parchment` | `#241d12` | judgment — vibe sheet's proposed dark-translation of `parchment` |
| `panel-2` — recessed surface (nav rail) | `#cdb88c` | sampled, river/heart/keeper (~6%) — vibe sheet's `parchment-aged` | `#150f09` | judgment — darker than `bg`, for the recessed rail; extrapolates the vibe sheet's dark-translation trend one step further |
| `line` — borders/dividers | `#a89368` | sampled, all six panels (~10%) — vibe sheet's `parchment-shadow` | `#463a24` | judgment — vibe sheet's proposed dark-translation of `parchment-aged` |
| `line-soft` — subtle dividers | `#c8b282` | judgment — exact midpoint between `panel` (`#e7d19c`) and `line` (`#a89368`) above (no vibe-sheet analogue existed; the modal never needed a *soft* line) | `#33291a` | sampled-derived — vibe sheet's `parchment-lit` dark-translation, reused as the softer of the two dark borders |
| `text` — headers/figures | `#2e2520` | sampled, river (5%) — vibe sheet's `ink` | `#e7d19c` | sampled — vibe sheet's `ink` dark-translation (light-on-dark inversion, carried verbatim) |
| `body` — body copy | `#5b4e2d` | sampled, keeper/spread (~4%) — vibe sheet's `ink-soft` | `#c8b78f` | judgment — vibe sheet's proposed dark-translation of `ink-soft` |
| `dim` — muted/placeholder text | `#8a7a5a` | judgment — lightened, desaturated step off `ink-soft`, mirroring how the current dark theme's `--deck-dim` (`#55636e`) sits between `body` and `line` | `#6e5c3a` | judgment — same relationship, warm-dark side |
| `accent` — primary highlight | `#239850` | sampled, a-spread-of-rampant-green (3.2%) — vibe sheet's `presence-green` | `#3fae6a` | sampled-derived — vibe sheet's `presence-green` dark-translation (brightened for dark) |
| `accent-bg` — tinted highlight backdrop | `#d7ead9` | judgment — light tint of `accent` at low opacity-equivalent, mirroring how today's `--deck-accent-bg` sits as a dim tint of `--deck-accent` | `#14351f` | judgment — carried verbatim from today's dark-theme `--deck-accent-bg`; already a dim green tint, reads as "warm-dark enough" without change |
| `warn` — caution/attention | `#a4562f` | sampled, lightnings-swift-strike (3.5%) — vibe sheet's `innate-rust` | `#c56a3a` | sampled-derived — vibe sheet's `innate-rust` dark-translation (brightened) |

**Note on `warn` vs. the expansion chip:** `EXPANSION_COLOR['Feather & Flame']` (`#8a5a3a`, a
rust/orange-brown) sits close in hue to both `warn` candidates above. `cardChipColors.test.ts`
only pins the chip *palettes* pairwise-distinct from each other, not from surface tokens — so this
isn't a test failure, but the round (ticket 02) should eyeball whether a Feather & Flame chip next
to a `warn` banner reads as two different signals or blurs into one.

## The vibrant/floral range — sampled off the spirit portraits

The panels are earthy (parchment/gold/umber); the app wants *vibrant*. Sampled from
`public/spirits/*.webp` (37 portraits) by the same quantisation method as the vibe sheet, then
hand-filtered to the saturated, mid-value clusters — most of each portrait's mass is a muted,
dark backdrop (illustration style), which is excluded here as noise, not palette.

| Family | Hex | From (coverage) | Notes |
|---|---|---|---|
| `bloom-green` | `#2b9957` | a-spread-of-rampant-green (1.1%) | the brightest true green found across all 37 portraits; low coverage — green in this art skews dark/mossy (see `parchment`'s `presence-green` for the more common muted green) |
| `bloom-green-soft` | `#569a5a` | downpour-drenches-the-world (5.3%) | a more common, slightly desaturated companion green — better coverage, safer as a fill than `bloom-green` |
| `water-bright` | `#2992dc` | fractured-days-split-the-sky (10.6%) | a genuinely bright sky/water blue, well covered — the strongest "vibrant" candidate in the whole set |
| `water` | `#5fa4d3` | fractured-days-split-the-sky (33.4%) | the dominant blue of that same portrait — softer, very high coverage, a safe base-blue |
| `water-deep` | `#386192` | oceans-hungry-grasp (7.8%) | a deeper sea-blue for shading/borders on the water family |
| `fire-bright` | `#dd631f` | heart-of-the-wildfire (6.3%) | the brightest true fire-orange found; S=0.86 V=0.87, the single most saturated warm hue in the set |
| `fire` | `#da671f` | rising-heat-of-stone-and-sand (4.8%) | near-identical hue from an independent portrait — cross-checked, not a one-off |
| `fire-deep` | `#a4532e` | lightning's-swift-strike (6.5%) | a deeper rust-orange for shading/borders on the fire family |
| `bloom-pink` | `#c25a86` | judgment | **no true pink/magenta cluster exists at meaningful coverage anywhere in the 37 portraits** — the closest real sample is `dances-up-earthquakes`' `#5d3548` (8.8% coverage, H331° S0.43 V0.36), a dark desaturated plum. This hex is that sample's hue held constant, brightened and saturated (S0.43→0.6, V0.36→0.65) to reach "vibrant." Flagged, not silently treated as sampled: **if the owner wants a genuine bloom-pink anchor, it will have to come from judgment, not the illustration set** — the source material doesn't have one. |
| `bloom-violet` | `#595c9c` | starlight-seeks-its-form (11.9%) | the closest the portraits get to "bloom" without inventing a hue — a real, well-covered violet-blue (night-sky family, not floral, but usable as the round's violet anchor) |

**Reading this table honestly:** the spirit portraits are a *dark fantasy* palette — mossy greens,
storm/sea blues, ember oranges, night violets — not a *floral* one. Green/water/fire all have solid
sampled anchors. Pink does not; the round (ticket 02) should treat `bloom-pink` as the one
judgment-only candidate in this sheet and be prepared for the owner to reject it outright, since
nothing in the art actually looks like it.

## Reconciliation with the semantic chip systems

Per `src/components/tagColors.ts` and `src/components/tierColors.ts`. This scopes the fog for
ticket 02 and the chip-adaptation item on the map — it is a **note, not a re-palette**; no chip
values change here.

| System | Today's design target | Light-parchment | Warm-dark |
|---|---|---|---|
| `EXPANSION_COLOR` (7 muted jewel tones) | mid-darkness hues for contrast on near-black | **Needs a look, likely fine as-is.** Mid-darkness jewel tones (`#4a6b8a`, `#5c7a4a`, …) still carry enough value against a light parchment field (`#e7d19c`, L≈0.75) to read as filled chips — same relationship a dark ink table-of-contents uses on paper. Not flagged for forced re-tune, but the round should eyeball all seven side by side on the light candidate. | **Fine as-is.** Still dark-on-dark; only the underlying field warms from cool `#0f1216` to umber `#241d12` — the jewel tones' contrast ratio barely moves. |
| `TAG_COLOR` (11 saturated hues) | bright, saturated, for a dark field | **Fine as-is**, same reasoning as `EXPANSION_COLOR` — saturated mid-lightness hues hold contrast on light or dark fields. | **Fine as-is.** |
| `CARD_KIND_COLOR` / `CARD_SPEED_COLOR` (filled pills) | phase-4 #21 owner pick, tuned for the current dark shell | **Fine as-is** — same mid-darkness filled-pill logic. | **Fine as-is.** |
| `SCENARIO_BAND_COLOR` | phase-4 #20 owner pick; `none` already indirects through `var(--deck-dim)` | **Auto-adapts for `none`** (it's a CSS var, not a hardcoded hex — this is the one entry in any chip system that already follows the shell token). The four hardcoded bands (`low`/`mid`/`high`/`top`) are mid-darkness and should be fine, unverified until the round renders them. | **Auto-adapts for `none`; bands fine as-is.** |
| `SUBTYPE_COLOR` (fear/blight/event, 3 hue families) | mid-darkness, judgment-provenance tags | **Fine as-is**, same reasoning. | **Fine as-is.** |
| `PANEL_COLOR` (the shipped modal palette) | dark umber-parchment, panel-theming #03 | **Needs re-tint if a light direction wins** — this is the map's "modal re-alignment" fog item verbatim (panel-theming ticket 04's deferred spread). Not resolved here; the modal keeps its shipped dark palette regardless of which shell variant wins this round, until that fog graduates. | **Already matches the direction** — `PANEL_COLOR`'s umber field (`#241d12`) is the same value this sheet proposes for `bg`/`panel` above. A warm-dark win needs no modal changes. |
| `tierColors.ts` `PALETTE` (7 bright pastels, `#c078c0`…`#ff7878`) | very high lightness/value, built to pop on near-black | **Needs re-tune.** These are pastels at V≈0.85+ built for maximum contrast against `#0f1216`; against a light parchment field (`#e7d19c`, L≈0.75) several — especially the cyan `#78ffff` and yellow `#ffff78` — would have near-zero contrast. This is the sharpest concrete re-tune risk the reconciliation surfaced; the light candidate in ticket 02 should darken/saturate this palette or it will be functionally unreadable. | **Fine as-is** — still popping against a dark (if warmer) field. |

**Net for ticket 02:** the light-parchment candidate carries one known risk (`tierColors.ts`'s
pastel palette) that the warm-dark candidate doesn't. Everything else in both chip systems reads
as "probably fine, verify by eye" — nothing else forces a re-tune before the round can render.
