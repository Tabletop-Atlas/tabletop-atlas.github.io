# Walking skeleton — Dashboard tab with Minor & Major composition

Status: done

## Parent

`../PRD.md` (Deck Dashboard spec)

## What to build

A player opens a new **Dashboard** tab from the app's navigation and finds a segmented
control — Minor / Major / Fear / Event. The Minor and Major segments each show, for the
player's Collection: the deck's total card count and a per-element horizontal bar view (8
canonical elements, hand-rolled SVG/CSS in the style of the existing rating bars) with each
element's card count. Elements with zero cards in the set appear as zero-count rows.
Fear and Event segments exist as labelled stubs. The composition math is born as the one
new pure domain seam — the deck-composition module — and the UI consumes it as glue.

## Acceptance criteria

- [ ] Dashboard appears in the nav; the rest of the app is untouched.
- [ ] Minor and Major segments show deck size + per-element counts derived from the
      Collection's expansion set, correct against the card catalog.
- [ ] The domain module is framework-free and tested on small synthetic fixtures (prior
      art: the arrange/filter module tests) — no real catalog, no localStorage, no React
      tree in tests.
- [ ] All 8 canonical elements always render, zero-count included; the module produces rows
      only for the 8 canonical elements.
- [ ] The existing server-rendered smoke check covers the Dashboard tab (the one-UI-test
      rule stands).
- [ ] Type check, lint, and the full test suite pass.

## Blocked by

- None — can start immediately.
