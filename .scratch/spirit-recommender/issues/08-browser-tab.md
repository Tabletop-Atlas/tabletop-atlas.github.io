# 08 — Browser tab

Status: ready-for-agent

## Parent

`.scratch/spirit-recommender/PRD.md`

## What to build

The overview browser (PRD capability #1): every spirit as a visual, filterable grid.

- **Art-thumbnail grid** of all spirits (element-colored placeholder tiles until real art
  from #13 lands — build the placeholder component so the grid looks intentional without art).
- Each tile shows name + 1–2 sentence summary; expanding shows aspects (name + one-line
  delta) as collapsible variants.
- **Filter and sort** by expansion, complexity, OCFDU ratings, and tags.

## Acceptance criteria

- [ ] Grid renders all spirits with name, summary, and art-or-placeholder
- [ ] Filtering by expansion / complexity / tag narrows the grid correctly
- [ ] Sorting by an OCFDU rating reorders the grid
- [ ] Aspects are viewable per spirit as collapsible variants
- [ ] Placeholder tiles render cleanly when art is absent

## Blocked by

- #01 (dataset + schema). Richer with #02's full data.
