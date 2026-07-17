# 01 — Extend the vibe sheet into a full-app token palette

Status: done
Type: wayfinder:research
Blocked by: —
Assignee: claude
Parent: ../MAP.md

## Question

What is the full set of design tokens the app shell needs to wear a Spirit-Island-aligned look — in
**both** a light-parchment and a warm-dark variant — and how do the existing semantic chip systems
reconcile with each?

Extend [panel-vibe-sheet.md](../../panel-theming/panel-vibe-sheet.md) (modal-only ingredients) into
an app-wide token sheet. Deliver as a linked markdown asset in this directory
(`token-palette.md`) — **a sheet the variant round builds from, not code.**

Cover:

- **Surface / text / line role tokens for the whole shell** — analogues of today's
  `--deck-bg` / `-panel` / `-panel-2` / `-line` / `-line-soft` / `-text` / `-body` / `-dim` /
  `-accent` / `-warn` (see `src/deck.css` `:root`) — laid out in a **light-parchment column** and a
  **warm-dark column**, side by side. The vibe sheet's sampled parchment hexes are the light raw
  material; its proposed dark-translations are the warm-dark raw material.
- **The vibrant / floral range.** The panels are earthy (parchment / gold / umber); the app wants
  *vibrant*. Sample the brighter nature palette — lush greens, water blues, bloom pinks/purples,
  fire — from the spirit illustrations in `public/spirits/` (37 assets; and `public/cards/` if
  useful), by the same adaptive-palette quantisation the panel vibe sheet used. Record provenance
  (which asset, coverage %) per hex, exactly as that sheet does.
- **Reconciliation with the semantic chip systems.** For each of `EXPANSION_COLOR`, `TAG_COLOR`,
  `CARD_KIND_COLOR`, `CARD_SPEED_COLOR`, `SCENARIO_BAND_COLOR`, `SUBTYPE_COLOR`, `PANEL_COLOR`
  (all in `src/components/tagColors.ts`) and the tier rainbow in `src/components/tierColors.ts`:
  note, per light / warm-dark variant, which palettes read cleanly as-is and which would need
  re-tuning to stay legible **and** pairwise-distinct (the `cardChipColors.test.ts` invariant).
  This is a **note that scopes the fog**, not a re-palette — the actual re-tune graduates after the
  round, once a surface has won.

## Provenance discipline (CLAUDE.md)

Sampled hexes are marked **sampled** (asset + coverage); any proposed/derived value is marked
**judgment**. This is presentation, not game data, so **no canon tripwire is owed** — record
provenance instead, exactly as `panel-vibe-sheet.md` did. Do not invent a "vibrant" hex that isn't
either sampled off an asset or an explicitly-labelled judgment derivation.

## Acceptance criteria

- [x] `token-palette.md` exists in this directory with a **light-parchment column** and a
      **warm-dark column** for the shell role tokens (the `--deck-*` analogues).
- [x] The vibrant range (greens / water / bloom / fire) is sampled from `public/spirits/` (and card
      art if useful), each hex recording its provenance (asset + coverage %).
- [x] Every value is marked **sampled** or **judgment** — no fabricated hexes (CLAUDE.md discipline).
- [x] A per-variant note records which `tagColors.ts` / `tierColors.ts` chip systems read cleanly
      vs. would need re-tuning to stay legible and pairwise-distinct.
- [x] Linked from the map's Decisions-so-far on close.

_(Tracer-bullet framing, `/to-tickets` 2026-07-17: this is the frontier slice — a self-contained
research artifact, verifiable on its own by the criteria above.)_

## Resolution

Delivered [token-palette.md](../token-palette.md). Shell role tokens reuse the panel vibe sheet's
already-sampled panel-scan hexes (light column = its `parchment` family; warm-dark column = its
proposed dark-translations), remapped onto `--deck-*` roles, plus two new judgment values
(`line-soft`, `dim`) with no vibe-sheet analogue.

The vibrant range was sampled fresh off all 37 `public/spirits/*.webp` portraits by the vibe
sheet's own quantisation method. Green, water, and fire each landed solid sampled anchors. Pink
did not — **no true bloom-pink/magenta cluster exists anywhere in the portrait set at meaningful
coverage**; the sheet's `bloom-pink` entry is the one judgment-only value in the table, built by
brightening the closest real (dark, desaturated) plum sample, and flagged for the owner to reject
if it doesn't read as vibrant enough. This is an honest finding, not a gap in the sampling: the
illustration style is dark-fantasy, not floral.

Chip-system reconciliation surfaced one concrete re-tune risk for ticket 02: `tierColors.ts`'s
7-colour pastel `PALETTE` is tuned for near-max contrast against the current near-black shell and
would read poorly (especially the cyan and yellow entries) against a light-parchment field.
Everything else in both chip systems (`tagColors.ts`'s seven palettes, the tier rainbow's warm-dark
case) reads as likely-fine, to be confirmed by eye once the round renders real candidates.
