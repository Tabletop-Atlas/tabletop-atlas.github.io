# 17 — The interconnect

Status: done
Parent: [Phase 4 PRD](../PRD.md) · cluster 4 (tier UX)

## Blocked by

- [#12 the subject axis](12-the-subject-axis.md) — tier chips read the active
  configurations-list
- [#15 edit mode and the dissolution](15-edit-mode-and-the-dissolution.md) — edit mode gates the
  click

## What to build

Both directions of the [interconnect resolution](07-tier-list-browser-interconnect.md):

- **Board → detail:** in view mode, clicking any configurations-list tile opens the same
  spirit-detail modal Browse uses, over the board. Clicking an **aspect** tile opens the base
  spirit's modal scrolled to the Aspects section with the clicked aspect's row highlighted. In
  edit mode, clicks edit — the modal never opens. Card-subject tiles stay inert (no card detail
  view exists this phase).
- **Detail → tiers:** the head's plain-text tier line becomes a coloured tier chip for the base
  configuration; every aspect row gains its own small tier chip. Colours come from the tier's
  position in the **active configurations-list's own vocabulary** (the existing position-based
  colour mapping); a configuration absent from the list renders an outlined "unrated" chip —
  never a defaulted tier.

## Acceptance criteria

- [x] View-mode tile click opens the modal, identical in content to Browse's; edit-mode clicks
      never open it
- [x] Aspect-tile click lands scrolled to the Aspects section with that aspect highlighted
- [x] Head chip + per-aspect-row chips render coloured from the active list; switching the
      active list changes them everywhere at once
- [x] Unrated configurations show the outlined chip on both board-opened and Browse-opened modals
- [x] Works correctly on a partial list (absent keys) — the honest-absence rule holds
- [x] Browser-verified at 375px + desktop

## Comments

**Resolved (2026-07-13).** Board → detail: view-mode tiles carry `role="button"` with
keyboard support and open the **same** `SpiritDetail` Browse renders (only extra prop:
`highlightAspect`); an aspect tile opens the base spirit's modal scrolled once to the clicked
aspect's row with an accent highlight (scroll is guarded one-time — an inline callback ref would
otherwise re-fire and snap scroll on every modal re-render). In edit mode `onOpen` is never
wired, so the modal cannot open; card tiles have no click path at all. Detail → tiers: the
head's plain tier text became a coloured `TierChip`, and every aspect row carries its own —
colour from the label's position in the active configurations-list's vocabulary via the existing
`tierColor`; an absent key (or a stale out-of-vocabulary override, unified with `groupByTier`'s
rule so chip and board can never disagree) renders the outlined "unrated" chip. Aspect chip ids
come from `toConfigId`, not a hand-built template.

Verified: 359/359 (smoke: unrated chip, coloured head + per-aspect chips, single highlight);
production build at 375px + 1280px — click-through from board and Browse, aspect scroll+highlight
geometrically in view, edit-mode never opens, 3MBG active shows unrated aspect chips (partial
list). Screenshots in `../screenshots-17/`. Code review: two hard findings fixed pre-commit
(hand-built configId → `toConfigId`; re-firing scroll ref → one-time guard) plus the stale-label
unification.
