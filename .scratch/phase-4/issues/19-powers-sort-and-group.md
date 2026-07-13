# 19 — Powers sort and group

Status: done
Parent: [Phase 4 PRD](../PRD.md) · cluster 5 (Archive & theming)

## Blocked by

None — can start immediately.

## What to build

Per the locked owner call and the [Archive resolution](04-the-archives-structure.md): the
Archive's **Powers segment** (and only it) gains controls to sort and group the deck by **cost**,
**elements**, and **speed**, composing with the existing filters. Grouping renders labelled
sections in both Grid and Rows views. Fear/Events/Blight and the other segments keep their
current ordering — their data honestly can't support more (the locked call: alphabetical/by-type
stays). No structural change: the six-segment switch is settled.

## Acceptance criteria

- [x] Powers can be sorted by cost and grouped by cost, by speed, and by element — deterministic
      and stable, tested at the domain seam (model: the existing filter tests)
- [x] Group headers render in Grid and Rows views; filters and sort/group compose
- [x] All other segments are byte-unchanged in behaviour
- [x] Controls fit a 375px viewport (the segment switch overflow lesson from v5)

## Comments

**Resolved (2026-07-13).** New pure module `src/domain/powerCardArrange.ts`, built red→green on
the `powerCardFilter` model: `sortPowerCards` (`none | cost-asc | cost-desc`, stable copy sort —
ties keep deck order) and `groupPowerCards` (`cost | speed | element` → `{label, cards}[]`).
Cost groups ascend "Cost 0"…"Cost 9"; speed is Fast then Slow; element groups follow the
canonical `ELEMENTS` order with a card appearing under EVERY element it carries, and a trailing
"No element" group — the real deck demands it (3 of 332 cards carry no element). Empty groups
are omitted everywhere. UI: `powerSort`/`powerGroup` state in `CardsTab`, two selects in the
existing `.card-filters-row filters` pattern rendered only for the Powers segment; pipeline is
filter → sort → group; grouped rendering is an `h3` (already styled by `.deck-main h3`) plus the
existing `CardGrid`/`CardRows` per group in both views. Other segments untouched — no code path
changed for them.

Verified: 370/370 (11 new domain tests, incl. tie-stability and no-mutation); production build in
Playwright at 375px + 1280px — controls present only on Powers, no horizontal overflow, cost-asc
puts a 0-cost card first, headers ascend in both views, element groups in canonical order with
"No element" last, Fast→Slow, cost ≤ 1 filter composes to exactly two groups, Fear has no
controls. Code review (two-axis): one hard finding fixed pre-commit — both new comments cited
"v5 #19", corrected to `phase-4 #19` (the existing citation convention). Judgement calls kept
as-is: `PowerGroup` name is the locked design's; the three group branches stay explicit rather
than extracting a shared map-filter shape at 16 lines; per-file test factory matches the
sanctioned filter-test pattern; the "N of M" count stays unique-card count under element
grouping (duplication across groups is the spec'd behaviour).
