# 19 — A log entry without a usable `players` array must be rejected, not stored

Status: done

## Parent

`.scratch/v2/PRD.md`

## What to build

#14 taught `mergeLog` to reject an imported log entry with a missing or invalid `id`. It
validates nothing else. An entry with a perfectly good `id` and **no `players` array** passes
validation, merges into the log, and is persisted by `gameLog.replaceAll`.

The next thing that reads the log is `gameLog.timesPlayed()`, which does
`entry.players.some(...)` and throws:

```
TypeError: Cannot read properties of undefined (reading 'some')
```

`useRanking` calls `timesPlayed` for all 68 configurations on every render of the Recommend
tab. So importing one malformed entry does not fail the import — it **succeeds**, writes the
bad entry to `localStorage`, and then throws on every subsequent load of the app's main
screen. The user's only escape is clearing their browser storage, which costs them everything
the backup feature exists to protect.

Import is the one place a truncated, hand-edited or hostile file crosses into the app. It is a
trust boundary, and the PRD treats every other one of them carefully.

The `entry.players ?? []` fallback currently in `mergeLog` is what hides this: the merge
tolerates the absent array and then stores the entry regardless. Reject rather than tolerate.

Note also that a string is iterable. `players: "nope"` walks its characters, reads `.configId`
off each one, and pushes `undefined` into `unresolved` — so the entry is both accepted and
mis-reported.

Apply the same discipline the `id` guard already follows: an entry that cannot be used is
reported through `unresolved` and left out of the log. A file with one bad entry still imports
every good one.

## Acceptance criteria

- [ ] An entry whose `players` is missing, `null`, or not an array is reported as unresolved and not merged
- [ ] An entry whose `players` is a string is rejected, not iterated character by character
- [ ] A player entry missing `name` or `configId` is reported as unresolved
- [ ] After importing a file containing such an entry, `gameLog.timesPlayed()` does not throw
- [ ] After importing such a file, the Recommend tab renders
- [ ] A file with one bad entry still imports every good entry
- [ ] Well-formed entries merge and de-dupe by id exactly as they do today
- [ ] `parse` stays pure — no storage, no DOM

## Blocked by

- None — can start immediately

## Comments

Resolved: `mergeLog` now calls a `hasValidPlayers` guard before merging - `Array.isArray` plus a
check that every player has a string `name` and `configId`. A string value for `players` fails
`Array.isArray` outright, so it's rejected rather than iterated character by character. A
rejected entry is reported as `'log entry with missing or invalid players'` and skipped, same
discipline as the `id` guard from #14. Tests added in `backup.test.ts` covering missing/null/
non-array/string players, a player missing `name` or `configId`, and one-bad-entry-doesn't-
block-the-rest.
