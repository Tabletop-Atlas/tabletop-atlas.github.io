# 22 — The aspect nudge and the sibling list argue about the same aspects

Status: needs-triage

## Parent

`.scratch/v2/PRD.md`

## The observation

An expanded result row now renders three overlapping views of the same aspects:

1. `findAspectNudge`'s message — "you might like this aspect"
2. `spirit.aspects`, each with its transcribed effect
3. the sibling configurations, each with its tier and effective complexity

The nudge existed because **v1 could not rank aspects**. It was the only way an aspect could
reach the user at all. v2 ranks them directly, so at first glance the nudge is arguing for
something the recommender has already decided — and may have decided against.

## Why this is not simply "delete the nudge"

`findAspectNudge` fires on `aspect.shiftsToward`: it looks for an aspect that points at an
OCFDU axis the user weighted highly and the base spirit rates low on.

`shiftsToward` feeds **nothing else**. The PRD puts "bending fit by `shiftsToward`" explicitly
out of scope for v2 — fit is inherited from the base spirit, unmodified — and calls it a
deliberate follow-on phase. So the nudge is currently the *only* place that hint reaches a
human. Delete it and v2 silently loses the one signal that a later phase is meant to promote
into scoring.

That makes this a design question, not a cleanup.

## The decision to make

Pick one:

- **Keep the nudge as-is.** It is the placeholder for unshipped fit-bending. Then say so in a
  comment on `findAspectNudge`, because nothing currently explains why a ranked-aspect app
  still nudges toward aspects.
- **Fold the hint into the sibling list.** A sibling whose `shiftsToward` matches a
  high-weighted axis gets marked there, and the standalone nudge goes. One view instead of
  three, and the hint survives.
- **Delete the nudge and accept the loss** until `shiftsToward` reaches scoring. Cheapest, and
  defensible if fit-bending is the next thing you build.

Whichever wins: the second list (`spirit.aspects` with effects) and the third (siblings with
tiers) enumerate the same aspects and should be one list either way.

Note that 27 of 31 aspects carry a `shiftsToward` hint. The four without — Immense, Regrowth,
Unconstrained, Spreading Hostility — are pinned by a test, because their cards change economy,
setup or growth rather than pointing at an axis. Any change here must leave that test passing.

## Blocked by

- None
