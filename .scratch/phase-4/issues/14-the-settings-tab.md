# 14 — The Settings tab

Status: done
Parent: [Phase 4 PRD](../PRD.md) · cluster 3 (app restructure)

## Blocked by

- [#13 the homepage](13-the-homepage.md) — one nav change at a time; this ticket adds the
  Settings button after #13's reorder lands.

## What to build

Per the [Settings resolution](02-the-settings-tab.md): a new Settings tab, last in nav, holding
the three sections that today ride inside "Customise tiers" — **Backup**, **My collection**, and
**Complexity overrides** — moved with behaviour identical. The Customise tab survives this
ticket slimmed to pure tier editing (its deletion is [#15](15-edit-mode-and-the-dissolution.md)'s
job, once edit mode exists to receive it). The v5 split stands: the durable collection is edited
here; each surface keeps its session-only hide-unowned checkbox.

## Acceptance criteria

- [x] Settings is the last nav item and contains exactly the three migrated sections
- [x] Backup export/import round-trips exactly as before; collection toggles annotate
      Browse/Recommend/tier board as before; complexity overrides still feed the recommender
- [x] Customise tiers shows only tier editing — no settings sections remain in it
- [x] Per-surface session-only hide-unowned checkboxes unchanged
- [x] App smoke asserts the Settings tab and its sections; existing store tests untouched

## Comments

**Resolved (2026-07-13).** `Settings.tsx` receives Backup, My collection, and Complexity
overrides byte-identical from `TierEditor` (plus the complexity-discard notice, which belongs to
its section; the tier-discard notice stays with tier editing). Two deliberate copy adaptations:
"the tier board below" lost its "below" (the board is no longer on that page), and TierEditor's
reset/discard copy now says "Export a backup **from Settings**" since Export moved tabs.
Settings is last in nav (#02 decision 4 — nav now fixed at both ends); Customise tiers is
slimmed to pure tier editing, awaiting #15's dissolution. Browser/Recommender/TierBoard untouched
— the session-only hide-unowned checkboxes stand, per the v5 split.

Verified: 340/340 (smoke asserts Settings last in nav, exactly three `<h3>` sections, and their
absence from Customise tiers); production build at 375px + 1280px — export fires a real download,
unticking an expansion dims tier-board tiles, no settings section remains in Customise tiers.
Screenshots in `../screenshots-14/`. Code review (two-axis): zero hard violations; the
"moved verbatim" claim was independently line-diffed and holds; its two judgement calls (stale
export copy, unbounded "exactly three" assertion) applied.
