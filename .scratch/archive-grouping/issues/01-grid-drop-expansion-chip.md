# 01 — Drop the expansion corner chip from tile views (keep it in rows)

Status: done
Blocked by: None — can start immediately
Parent: ../README.md

## What

Remove the corner expansion badge (`.expansion-chip-corner`) from **every tile view** — the three
Archive grids **and the tier board**. The **Rows** views keep their expansion pill
(`.card-row-expansion.expansion-chip`) unchanged.

Owner request (2026-07-17, widened at the owner's direction to include the tier board): tiles should
show the art, not chips; the expansion colour belongs to the list/rows view. This narrows
**legibility-pass #05 / #08** (which put the expansion colour on tile corner-badges AND row pills)
to rows-only, and re-aligns with `CardGrid`'s own stated purpose — "card art is how the owner
recognises cards".

## Where — all five `.expansion-chip-corner` usages go

- `src/components/CardGrid.tsx:30` — power / fear / event / blight card grid
- `src/components/AdversaryGrid.tsx:31` — adversary grid (legibility-pass #05)
- `src/components/ScenarioGrid.tsx:47` — scenario grid. Only the top-left **expansion** chip goes;
  the **difficulty band** stays (legibility-pass #08 — a separate signal on the border/bottom tab)
- `src/components/TierBoard.tsx:115` — the spirit/configuration tier tile
- `src/components/TierBoard.tsx:160` — the card tier tile (`CardTile`). Its `showExpansion` prop
  exists only to gate this chip — remove the prop and its call site(s) once the chip is gone.

The tier board has no rows alternative, so its expansion colour simply won't appear there anymore —
that's the intended effect of widening this issue.

## CSS — the rule is now fully dead, delete it

With all five usages removed, `.expansion-chip-corner` in `src/deck.css` is unused → **delete the
rule.** **Keep** the base `.expansion-chip` rule and `.card-row-expansion.expansion-chip` — the Rows
views still use them.

## Also

- Clean up now-unused imports (e.g. `expansionColorFor` in any component that no longer colours a
  tile chip) and the dead `showExpansion` prop, so `oxlint` and `tsc -b` stay clean.
- `cardChipColors.test.ts` pins the expansion palette by *value*; removing a *usage* doesn't touch
  the palette, so it's unaffected — confirm it still passes rather than editing it.
- If any test asserts the corner chip's *presence* (a TierBoard render test or `appSmoke`), update
  it to reflect the removal.

## Note — orthogonal to the theme round

The tier board is also an anchor surface for the separate [island-retheme](../../island-retheme/MAP.md)
theme round. Removing the chip is a *content* change, not a palette one, so the two don't conflict —
this just means the tier tiles carry no expansion chip when that round restyles them.

## Acceptance criteria

- [x] The three Archive grids (cards, adversaries, scenarios) show no expansion corner chip; the
      scenario **difficulty band** still renders.
- [x] Both tier-board tile kinds (the configuration tile and the card tile) show no expansion chip.
- [x] The Rows/list views still render the expansion pill, unchanged.
- [x] The now-dead `.expansion-chip-corner` CSS rule is removed; the base `.expansion-chip` and the
      row-pill rule are kept.
- [x] The dead `showExpansion` prop and any now-unused imports are removed.
- [x] `cardChipColors` stays green **unedited**; any test asserting the corner chip's presence is
      updated to reflect the removal.
- [x] `tsc -b`, `oxlint`, and the suite are clean; verified in the running app at desktop + 375px.

## Comments

- Implemented 2026-07-17: removed the `.expansion-chip-corner` usage and CSS rule from
  `CardGrid.tsx`, `AdversaryGrid.tsx`, `ScenarioGrid.tsx`, and both `TierBoard.tsx` tile kinds
  (`TierTile`, `CardTile`), including the now-dead `showExpansion` prop/state and its checkbox.
  No test referenced the corner chip or `showExpansion` directly, so none needed updating;
  `cardChipColors.test.ts` passed unedited (398/398 suite green, `tsc -b` and `oxlint` clean).
  Verified live in the dev server via Playwright: Powers/Adversaries/Scenarios grids and the tier
  board render zero `.expansion-chip-corner` nodes; Archive Rows still renders 332
  `.card-row-expansion.expansion-chip` pills; the scenario difficulty band (`.scenario-difficulty`)
  is untouched.
