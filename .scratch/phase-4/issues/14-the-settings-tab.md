# 14 — The Settings tab

Status: ready-for-agent
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

- [ ] Settings is the last nav item and contains exactly the three migrated sections
- [ ] Backup export/import round-trips exactly as before; collection toggles annotate
      Browse/Recommend/tier board as before; complexity overrides still feed the recommender
- [ ] Customise tiers shows only tier editing — no settings sections remain in it
- [ ] Per-surface session-only hide-unowned checkboxes unchanged
- [ ] App smoke asserts the Settings tab and its sections; existing store tests untouched
