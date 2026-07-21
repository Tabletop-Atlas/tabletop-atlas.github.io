# PRD — Archive tab: grouping & tile-chip polish

Status: done
Assembled: 2026-07-17 (from the archive-grouping issues 01–03; seams confirmed with the owner)

The path-and-line-level implementation notes live in the three issue files under this directory
([01](issues/01-grid-drop-expansion-chip.md), [02](issues/02-powers-group-by-expansion-type.md),
[03](issues/03-other-cards-group-by.md)). This spec is the higher-level contract a builder agent
works against; the issues carry the exact call sites.

## Problem Statement

The Archive is how the owner browses Spirit Island's cards, adversaries, and scenarios. Two things
get in the way:

- **Every tile is stamped with an expansion chip over its art** — in the Archive's grid views and on
  the tier board. The owner recognises cards by their artwork, so the chip reads as clutter on a
  tile. The expansion colour is only wanted when reading the list/rows view.
- **"Group by" is thin and lopsided.** For power cards it groups only by cost, speed, or element —
  not by expansion, and not by card type (minor / major / unique). For fear, blight, and event cards
  there is no grouping at all, even though those are exactly the cards the owner would most want to
  slice by their own kinds (which fear effect, which blight, which event class).

## Solution

- **Tiles show art, clean.** The expansion colour lives only in the rows/list views (as their pill),
  everywhere tiles appear: the three Archive grids (cards, adversaries, scenarios) and the tier
  board. The scenario difficulty band is unaffected.
- **"Group by" gains reach.** Power cards can also group by **Expansion** and by **Type**
  (minor / major / unique). Fear, blight, and event cards get their own **Group by** — **None**,
  **Expansion**, or **Subtype** (the fear tags, blight tags, or event class). A card carrying several
  subtypes appears under each; a card with none falls into an **"Unclassified"** group. Blight
  subtypes are marked as the app's own judgment, never presented as printed fact.

## User Stories

1. As someone browsing the Archive card grid, I want tiles to show only the card art, so that I can
   recognise cards by artwork without a chip over them.
2. As someone browsing the adversary grid, I want no expansion chip on the tiles, so that the grid
   stays clean and consistent with the card grid.
3. As someone browsing the scenario grid, I want the expansion chip gone from the tiles while the
   difficulty band stays, so that I keep the difficulty signal but lose the clutter.
4. As someone viewing the tier board, I want no expansion chip on the tiles, so that the ranked art
   reads cleanly.
5. As someone reading the Archive in Rows view, I want the expansion colour to remain as a pill, so
   that I still get expansion at a glance where I'm reading a list.
6. As a user, I want the expansion-colour rule to be predictable — never on a tile, always in a
   row — so that it's consistent across every surface.
7. As someone studying power cards, I want to group them by expansion, so that I can see which powers
   each expansion adds.
8. As someone studying power cards, I want to group them by type (minor / major / unique), so that I
   can compare cards of the same type together.
9. As someone grouping power cards by expansion, I want the groups in the app's canonical expansion
   order, so that the ordering matches the rest of the app.
10. As someone grouping power cards by type, I want a fixed minor → major → unique order, so that the
    grouping reads predictably.
11. As someone grouping power cards, I want empty groups omitted, so that I only see groups that
    actually contain cards.
12. As someone grouping power cards by expansion, I want a card whose expansion string isn't
    recognised to still appear under its own label, so that no card silently disappears.
13. As someone browsing fear cards, I want to group them by fear subtype, so that I can find all the
    removal / defensive / etc. effects together.
14. As someone browsing blight cards, I want to group them by blight subtype, so that I can compare
    blights of the same kind.
15. As someone browsing event cards, I want to group them by event class, so that I can see events of
    the same class together.
16. As someone browsing fear / blight / event cards, I want to group them by expansion, so that I can
    see what each expansion contributes.
17. As someone grouping fear or blight cards where a card carries several subtypes, I want that card
    to appear under each subtype it has, so that I find it no matter which subtype I'm looking at.
18. As someone grouping cards by subtype, I want cards with no subtype collected in an "Unclassified"
    group, so that nothing is dropped.
19. As someone grouping blight cards by subtype, I want the group headers to mark the subtypes as the
    app's judgment, so that I'm not misled into treating them as official printed data.
20. As someone grouping fear or event cards, I want no judgment caveat (those subtypes come from
    printed text / structure, not judgment), so that the provenance signal stays meaningful and
    isn't diluted.
21. As someone grouping any segment, I want a "No grouping" option, so that I can return to the flat
    list.
22. As someone switching segments, I want the group-by choice to reset, so that a grouping that only
    makes sense for one segment doesn't carry over.
23. As someone grouping cards, I want grouping to work in both grid and rows views, so that I can
    group however I'm browsing.
24. As a user, I want the app's chip/group colours to stay visually distinct per system, so that a
    group colour is never mistaken for a different system's chip.
25. As a user, I want grouping and chip changes not to disturb the existing filters, sorts, and
    counts, so that the rest of the Archive keeps working as before.

