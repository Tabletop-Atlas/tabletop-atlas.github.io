# 06 — Results polish: why-you + wildcard + reroll + OCFDU radar

Status: done

## Parent

`.scratch/spirit-recommender/PRD.md`

## What to build

Complete the output contract on the results board.

- **"Why you specifically"** — a one-line explanation per top-3 spirit, generated from the
  dominant matched dimensions (e.g. "You leaned hard into aggression and fast tempo — this is
  the most offensive spirit available"). Deterministic string assembly from the weights and
  the spirit's standout ratings, no LLM.
- **Wildcard** — one deliberately off-profile pick shown separately from the fitted top-3:
  either an above-complexity-cap spirit or one that scores well on a dimension the user
  *didn't* prioritise. Clearly labelled as the spicy pick.
- **Reroll** — refresh the shortlist / wildcard without re-answering the questionnaire.
- **OCFDU radar** — an inline-SVG 5-axis polygon on each recommended spirit's card showing
  its OCFDU profile. No charting dependency (~5-axis polygon by hand). This closes the
  translation loop: plain-language answers in, mechanical profile out.

## Acceptance criteria

- [ ] Each top-3 card shows a deterministic one-line "why you" reason
- [ ] A clearly-labelled wildcard appears, distinct from the fitted top-3
- [ ] Reroll refreshes suggestions without touching questionnaire answers
- [ ] Each recommended spirit shows an inline-SVG OCFDU radar (no external chart lib)

## Blocked by

- #04 (results board). Wildcard's above-cap behavior depends on #05's complexity penalty.
