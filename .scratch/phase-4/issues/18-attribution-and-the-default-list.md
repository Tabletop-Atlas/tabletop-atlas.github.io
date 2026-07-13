# 18 — Attribution and the default list

Status: ready-for-agent
Parent: [Phase 4 PRD](../PRD.md) · cluster 4 (tier UX)

## Blocked by

- [#12 the subject axis](12-the-subject-axis.md) — the default-list domain rule lives there
- [#14 the Settings tab](14-the-settings-tab.md) — the pick lives in Settings

## What to build

Two credit-where-due behaviours:

- **Attribution display:** when the active list is cited, the tier surface visibly credits it —
  author, title, and a link — straight from the citation fields the schema already carries
  (locked owner call: the default list is 3 Minute Board Games' published ranking, "not mine").
  A personal list shows its personal origin instead; no fake citations.
- **The default-list pick:** Settings gains a "default tier list" preference (per its open-door
  policy) choosing which list boots as active per subject; seeded to the credited default list.
  **Verify the seed against the shipped lists' citation URLs** — the owner named a specific
  video as the default; if no shipped list's citation matches it, stop and surface to the owner
  rather than guessing which list they meant.

## Acceptance criteria

- [ ] The tier surface shows author/title/link for any active cited list; personal lists show
      origin without a citation
- [ ] Settings offers the default-list pick; changing it changes which list is active on next
      boot
- [ ] The shipped seed is verified against the owner's named source URL (or explicitly escalated)
- [ ] Default-list behaviour unit-tested with injected storage
- [ ] App smoke asserts the credit line renders for the default boot state
