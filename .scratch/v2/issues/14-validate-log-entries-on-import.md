# 14 — Validate log entries on import instead of collapsing them

Status: done

## Parent

`.scratch/v2/PRD.md`

## What to build

`backup.parse()` merges the imported log by keying straight off `entry.id`. Nothing checks
that an `id` is present. An entry without one is stored under the key `undefined`, and every
subsequent id-less entry is then treated as a duplicate of it and silently dropped.

That is exactly backwards for the one merge path whose stated purpose (story 35) is that
merging two devices' histories **never destroys a played game**. The whole reason every entry
is stamped with `crypto.randomUUID()` at creation is that cross-device dedupe is impossible
without a stable id — so an entry arriving without one is a fact about the file, and the PRD
is unambiguous about what to do with facts you cannot resolve: **report them** (story 36).

Two gaps to close, both in the same pure function:

- An entry whose `id` is not a string is not merged into the log. It is reported.
- A `configId` inside an imported entry that the current dataset does not recognise is
  reported too. Today the log section is never checked against known ids at all, while
  `tiers`, `complexityOverrides` and `answers` all are.

Reporting means the existing `unresolved` channel, which the Customise tab already surfaces.
Do not throw: a backup with one bad entry should still restore the other 99.

## Acceptance criteria

- [ ] An imported entry with a missing or non-string `id` is reported as unresolved, not merged
- [ ] Two id-less entries no longer collapse into one
- [ ] An imported entry naming an unknown `configId` is reported as unresolved
- [ ] A file with one bad entry still imports every good entry
- [ ] Dedupe-by-id for well-formed entries is unchanged; existing entries still win over incoming duplicates
- [ ] `parse` stays pure — no storage, no DOM

## Blocked by

- None — can start immediately

## Comments

Resolved: `mergeLog` in `backup.ts` now takes the known configId set and the shared
`unresolved` array. An entry with a missing/non-string `id` is reported as
`'log entry with missing or invalid id'` and skipped, rather than colliding under `undefined`.
Each player's `configId` is checked against `known.tierIds` and unknown ones are reported (the
entry itself still merges - the log's whole point is never destroying a played game). Tests
added in `backup.test.ts`.
