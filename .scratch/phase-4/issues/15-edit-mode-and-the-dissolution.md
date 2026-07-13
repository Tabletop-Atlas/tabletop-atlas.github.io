# 15 — Edit mode and the dissolution

Status: ready-for-agent
Parent: [Phase 4 PRD](../PRD.md) · cluster 3 (app restructure)

## Blocked by

- [#14 the Settings tab](14-the-settings-tab.md) — the other three sections must already have
  their new home before the Customise tab can be deleted.

## What to build

Tier editing moves onto the board, completing the
[Settings resolution](02-the-settings-tab.md)'s dissolution call: the Tier list tab gains an
**edit mode** available only when the active list is personal-origin. In edit mode the owner
assigns and moves configurations between tiers (including the unrated bucket) directly on the
board, persisting through the existing override machinery. Cited lists show no edit affordance —
the store already refuses their edits; the UI must not offer them. With editing relocated, the
Customise tiers tab is deleted, leaving nav as: Browse, Recommend, Archive, Tier list, Log,
Settings.

Note for [#17](17-the-interconnect.md): edit mode owns tile clicks while active — the
view-mode click-to-detail behaviour arrives there and must never fire during editing.

## Acceptance criteria

- [ ] Edit mode toggle appears only for personal-origin lists; cited lists offer no editing
- [ ] Assigning/moving a configuration's tier on the board (incl. to/from unrated) persists and
      survives reload
- [ ] The Customise tiers tab is gone from nav and from the codebase
- [ ] Nav reads exactly: Browse, Recommend, Archive, Tier list, Log, Settings (app smoke asserts)
- [ ] Existing tier-store override/fingerprint tests still pass unchanged