## Implementation Decisions

Three independent work items, kept in one spec because they share the Archive surface. They can ship
in any order; the two group-by items may share a small canonical-order helper.

### Tile-chip removal (presentation only — no public interface change)

- Remove the corner expansion chip from **all tile views**: the card grid, the adversary grid, the
  scenario grid, and both tier-board tile kinds (the configuration tile and the card tile). The
  scenario **difficulty band** stays — only the expansion chip goes.
- The rows/list views keep their expansion **pill** unchanged.
- The card-tile `showExpansion` flag exists solely to gate the tier-board chip; it is removed along
  with its call sites once the chip is gone.
- The now-unused corner-chip CSS rule is deleted. The base expansion-chip rule and the row-pill rule
  stay (rows still use them).

### Power-card grouping (extend the existing seam)

- Extend the power-card grouping's group key with **`expansion`** and **`type`**, and the grouping
  function with those two cases. Both are single-valued per card (unlike `element`).
- **Expansion** groups follow the app's **canonical expansion order**; a card whose expansion string
  isn't canonical still groups under its raw value — never dropped. **Type** groups follow a fixed
  **minor → major → unique** order. Empty groups are omitted (the function's existing rule).
- Type-group header wording reuses the app's existing card-kind labels rather than coining new ones.
- The Archive's Group by control (Powers segment) gains the two options.

### Fear / blight / event grouping (new seam)

- A new sibling domain function, `groupOtherCards`, returns the same `{ label, cards }[]` group shape
  the power grouping uses. New group key: **`none | expansion | subtype`**.
- **`subtype`** resolves per card kind: fear → fear tags (multi-valued), blight → blight tags
  (multi-valued), event → event class (single-valued). **`expansion`** is single-valued.
- Multi-valued grouping **mirrors the power grouping's `element` case exactly**: a card appears under
  every subtype it carries, and zero-subtype cards fall into a trailing **"Unclassified"** group.
  Canonical group order follows the declared tag/class order; human labels come from the existing
  subtype-label source. Empty groups omitted.
- **Blight-by-subtype group headers carry the existing "(judgment)" provenance note** — blight tags
  are judgment data. Fear tags and event class are not judgment and carry no note.
- The Archive shows a Group by control for the fear / event / blight segments (new state, reset when
  the segment switches), with grouped rendering in **both** grid and rows views, reusing the existing
  card-grid and other-card-rows components.

### Preserved invariant

No palette values change — this alters chip **usage** and adds **grouping**, never a colour. The
pairwise chip-distinctness guarantee therefore holds unchanged.

## Testing Decisions

A good test here exercises **external behaviour against small fixtures** — group labels, membership,
order, omission — and never asserts on the React tree or touches storage (the repo's standing
convention; the one UI check is a server-rendered smoke test).

- **Seam 1 — power-card grouping (existing).** Extend the existing power-card arrange tests to cover
  the `expansion` and `type` groupings: assert group labels, membership, canonical order,
  empty-group omission, and that an unrecognised expansion string still groups under its raw value.
  Prior art: the existing `element` / `cost` / `speed` grouping tests in that file.
- **Seam 2 — `groupOtherCards` (new).** A new arrange test mirroring the power-card one: per-segment
  subtype grouping; multi-value membership (one fixture card landing in two groups); the trailing
  "Unclassified" group; canonical order; empty-group omission; expansion grouping; and that
  blight-by-subtype group headers carry the judgment note while fear/event headers do not.
- **Tile-chip removal — no unit seam.** Presentation change, verified in the running app at desktop
  and 375px across the three Archive grids and the tier board, confirming the rows pills still
  render. The chip-distinctness tripwire stays green **unedited** (values unchanged). If a smoke or
  tier-board render test asserts a chip's presence, update that test to reflect the removal.

## Out of Scope

- **Any colour / palette change** — that is the separate [island-retheme](../island-retheme/MAP.md)
  theme round's business. This spec changes chip usage and grouping, never palette values.
- **Sorting for the fear / event / blight segments** — their data can't support the cost sorts
  (phase-4 #19's locked call stands); only grouping is added.
- **New or re-derived subtype classifications** — grouping consumes the existing classifier output
  as-is; it does not re-classify fear/blight tags or event classes.
- **Grouping for the Adversaries and Scenarios segments** — not requested; they keep their existing
  filter-only controls.
- **Making the tile expansion chip a toggle** — it is removed outright, not hidden behind an option.

## Further Notes

- This **narrows legibility-pass #05 / #08** (expansion colour on both tiles and rows) to rows-only;
  the owner directed widening the removal to include the tier board (2026-07-17).
- Multi-value + canonical-order grouping is already a solved pattern in the codebase (the power-card
  `element` grouping). The new work **mirrors** it rather than inventing — no new grouping semantics.
- **Data-honesty discipline (CLAUDE.md):** blight subtypes are judgment and stay marked; fear tags
  and event class are derived from printed text / structure and are **not** marked judgment — keeping
  that distinction meaningful is a requirement, not a nicety.
- The three work items are independent and buildable in any order.
