# 12 — Warn before an import discards tiers, overrides and answers

Status: ready-for-agent

## Parent

`.scratch/v2/PRD.md`

## What to build

Story 37: *"I want to be warned before any action that discards saved data, so that I can
export first."*

"Reset to the shipped tier list" already confirms before it destroys tier edits. Import
destroys strictly more — by design it **replaces** tiers, complexity overrides and answers
(the log is appended and de-duplicated, so it is safe) — and confirms nothing. Picking a file
wipes the owner's opinion with no way back.

Warn before applying an import, and only when there is something to lose. The warning should
name what will be replaced and what will be merged, so the asymmetry the PRD calls "the
design" is visible at the moment it matters.

Nothing should be written to any store if the user cancels.

## Acceptance criteria

- [ ] Selecting a backup file warns before any store is written
- [ ] Cancelling leaves tiers, complexity overrides, answers and the log completely untouched
- [ ] The warning distinguishes what is replaced (tiers, overrides, answers) from what is merged (the log)
- [ ] Confirming applies the import exactly as it does today, including the unresolved-ids message
- [ ] A malformed or future-schema file still reports its error without warning first — there is nothing to discard

## Blocked by

- None — can start immediately

## Comments

Runs in the same file as #11 (`TierEditor`). Do not run them in parallel.

Resolved: `handleImportFile` now parses first (so a malformed/future-schema file still errors
without warning), then confirms only if `tierStore`/`complexityStore` are customised, answers
exist, or the log is non-empty. The confirm text names what's replaced (tiers, overrides,
answers) vs merged (log). Cancelling returns before any store is touched. UI is deliberately
not unit-tested in this repo (see `appSmoke.test.tsx`'s header comment), so no new test file.
