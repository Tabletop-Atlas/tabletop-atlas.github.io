# 05 — Complexity penalty + tier prior knob + player count

Status: done

## Parent

`.scratch/spirit-recommender/PRD.md`

## What to build

Add the two remaining scoring modifiers and surface player-count notes.

- **Complexity soft penalty** — subtract a penalty scaled by (a) the user's
  complexity-importance weight and (b) how far a spirit's complexity sits above the stated
  tolerance/ceiling. Steep enough to bury Very-High spirits when simplicity is wanted, but
  **never a hard removal** (the wildcard in #06 must still be able to reach past it).
- **Tier prior (additive bonus)** — `score = normalize(fit) + α · normalize(tierPrior)`,
  both min-max normalised across the pool. Map tier S/A/B/C/D to numeric priors. The
  strength↔novelty **knob** sets `α ∈ [0, α_max]`: `α = 0` ignores tiers entirely, `α_max`
  weighs them heavily. Additive so fit always counts — max-strength must never fully override
  the questionnaire. Consume `tiers.json` (#03); if absent, fall back to a neutral prior.
- **Player-count annotation** — the player-count setup field surfaces relevant `notes` on
  the rec cards ("strong solo", "shines at high player counts"). It does NOT affect scoring.
- Expose the knob as a live control on the board (its initial position was set by
  questionnaire Q10).

## Acceptance criteria

- [ ] Complexity penalty scales with importance + level-over-tolerance; a first-timer's ranking buries Very-High spirits (tested)
- [ ] Complexity is a soft penalty, never removes spirits from the recommender pool
- [ ] Tier prior is an additive normalised bonus; `α = 0` reproduces pure-fit ranking, higher `α` promotes higher tiers (tested)
- [ ] Max knob never lets tier override fit entirely (tested)
- [ ] Player-count field surfaces matching `notes` on cards without changing scores
- [ ] Knob is a live control that re-ranks the board

## Blocked by

- #04 (scoring engine + board). Consumes `tiers.json` from #03.
