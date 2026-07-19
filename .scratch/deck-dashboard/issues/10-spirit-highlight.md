# Spirit highlight

Status: done

## Parent

`../PRD.md` (Deck Dashboard spec)

## What to build

A player optionally picks their spirit on the Dashboard, and the power-deck element views
highlight the elements that spirit cares about — the "which elements suit my spirit"
question answered visually. The picker lists the 37 spirits by spirit (not Configuration —
element data exists at spirit level only and aspects record no element changes; this is
intent, per the spec). A clear "no spirit" state is the default so the Dashboard serves
the whole table. The pick is session-only and drives highlighting from the spirit's
existing recorded elements — no new data.

## Acceptance criteria

- [ ] Spirit picker with a default "no spirit" state; picking highlights that spirit's
      elements in the element bars (and combination view if present) on both power-deck
      segments.
- [ ] Highlighting uses only the spirits catalog's recorded elements — no new dataset, no
      judgment data.
- [ ] Clearing the pick returns the views to the neutral state; reload reverts to no
      spirit (session-only, no storage writes).
- [ ] Type check, lint, and the full test suite pass.

## Blocked by

- `06-walking-skeleton-dashboard-tab.md`
