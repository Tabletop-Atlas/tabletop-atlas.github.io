# 17 — The interconnect

Status: ready-for-agent
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

- [ ] View-mode tile click opens the modal, identical in content to Browse's; edit-mode clicks
      never open it
- [ ] Aspect-tile click lands scrolled to the Aspects section with that aspect highlighted
- [ ] Head chip + per-aspect-row chips render coloured from the active list; switching the
      active list changes them everywhere at once
- [ ] Unrated configurations show the outlined chip on both board-opened and Browse-opened modals
- [ ] Works correctly on a partial list (absent keys) — the honest-absence rule holds
- [ ] Browser-verified at 375px + desktop
