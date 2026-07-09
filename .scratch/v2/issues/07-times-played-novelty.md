# 07 — `timesPlayed` gives the novelty knob a concrete meaning

Status: done

## Parent

`.scratch/v2/PRD.md`

## What to build

Today the strength↔novelty knob's "something fresh" end means only *"ignore the tier list"*.
Make it mean **"something I have literally never played."**

- `recommend()` accepts `timesPlayed` (a map of configId → count, derived from the game log).
- At the novelty end of the knob, configurations the owner has never played are favoured;
  configurations played often are gently disfavoured. At the strength end, `timesPlayed` has
  no effect.
- This is the **only** signal the log contributes to scoring, and it is a **fact**, not an
  inference from outcomes.

Keep the contribution transparent and additive, in the same spirit as the tier prior: it must
never fully override fit, and with an empty log the ranking must be identical to today's.

## Acceptance criteria

- [ ] With an empty log, rankings are unchanged from before this slice
- [ ] At full novelty, a never-played configuration outranks an otherwise-identical played one
- [ ] At full strength, `timesPlayed` changes no ranking
- [ ] `timesPlayed` never fully overrides fit
- [ ] **A logged loss (as opposed to a play count) changes nothing** — outcomes remain unscored
- [ ] The novelty contribution is covered by ranking-behaviour tests against fixtures

## Blocked by

- #06 (the log produces `timesPlayed`)
