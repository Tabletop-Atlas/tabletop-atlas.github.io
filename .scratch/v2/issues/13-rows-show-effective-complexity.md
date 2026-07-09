# 13 — Result rows show the configuration's effective complexity

Status: done

## Parent

`.scratch/v2/PRD.md`

## What to build

The expanded result row prints the **base spirit's printed complexity**, even when the row is
recommending an aspect configuration. A row headed *"Shadows Flicker Like Flame — play the
**Dark Fire** aspect"* prints "High", while the configuration the recommender actually scored
and ranked is Very High.

Computing `effectiveComplexity` was the whole point of #03. Display it.

The row should show the complexity of the thing it is telling you to put on the table. Where
that differs from the base spirit's printed value, the difference is the aspect's printed
arrow doing its job, and it is worth making legible rather than hiding.

Note the deliberate distinction, already load-bearing in scoring: `effectiveComplexity` is
printed base + arrow (what a stranger at the table faces), while `personalEffectiveComplexity`
is the owner's override + arrow. The row describes the spirit, not the owner's familiarity
with it, so it shows `effectiveComplexity`.

## Acceptance criteria

- [ ] An aspect configuration's row shows its effective complexity, not its base spirit's printed value
- [ ] A base configuration's row is unchanged
- [ ] A complexity-lowering aspect (Reach, Unconstrained, Stranded) reads lower than its base spirit
- [ ] The wildcard row and the sibling-configuration list are consistent with the main row
- [ ] The existing smoke render still passes

## Blocked by

- None — can start immediately

## Comments

Resolved: `ResultRow` now prints `config.effectiveComplexity` instead of `spirit.complexity`.
The sibling list and the wildcard row now also show each configuration's own
`effectiveComplexity`, for consistency with the main row. Smoke test still passes.
