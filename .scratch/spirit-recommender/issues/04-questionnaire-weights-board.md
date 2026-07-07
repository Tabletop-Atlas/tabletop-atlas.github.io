# 04 — Questionnaire wizard → weights → live re-rankable board

Status: ready-for-agent

## Parent

`.scratch/spirit-recommender/PRD.md`

## What to build

The core recommender: a paged questionnaire wizard that translates plain-language answers
into hidden preference weights, feeding a live results board that re-ranks in real time.

- **`answersToWeights(answers)` pure module (Seam 2)** — maps the 10-question answer set to
  `{ weights: {O,C,F,D,U}, tempo, boardControl, complexityImportance, complexityCeiling,
  tierKnob, elementAffinity }`. Each answer contributes a vector of weight deltas that **sum**
  across answers (redundant questions accumulate, they do not overwrite). The answer→delta
  table is authored config. See the PRD for the 10 questions and which axes each feeds.
- **Paged wizard UI** — 10 single-select questions, one step at a time, plus a player-count
  setup field. Questions are the plain-language wording from the PRD (jargon-free).
- **Live board** — after the wizard, land on a results view showing the **top-5 shortlist,
  top 3 emphasised**. Every answer becomes an editable control; changing it re-runs
  `answersToWeights` → `recommend` and reshuffles the list immediately (scoring all ~40
  spirits is trivially cheap — recompute on every change, no submit button).
- **Extend `recommend()` (Seam 1)** to the full weighted dot product over OCFDU **plus tempo
  and board-control tag boosts**. All other tags remain unscored. Surplus capability in
  un-asked dimensions must not be penalised. Ties broken by a stable order for now (tier
  prior arrives in #05).

## Acceptance criteria

- [ ] `answersToWeights` is pure, tested: "hit hard and fast" → high offense weight + fast tempo; redundant questions accumulate; "first time" answer sets a low complexity ceiling
- [ ] Wizard presents 10 questions paged + player-count field, jargon-free wording
- [ ] Results board shows top-5 with top-3 emphasised
- [ ] Editing any answer re-ranks the board live (no submit)
- [ ] `recommend()` scores weighted dot over OCFDU + tempo + board-control boosts; scoring tests cover the tempo/board-control contribution and the no-penalty-for-surplus rule
- [ ] Domain modules remain framework-free

## Blocked by

- #01
