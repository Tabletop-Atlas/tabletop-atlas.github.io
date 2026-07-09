# 09 — Make `playerCount` stop lying

Status: done

## Parent

`.scratch/v2/PRD.md`

## What to build

The wizard asks "How many players at the table?", stores the answer in state, and **nothing ever
reads it**. The v1 PRD says player count should surface player-count-relevant `notes` on
recommendations; today `notes` render unconditionally regardless of the answer.

Either make the question do its job, or delete it. It should do its job:

- Player count remains a **light annotation only** — it must not affect scoring, and must not
  become a per-player-count tier dimension (both explicitly out of scope, in v1 and v2).
- Recommendation cards highlight `notes` that are relevant to the stated player count
  ("strong solo", "shines at high player counts", "weak inland"), and de-emphasise or omit those
  that aren't.
- The control stays live in the sidebar, alongside the other answers.

This is an independent slice: it touches no configuration, tier, or log code.

## Acceptance criteria

- [ ] Changing player count changes which `notes` are surfaced on recommendation cards
- [ ] Player count affects **no** score — `recommend()`'s ordering is identical for any player count
- [ ] Notes with no player-count relevance still display
- [ ] The player-count control is live in the sidebar (changing it updates the results immediately)
- [ ] No per-player-count tier data is introduced

## Blocked by

None - can start immediately.
