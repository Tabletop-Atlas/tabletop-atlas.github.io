# Element-gap odds block on the power decks

Status: done

## Parent

`../PRD-2.md` (follow-up spec: valence views + element-gap odds)

## What to build

On the Minor and Major segments, a gap-odds block beneath the existing views: for each of
the eight elements, the exact odds that the next N draws from this deck include at least
1 / at least 2 / at least 3 cards carrying that element. N is the segment's existing draw
stepper; the expansion picker drives the pool; the full-pool "nothing drawn" assumption is
stated. Counts carry percentages in brackets. No spirit awareness yet — that is the
annotations ticket.

## Acceptance criteria

- [x] The deck-composition domain seam exposes per-element exact hypergeometric tail odds
      for k = 1, 2, 3 (k = 1 agrees with the odds the segment already shows).
- [x] Domain tests cover hand-computed cases plus edges: k exceeding the element's deck
      count (odds 0), N ≥ deck size (certainty where the element count allows), empty deck.
- [x] The block renders inside both power-deck segments, inheriting the shared N stepper
      and expansion set; no new tab, segment, or storage key; state is session-only.
- [x] The full-pool assumption label is present; percentages accompany counts.
- [x] Smoke test asserts the block on both segments; type check, lint, full suite pass.

## Blocked by

None — can start immediately.
