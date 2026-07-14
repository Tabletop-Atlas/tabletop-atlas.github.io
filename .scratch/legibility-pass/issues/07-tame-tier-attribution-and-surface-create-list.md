# 07 — Tame the tier-list attribution & surface "create a personal list"

Status: ready-for-human
Label: wayfinder:prototype (HITL — owner picks the look)
Parent: [Legibility-pass map](../MAP.md)

## Blocked by

_(nothing — independent surface)_

## Question

Two related complaints about the tier-list page (`TierBoard.tsx` + `TierListControls.tsx`):

1. **The source/attribution block is too long and interrupts the page.** Above the actual tier rows
   sit (a) `TierListCitation` — 4–5 `<p class="meta">` lines: name/type/origin, "By {author} ·
   {title-link} · {N players} · published…", methodology, "rated X of Y"
   (`TierListControls.tsx:13-45`); and (b) a verbose explanatory paragraph — "{strongest} is
   strongest, {weakest} weakest," + the recommender-slider sentence + edit-mode instructions
   (`TierBoard.tsx:220-234`). The owner wants this **hidden or made nicer** so it stops pushing the
   board down the page. Keep the attribution *available* (it's a real credit — "not mine", the 3MBG
   default) — collapse/condense it, don't delete the credit.

2. **"Create a personal list" is nearly invisible.** It's a `<details>/<summary>` disclosure styled
   `color: var(--deck-dim)` (the dimmest grey) at 12px with no button chrome
   (`TierListControls.tsx:128-168`, `deck.css:962-970`) — it reads as muted secondary text, not an
   action. The owner "took a while to even spot it." Make it a **visible affordance** (a proper
   button) without cluttering the controls bar.

**How should the tidied header + the create action look?** Run a `?variant=` round covering both
(e.g. collapsed-citation-line + prominent create button); the **owner picks**; ship the winner.

## Acceptance criteria

- [ ] The attribution/explanatory block no longer dominates the top of the page (collapsed or
      condensed); the credit stays reachable and correct — personal lists still show their own origin
      with no fake citation
- [ ] "Create a personal list" is an obvious, visible action (button chrome, not `--deck-dim` text)
- [ ] `?variant=` round run, owner pick recorded, scaffolding deleted, screenshots kept
- [ ] Legible on dark theme at 375px + desktop; test suite green
