# 11 — Export the user's overrides, not the shipped seed

Status: ready-for-agent

## Parent

`.scratch/v2/PRD.md`

## What to build

Both `tierStore.getAll()` and `complexityStore.getAll()` return **the shipped seed overlaid
with the user's edits** — that is what they are for, and the recommender depends on it. But
the export path passes those same values straight into the backup file. The file therefore
contains all 68 tiers and all 37 complexity values, whether or not the user changed anything.

On import, every one of those keys is written back through `setTier` / `setComplexity`, so
they all become personal overrides. A user who has changed nothing, after an export followed
by an import, reports `isCustomised() === true` for both stores: the "Reset to the shipped
tier list" button lights up and "You have overrides set." appears, for a user with no
overrides. The PRD names the file's section `complexityOverrides`; it should hold overrides.

Give both stores a way to read **only the user's edits** (the keys whose value differs from
the seed) and have the export use that. The backup file's `tiers` section should likewise
carry only what the owner actually reassigned — a restore still lands losslessly, because
untouched keys fall back to the seed by design.

Do not change what `getAll()` returns; the recommender and `groupByTier` rely on the merged
view.

## Acceptance criteria

- [ ] Each store exposes a way to read only the user's edits, distinct from `getAll()`
- [ ] A backup exported by a user who changed nothing contains empty `tiers` and empty `complexityOverrides`
- [ ] Export → import on an untouched app leaves `isCustomised()` false for both stores
- [ ] Export → import after real edits restores exactly those edits, and only those edits
- [ ] A backup exported against the 37-key seed still imports losslessly into the 68-key seed (story 38 stays true)
- [ ] Imported overrides are stamped with the *current* seed fingerprint, as today

## Blocked by

- None — can start immediately

## Comments

Runs in the same file as #12 (`TierEditor`). Do not run them in parallel.

Resolved: both `tierStore` and `complexityStore` now expose `getOverrides()` (only the user's
edits); `TierEditor.handleExport` uses it instead of `getAll()`. `getAll()` is unchanged. Tests
added in `tierStore.test.ts` / `complexityStore.test.ts`.
