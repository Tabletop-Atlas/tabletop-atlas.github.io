# 17 — Verify the terror-level range against the rulebook

Status: done

## Parent

`.scratch/v2/PRD.md`

## What to build

The game log's optional terror-level input is capped at `max={3}`. This may be wrong — reaching
Terror Level 4 is, as far as the reviewer recalls, itself a victory condition, which would make
it a perfectly ordinary value to record on a won game and one the form currently refuses.

**This issue is deliberately not marked `ready-for-agent`, and that is the whole point.** The
PRD records that this project's documented failure mode is an agent guessing when a source
cannot answer, and that it has already shipped fabricated data to production three times. A
half-remembered rules detail is exactly that trap. The reviewer who filed this is *fairly sure*
and that is not good enough.

Resolve it from the rulebook, then either fix the cap or close this as correct. Whoever picks
this up: read the source, do not reason from what sounds right.

Note also that the `min` / `max` attributes on the existing number inputs are advisory. They
constrain the spinner, not a typed or pasted value, and `Number('')` is `0`. Whatever range
turns out to be correct, it needs enforcing where the entry is built, not only in the markup.

## Acceptance criteria

- [x] The correct terror-level range is established from the rulebook and the source is recorded
- [x] The input's cap matches that range
- [x] An out-of-range value cannot be recorded, whether typed, pasted or spun
- [x] The same enforcement question is answered for `adversaryLevel` and `blightRemaining`

## Blocked by

- None — can start immediately

## Comments

**Resolved 2026-07-16, at the owner's explicit direction to check the rulebook directly** (this
ticket is deliberately gated `ready-for-human`; proceeding here was an owner override, not a
default agent action).

**The range was already correct.** There are exactly **three Terror Levels** — no Terror Level 4
exists. Confirmed against the Spirit Island Wiki's "Fear and Terror" page
(https://spiritislandwiki.com/index.php?title=Fear_and_Terror): the Fear Deck carries a "Terror
Level 2" divider and a "Terror Level 3" divider only; beyond Terror Level 3 the deck's final space
is a separate "Victory!" card (earning every Fear Card), not a fourth Terror Level. Corroborated by
UltraBoardGames' rules summary and the Dized digital rules reference. The reviewer's recollection
that "reaching Terror Level 4 is a win condition" doesn't match any source — Terror Level 3 is the
last level; the outright win is earning all Fear cards, a different track entirely. `min={1}
max={3}` on the terror-level input was already right; no cap change was needed.

**Enforcement gap found and fixed regardless:** the `min`/`max` attributes are markup only — a
typed or pasted value, or the empty-string-is-0 trap, bypassed them. Added
`clampOptionalInt(raw, min, max?)` in `src/domain/logEntry.ts` (pure, tested in
`logEntry.test.ts`): empty or non-numeric input means "not recorded" (`undefined`, never a
fabricated `0`), otherwise the value is rounded and clamped. `GameLog.tsx`'s submit handler now
builds `terrorLevel` via `clampOptionalInt(terrorLevel, 1, 3)` and `blightRemaining` via
`clampOptionalInt(blightRemaining, 0)` (blight has no fixed upper bound — it varies by board/
expansion, so only the floor is enforced, matching the existing unbounded `max` on that input).

**`adversaryLevel` was already partly enforced** (`handleSetAdversaryLevel` clamps to the selected
adversary's `minLevel`/`maxLevel` on every keystroke) but had a latent bug: a non-numeric paste
produced `Number(raw) === NaN`, and `Math.min(Math.max(NaN, min), max)` is `NaN` — which
`JSON.stringify`s to `null`, silently corrupting the entry. Fixed by ignoring non-finite input
(keeping the last valid level) before clamping.

398 tests pass (6 new), `tsc -b`/`oxlint` clean.
