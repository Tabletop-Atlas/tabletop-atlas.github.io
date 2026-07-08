# 03 — Effective complexity from the aspect's printed arrow

Status: ready-for-agent

## Parent

`.scratch/v2/PRD.md`

## What to build

Every aspect card prints a complexity arrow, already transcribed into the dataset as
`complexityDelta`: 24 aspects raise complexity, 4 leave it level, and 3 **lower** it
(Reach, Unconstrained, Stranded). Feed it into the scoring the app already does.

- `effectiveComplexity = clamp(COMPLEXITY_LEVEL[base] + delta, Low, Very High)`, where
  `up → +1`, `same → 0`, `down → −1`.
- **Clamped at Very High** — the game prints no higher grade. An `up` aspect on an already
  Very High spirit stays Very High.
- `complexityPenalty()` already takes a level and a ceiling. Pass it the configuration's
  effective level. **No new scoring machinery.**

The payoff: a first-timer is now steered *toward* Shadows–Reach (the card says it is simpler
than base Shadows) and *away* from Shadows–Dark Fire (the card says it is harder) — even
though both inherit identical fit.

## Acceptance criteria

- [ ] `up` / `same` / `down` shift effective complexity by +1 / 0 / −1
- [ ] Effective complexity clamps at Very High (an `up` aspect on Dances Up Earthquakes stays Very High)
- [ ] Effective complexity clamps at Low (a `down` aspect on a Low spirit stays Low)
- [ ] For a first-timer (low ceiling, high complexity importance), a complexity-lowering configuration outranks its base
- [ ] For a first-timer, a complexity-raising configuration is buried below its base
- [ ] With complexity importance at 0, `complexityDelta` changes no ranking
- [ ] No new penalty function is introduced; the existing one receives the effective level

## Blocked by

- #02 (configurations must exist)
