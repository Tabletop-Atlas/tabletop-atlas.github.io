# 11 — Aspect nudge

Status: done

## Parent

`.scratch/spirit-recommender/PRD.md`

## What to build

Surface aspects as targeted nudges on recommended spirits — never as scored/ranked items.

- **Nudge rule** — on a recommended base spirit's card, show a one-line aspect suggestion
  when ALL of:
  1. the base spirit is already in the shown shortlist (it fit overall), AND
  2. the user gave **high importance to a dimension the base spirit rates low on**, AND
  3. an aspect exists whose `shiftsToward` hint points at that dimension.
  Example: "Fits what you want — but you leaned toward support, and base Lightning is pure
  offense. The Wind aspect leans supportive."
- **Collapsible variants** — aspects shown under their base spirit with the one-line `delta`.
- Aspects are never separate shortlist entries and never carry OCFDU vectors.

## Acceptance criteria

- [ ] Aspect nudge fires only when all three conditions hold (tested against fixtures)
- [ ] The nudge names the specific aspect and the dimension it shifts toward
- [ ] Aspects render as collapsible variants under the base spirit
- [ ] No aspect appears as an independent ranked recommendation

## Blocked by

- #04 (results board + weights). Uses `shiftsToward` data from #02.
