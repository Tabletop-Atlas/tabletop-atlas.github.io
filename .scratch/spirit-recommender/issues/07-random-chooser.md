# 07 — Random chooser mode

Status: ready-for-agent

## Parent

`.scratch/spirit-recommender/PRD.md`

## What to build

A "just pick one at random" mode inside the Recommender tab.

- Uniform random draw over the spirit pool.
- Respects stated constraints as **hard filters** (unlike the recommender's soft penalty) —
  e.g. "random but low complexity" removes higher-complexity spirits from the pool before
  drawing.
- Presents the drawn spirit with its art (or placeholder) and summary; a re-draw action.

## Acceptance criteria

- [ ] Random mode draws uniformly from the eligible pool
- [ ] Complexity (and any other stated constraint) acts as a hard filter on the pool
- [ ] A re-draw produces a fresh uniform pick
- [ ] Filter logic is covered by a test (constrained pool excludes out-of-bounds spirits)

## Blocked by

- #04 (Recommender tab shell + dataset)
