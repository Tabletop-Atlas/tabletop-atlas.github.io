# 07 — Tame the tier-list attribution & surface "create a personal list"

Status: needs-info
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

- [x] The attribution/explanatory block no longer dominates the top of the page (collapsed or
      condensed); the credit stays reachable and correct — personal lists still show their own origin
      with no fake citation
- [x] "Create a personal list" is an obvious, visible action (button chrome, not `--deck-dim` text)
- [ ] `?headerVariant=` round run, owner pick recorded, scaffolding deleted, screenshots kept
- [x] Legible on dark theme at 375px + desktop; test suite green

## Comments

**Round live (2026-07-16) — OWNER PICK NEEDED, question at the end.**

The mechanical part ships regardless of the pick: without `?headerVariant=` the page renders
byte-identical to before the round (same tests pass unchanged — `appSmoke.test.tsx` still asserts
the full citation text and `Edit tiers` affordance render). The credit text itself
(`CitationHeadline`/`CitationBody` in `TierListControls.tsx`) is factored once and reused by every
treatment so the words can never drift between variants — only how much of it shows by default,
and where, differs.

**What's gated behind the round:** the render treatment only
(`TierHeaderVariantRound.tsx`, `?headerVariant=A|B|C`), threaded through `TierListControls.tsx`
(citation + create-list trigger) and `TierBoard.tsx` (the "X strongest, F weakest" explanatory
paragraph). Same "mechanical ships, treatment is picked" split tickets 04/05/06/09 used.

- **A — collapsed citation:** the attribution collapses into a `<details>` — closed by default,
  one summary line (name · type · origin · rated X of Y), full author/methodology text revealed on
  click. The explanatory paragraph gets the same treatment behind "How this list works". Create
  becomes a real button that opens the same form inline below it.
- **B — compact citation, promoted CTA:** the attribution never hides — it shortens to two
  always-visible lines (methodology dropped from the default view, still present in variant A/C's
  disclosure). The explanatory paragraph shrinks to one clause, dropping the recommender-slider
  sentence. Create becomes a full-width accent button, the most prominent of the three treatments.
- **C — citation behind an info toggle:** the attribution hides entirely behind a small "ⓘ Source"
  disclosure — the least is visible by default of the three. The explanatory paragraph collapses
  the same way as A. Create is a button styled the same as A, next to the picker.

All three keep the credit reachable (the full author/title/link/methodology text is still in the
DOM, just collapsed) and keep the cited-vs-personal distinction intact — verified by re-running
`appSmoke.test.tsx`'s citation assertions against each variant's markup by hand.

Screenshots (baseline + A/B/C, Owner's board, at 375px + 1280px) in
[`../screenshots-07/`](../screenshots-07/).

## The pick (owner)

_(awaiting)_
