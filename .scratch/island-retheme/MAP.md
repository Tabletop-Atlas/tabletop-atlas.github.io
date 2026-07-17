# Wayfinder map — Island retheme: a Spirit-Island-aligned visual identity, app-wide

Label: wayfinder:map
Charted: 2026-07-17 (grilling session with the owner)

## Destination

The owner has picked a Spirit-Island-aligned visual **direction** for the app — light-vs-dark,
palette, surface treatment, and a CSS-only ornament vocabulary — by reacting to a real prototype
round on the four anchor surfaces. The pick is captured as design tokens plus a v6-style rollout
spec (per-surface issues) ready to hand off. **The map delivers the decision, not the sweep** — the
app-wide rollout is executed later, off this map.

## Notes

- **Prior art this map consumes (not reopens):**
  - [panel-theming map](../panel-theming/MAP.md) shipped a dark umber-parchment treatment on the
    spirit detail modal and recorded a *spread verdict* — spread wanted, deferred to a future
    effort that consumes its vibe sheet + `PANEL_COLOR` as prior art. **This is that effort.**
  - [panel-vibe-sheet.md](../panel-theming/panel-vibe-sheet.md) — the sampled real palette
    (parchment `#e7d19c`, gold, presence-green, innate-rust) + proposed dark-translations. The
    starting ingredients; ticket 01 extends them app-wide.
  - `PANEL_COLOR` in `src/components/tagColors.ts` — the shipped modal palette (umber field,
    parchment text, band-tan accent).
- **Locked at charting (owner, 2026-07-17):**
  - **Latitude: broad.** Both a light-parchment direction AND warmer-dark ones are on the table;
    the owner decides by reacting to renders, not light-vs-dark in the abstract. The shipped modal
    is a *movable* anchor — if a light direction wins, the modal flips to match (a fog item below,
    not this map's job to pre-decide).
  - **"Floral" is figurative + CSS ornament, not illustrated art.** A vibrant nature palette,
    warm/organic surfaces, and CSS-only ornament (leaf/vine dividers, corner flourishes, accent
    rules). **No new art assets to source** — the work stays in tokens + shapes, dodging the
    asset-provenance / trade-dress baggage panel-theming flagged.
  - **Deliverable: decide + spec, hand off rollout.** The map resolves the aesthetic decision and
    captures tokens + a v6-style rollout PRD. The mechanical app-wide sweep is NOT done here (see
    Out of scope).
  - **Anchor surfaces for the round (all four):** app shell (sidebar / nav / knobs / background),
    Browse grid (tiles + complexity dots + tag chips + tier ribbon), tier board (labels / tiles /
    captions / aspect tiles), Archive / Cards (kind/speed pills, expansion chips, subtype tags).
- **HITL rule (standing, inherited from panel-theming):** variant rounds are decided by the
  OWNER's pick, never the agent. Candidates sit behind a namespaced query param
  (`?theme=A|B|C` — the established `?variant=` / `?panel=` / `?headerVariant=` idiom); the
  prototype ticket waits at `needs-info` until the pick lands.
- **Invariants that survive any restyle:**
  - **Chip-system distinctness.** `tagColors.ts` (`EXPANSION_COLOR`, `TAG_COLOR`,
    `CARD_KIND_COLOR`, `CARD_SPEED_COLOR`, `SCENARIO_BAND_COLOR`, `SUBTYPE_COLOR`, `PANEL_COLOR`)
    plus `tierColors.ts` encode meaning and are pinned pairwise-distinct by
    `cardChipColors.test.ts`. A retheme must keep them legible and distinct on the winning
    surface — re-tuning is allowed, collisions are not.
  - **Data honesty** (panel-theming / v2 #11): OCFDU renders true, unrated is absent. A
    presentation-only palette carries provenance; no canon tripwire is owed.
  - **Fonts / icons** are settled by phase-4 #22 — consumed, not reopened.
- **Skills per ticket:** `/prototype` for the round, `/grilling` + `/domain-modeling` for the
  verdict. Verify against the production build at 375px + desktop; screenshots to
  `screenshots-NN/`.

## Decisions so far

<!-- one line per closed ticket: gist + link -->

- **[01 full-app token palette](issues/01-full-app-token-palette.md) (done):** shell role tokens
  extended from the panel vibe sheet into light-parchment + warm-dark columns →
  [token-palette.md](token-palette.md). Vibrant range sampled fresh off all 37 spirit portraits —
  green/water/fire landed solid sampled anchors; **no true bloom-pink exists in the art**, so
  `bloom-pink` is the sheet's one judgment-only, flagged-for-rejection value. Chip reconciliation
  found one concrete re-tune risk for the round: `tierColors.ts`'s pastel palette reads poorly on
  a light field; everything else looks likely-fine pending real renders.

## Not yet specified

<!-- fog toward the destination; graduates as tickets resolve -->

- **Ornament vocabulary.** Which CSS leaf/vine/flourish motifs, on which surfaces, how heavy —
  sharp only once the base surface/palette direction is picked (ticket 02). Graduates then, likely
  as its own prototype round on the winner.
- **Chip-system adaptation.** How `tagColors.ts` / `tierColors.ts`'s dark-tuned semantic palettes
  hold (or must re-tune) on the winning surface while preserving `cardChipColors.test.ts`
  distinctness. Material mainly if a light / very-different surface wins; graduates after the pick.
- **Modal re-alignment.** Whether the shipped `PANEL_COLOR` modal flips to light or re-tints to
  match the winning direction. Graduates after the pick.
- **The terminal deliverable.** Assembling the picked direction into locked design tokens + a
  v6-style rollout PRD with per-surface issues. Blocked on everything above; graduates once the
  direction + ornament are settled.

## Out of scope

- **The mechanical app-wide rollout execution** — every non-anchor surface inheriting the winning
  tokens. Handed off per the deliverable decision; a future v6 effort, not this map.
- **Literal botanical art assets** — flowers/vines/painted backgrounds as image files. Ruled out
  by the "figurative + CSS ornament" pick.
- **New fonts / icon sourcing** — settled by phase-4 #22 and the official-assets research;
  consumed, not reopened.
- **Pixel-faithful panel recreation** — inherited from panel-theming's fidelity guard (vibe, not
  replica; trade-dress unknown, next edition obsoletes the printed look).
