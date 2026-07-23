# 01 — Element + count chip controls

Status: done
Parent: ../PRD.md

## What to build

On the Dashboard's Minor/Major "How many of an element do I want?" block, replace the two dated
controls with the app's pill language:

- The native element `<select>` becomes a single-select strip of the 8 elements, each rendered as an
  `<ElementIcon>` + its name. Click to pick, click again to clear.
- The rectangular `<input type="number">` becomes a 1–6 segmented chip control.

The existing free-form odds sentence ("N% chance of drawing at least N X in D cards") keeps computing
off the active pool and draw count, unchanged — only how the element and count are entered changes.
No spirit-seeding yet (that's ticket 02).

## Acceptance criteria

- [ ] Element is chosen from an 8-chip icon+name strip; selecting one drives the odds sentence exactly as the old dropdown did.
- [ ] Re-clicking the selected element clears it (back to the no-element state).
- [ ] Count is chosen from a 1–6 chip control and drives "at least N".
- [ ] The odds math (`probAtLeast` over the active composition) is untouched.
- [ ] The controls read as the same pill styling used elsewhere on the Dashboard; no native select / number box remains in this block.
- [ ] `appSmoke.test.tsx` still renders the Dashboard (element strip + count chips) without crashing.

## Blocked by

- None — can start immediately.
