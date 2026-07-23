# 04 — Delete + undo

Status: done
Parent: ../PRD.md

## What to build

Let the user delete a game from history, with an instant undo for the misclick.

- Add `remove(id)` to the `gameLog` store.
- Add a delete control to each history row.
- On delete, show an ephemeral (~10s) "Deleted — Undo" toast; Undo re-`append`s the removed entry
  with its original stable `id`. No persisted trash, no `deletedAt` — once the toast lapses, deletion
  is final and durable recovery is the existing backup export.
- Keep the local-first model intact (no backend, no sync).

## Acceptance criteria

- [ ] A history row can be deleted and disappears from the table.
- [ ] A "Deleted — Undo" toast appears for ~10s; Undo restores the exact entry (same `id`).
- [ ] After the toast lapses, the entry is gone (no persisted trash).
- [ ] `gameLog.test.ts` covers: `remove(id)` drops only that entry; re-`append` (undo) restores it with its original `id`; `timesPlayed` reflects the removal.

## Blocked by

- 03 — Tabular history (the delete control hangs off each table row).
