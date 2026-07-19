# Element-combination view + cost/speed facets

Status: done

## Parent

`../PRD.md` (Deck Dashboard spec)

## What to build

The Minor and Major segments gain the deeper composition views. First, the
element-combination view: each card's exact element set becomes a row in a dot-matrix
(UpSet-style, hand-rolled — rows marked by dots on the 8-element columns, sorted by
frequency), so a player can judge the chance of a card advancing two thresholds at once.
Cards with no elements group visibly as "No element" — every card is accounted for.
Second, the secondary facets: the deck's fast/slow split and cost distribution, so tempo
and affordability read alongside elements.

## Acceptance criteria

- [ ] Combination groups come from the domain module: exact element sets with counts,
      sorted by frequency, "No element" present exactly when such cards are in the set
      (pinned on fixtures).
- [ ] Group counts sum to deck size — no card dropped, no card double-counted.
- [ ] Fast/slow split and cost distribution render on both power-deck segments and respect
      the current expansion set.
- [ ] Chart forms follow the spec's baseline (dot-matrix, bars); any later refinement from
      the map's prototype ticket would change components only, not module outputs.
- [ ] Type check, lint, and the full test suite pass.

## Blocked by

- `06-walking-skeleton-dashboard-tab.md`
