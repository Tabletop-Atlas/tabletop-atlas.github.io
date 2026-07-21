# 0007 — The recommendation scoring model

Status: accepted
Date: 2026-07-21

## Context

The recommender's core is a deterministic scoring function, chosen in v1 and refined through v3.
Its shape — why a dot product, why an additive prior, why complexity is handled outside the sum —
is load-bearing and easy to break with a well-meaning edit, but it was recorded only in the v1 PRD
and amended piecemeal in later work. This ADR states the enduring model as it stands in
`src/domain/recommend.ts`. ADR 0001 already records the v3 change that made the tier prior a
normalised rank rather than a tier letter.

## Decision

`recommend(configurations, weights, options) → RankedConfiguration[]` is a pure module (the primary
test seam), embodying the principle *deterministic where facts live, stochastic only where judgment
lives* — no LLM.

- **Fit is a weighted dot product over OCFDU** (`Σ weight[axis] × rating[axis]`, `fitScore`),
  chosen over a distance-to-target metric so surplus capability in un-asked dimensions is a bonus,
  never a penalty.
- **Tempo and board-control are two extra preference axes fed by tag boosts**, because OCFDU cannot
  express "slow snowball" or "positioning puzzle". All other tags are display / team-gap only,
  never scored.
- **The tier prior blends as a transparent additive bonus**, not a Bayesian posterior:
  `score = normalize(fit) + α · tierValue`, with `α = tierKnob × ALPHA_MAX` and `ALPHA_MAX = 0.5`
  kept below fit's full 0..1 range, so the single best-fit configuration in the pool can never be
  outranked by tier alone. `α = 0` ignores tiers ("something fresh"). The prior is a normalised rank
  (0 strongest .. 1 weakest) against the active list's own vocabulary (ADR 0001); an unrated
  configuration scores at `NEUTRAL_TIER_VALUE = 0.5` — an explicit refusal to move the score, not an
  invented tier.
- **Complexity is never in the weighted sum.** In recommender mode it is a *soft* penalty above the
  user's stated ceiling (steep enough to bury Very High when simplicity is wanted, never
  hard-removing, so the wildcard can still reach past); in random-chooser mode it is a *hard* filter
  on the pool. The two consumers read two complexity values: the newcomer ceiling reads the
  **printed** `effectiveComplexity`, the enjoyment preference reads the **personal override**
  (`personalEffectiveComplexity`) — the v2 split rule, so a first-timer is never handed a Very-High
  spirit regardless of taste.
- **Output contract:** a top-5 shortlist (top 3 emphasised, each with a one-line "why you"), one
  deliberately off-profile **wildcard**, and a reroll. `dedupeBySpirit` keeps at most one
  configuration per spirit, and **ties break toward the base configuration** — an aspect must earn
  its way past base via tier, complexity fit or novelty, never win by coin flip (siblings inherit
  the base spirit's OCFDU and are fit-identical).

## Consequences

- The model is explainable and debuggable by construction: every score decomposes into fit plus a
  visible, bounded tier bonus, with complexity acting outside the sum.
- Any future list vocabulary works unchanged (ADR 0001); the recommender never learns what a tier
  letter is, and no aspect ever carries an invented OCFDU delta.

## Left open, deliberately

**Whether an unverified (`verified: false`) list may feed `recommend()` at all, or only display** —
carried from ADR 0001; a one-line policy the owner takes once real scraped lists are in hand.
