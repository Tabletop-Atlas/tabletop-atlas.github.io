# Element demand/supply domain module

Status: done

## Parent

`../README.md`, ADR 0013, `CONTEXT.md` → **Element demand / supply**

## What to build

One pure domain module that computes everything the new Dashboard block reads, given a spirit and
a segment's card pool. No React, no rendering decisions — the same discipline as
`innateThresholds.ts` and `deckComposition.ts`, which it composes rather than duplicates.

For a picked spirit and a card pool it yields, per element:

- **demand**: the count the *first* (lowest) rung of any of that spirit's innates asks for, and
  separately the **ceiling** — the highest count any rung asks for. An element no rung mentions has
  neither.
- **supply**: how many cards in the pool carry that element (already in `deckComposition`).
- **odds**: the chance the next `drawCount` draws contain *demand-many* of that element — the
  existing hypergeometric maths in `deckComposition`, indexed to demand instead of fixed 1/2/3.

And once per spirit/pool pair:

- **multi-hit buckets**: how many cards carry none / exactly one / two-or-more of the spirit's
  demanded elements.

## Acceptance criteria

- [ ] New pure module (no React import) composing `innateThresholds` + `deckComposition`; neither
      is duplicated or forked.
- [ ] Demand is the first rung; ceiling is the max across rungs. An element demanded only at a
      later rung has no demand figure but does have a ceiling — Lightning's Swift Strike wants
      Water only at rung III, and must read that way, not as "wants 1 Water".
- [ ] Elements no rung mentions are returned, flagged as undemanded — the view collapses them, the
      domain does not drop them.
- [ ] Demand-indexed odds where demand exceeds `drawCount` return a real probability (0 or near it),
      never `undefined` and never a fabricated figure.
- [ ] A spirit with no innate powers, and a pool of zero cards, both return a defined result rather
      than throwing.
- [ ] Unit tests pin the shipped numbers as a tripwire, per this repo's data-fabrication failure
      mode (ADR 0003): minors per-element supply 38–39; multi-hit two-or-more = 12/101 for
      Sun-Bright Whirlwind and 99/101 for Starlight Seeks Its Form; P(≥3 of a 39-card element in 4
      of 101 draws) ≈ 15.9%.
- [ ] Type check, lint, full suite pass.

## Out of scope

Joint multi-element probabilities — still rejected, per `deck-dashboard` #05. The multi-hit buckets
are exact counts over the pool, not a joint draw probability.
