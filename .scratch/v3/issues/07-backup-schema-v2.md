# 07 — Backup schema v2: edits to every personal list

Status: done

## Parent

`.scratch/v3/PRD.md`

## What to build

A backup carries the owner's tier edits. Now that he has more than one list, a flat map of
`configId -> Tier` cannot say which list an edit belongs to, and a restore would attribute every
edit to whichever list happened to be active.

- `CURRENT_SCHEMA_VERSION` bumps to `2`.
- `BackupState.tiers` becomes `Record<listId, Record<configId, string>>`.
- Export carries the owner's edits to **every** personal list, not just the active one.
- **A v1 backup still restores.** Its flat override map migrates on import by attributing it to the
  owner's personal strength list — the only list a v1 backup could have been describing.
- The existing `unresolved` reporting extends to list ids. An import naming a list id the app no
  longer has lands in `unresolved` rather than being dropped or silently applied. Stale keys surface;
  they do not vanish.
- The existing v2-era guarantees hold: `complexityOverrides`, `answers` and the log are untouched,
  and the log still merges by id rather than replacing.

## Acceptance criteria

- [ ] A v1 backup round-trips into the v2 shape, its tiers landing on the owner's personal strength
      list
- [ ] A v2 backup carrying edits to several personal lists restores each to its own list
- [ ] An import naming an unknown list id reports it in `unresolved`, applies nothing from it, and
      does not throw
- [ ] An import naming an unknown `configId` inside a known list still reports it in `unresolved`
      (existing behaviour, per the v1 tests)
- [ ] Export omits no-op overrides, per `getOverrides()`'s existing filter — "has edits" and
      "exports edits" cannot disagree
- [ ] A backup with `schemaVersion: 3` is rejected with the existing newer-app-version message
- [ ] `backup.test.ts` covers all of the above; the log-merge and validation tests still pass

## Blocked by

- #04 (overrides must key by `listId` before a backup can carry them per list)

## Comments

Resolved. `CURRENT_SCHEMA_VERSION = 2`; `BackupState.tiers` is
`Record<listId, Record<configId, string>>`. `parse()` takes an `ownersListId` param used only
for v1 migration (`migrateV1Tiers`); v2 payloads go through `filterTiersV2`, which reports an
unknown `listId` in `unresolved` without dropping the rest of the file. `KnownIds` gained
`listIds`. `backup.test.ts` rewritten for the v2 shape plus v1-migration and unknown-list-id
cases.
