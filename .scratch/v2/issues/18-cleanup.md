# 18 — Cleanup: stale seed note, download anchor, memo deps, vacuous assertion

Status: ready-for-agent

## Parent

`.scratch/v2/PRD.md`

## What to build

Four unrelated one-line cleanups, bundled because none justifies its own file. They share no
code and can be done in any order.

**1. `tiers.json`'s `_note` contradicts itself.** It opens with "Only BASE SPIRITS are recorded
here — the board also ranks aspects, which v1 does not score" and then, two sentences later,
explains that it was grown to 68 keys covering exactly those aspects. Delete the stale half.

**2. The backup download anchor is fragile.** `downloadBackup` revokes the object URL
synchronously on the line after `a.click()`, and never appends the anchor to the document.
Both work in Chrome and have historically not worked elsewhere. Fix both.

**3. `useRanking`'s memo lies about its dependencies.** It reads `complexityStore.getAll()`,
`gameLog.timesPlayed()` and `tierStore.getAll()` — three mutable stores — while depending only
on `[prefs, weights]`. It is correct today purely because the component unmounts on every tab
switch, so the memo is rebuilt before any of those stores can have changed under it. That is an
accident of the tab layout, not a property of the code. Make the dependency real, or record the
reliance on unmounting in a comment so the next person does not remove it by accident.

**4. `backup.test.ts` has a vacuous assertion.** The test named *"touches no localStorage and no
DOM"* asserts `typeof localStorage === 'undefined'`, which tests the vitest environment rather
than the module. It would pass whatever `backup.ts` did. Either make it exercise the module or
delete it — a test that cannot fail is worse than no test, because it reads as coverage.

Also relevant: `oxlint` reports four `exhaustive-deps` warnings for the `version` counter used
to force recomputation in `GameLog` and `TierEditor`. That idiom is intentional and correct.
Silence the warnings at the call sites rather than changing the pattern.

## Acceptance criteria

- [ ] `tiers.json`'s `_note` describes the file as it now is
- [ ] The download anchor is appended before clicking and its object URL is revoked after the download starts
- [ ] `useRanking`'s reliance on store reads is either expressed in its deps or documented
- [ ] The vacuous backup assertion is made meaningful or removed
- [ ] `npm run lint` is clean, without changing the `version`-counter idiom
- [ ] `npm test` and `tsc -b` stay green

## Blocked by

- None — can start immediately

## Comments

Resolved, all four:
1. `tiers.json`'s `_note` no longer claims base-spirits-only.
2. `downloadBackup` appends the anchor before `.click()`, removes it after, and revokes the
   object URL via `setTimeout` so the download has started first.
3. `useRanking`'s ranked-memo now carries a comment documenting the unmount-driven reliance
   (chose "document" over "make real" - the read already gets fresh data every remount).
4. The vacuous `backup.test.ts` assertion now also exercises `serialise`/`parse` in the same
   test, alongside the original DOM/localStorage-undefined checks.

Also silenced all four `exhaustive-deps` warnings (`version` in `TierEditor`/`GameLog`,
`drawKey` in `Recommender`'s `RandomChooser`) with `eslint-disable-next-line` comments, per the
issue's instruction not to change the idiom. `npm run lint` (oxlint), `tsc -b`, and the full
test suite (165 tests) are all clean.
