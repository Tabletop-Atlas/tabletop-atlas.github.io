# 17 — Verify the terror-level range against the rulebook

Status: ready-for-human

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

- [ ] The correct terror-level range is established from the rulebook and the source is recorded
- [ ] The input's cap matches that range
- [ ] An out-of-range value cannot be recorded, whether typed, pasted or spun
- [ ] The same enforcement question is answered for `adversaryLevel` and `blightRemaining`

## Blocked by

- None — can start immediately
