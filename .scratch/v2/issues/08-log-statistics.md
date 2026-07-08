# 08 — Descriptive statistics over the game log

Status: ready-for-agent

## Parent

`.scratch/v2/PRD.md`

## What to build

Honest descriptive statistics over the logged games, so the owner can draw their own conclusions.
**Display only.**

- A pure module computing aggregates from log entries: games played, win rate overall, win rate
  by spirit / configuration, by effective complexity band, and by adversary (and adversary level).
- Shown in the Log tab.

### Hard constraint

These statistics **feed nothing**. They do not adjust tiers, weights, complexity overrides, or the
recommender in any way. The human reads them and turns the knobs — exactly as with the team
coverage panel. Any suggestion derived from them must be phrased as a suggestion to the user, not
applied automatically.

Small samples must not be presented as if they were meaningful: show the underlying count
alongside every rate (e.g. "60% (3/5)"), and do not display a rate at all below a small threshold.

## Acceptance criteria

- [ ] Aggregates are computed by a pure function over log entries (no storage, no DOM in its tests)
- [ ] Games played, overall win rate, win rate by spirit, by complexity band, and by adversary
- [ ] Every rate is displayed with its sample size
- [ ] Rates are suppressed (or clearly marked) below a small sample threshold
- [ ] An empty log renders without error
- [ ] Nothing in this slice writes to `tierStore`, `complexityStore`, or the weights
- [ ] `recommend()`'s output is unchanged by the presence of this panel

## Blocked by

- #06 (needs logged games)
