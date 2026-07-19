# Draw odds with adjustable N

Status: done

## Parent

`../PRD.md` (Deck Dashboard spec)

## What to build

On the Minor and Major segments, every element row gains its draw probability: the chance
of seeing at least one card carrying that element among the next N draws from the full
deck. A stepper sets N, defaulting to 4 (the standard "draw 4, keep 1" draft) and clamped
to [1, deck size]. The view carries the assumption label — the probabilities describe a
full, untouched deck with nothing drawn — so the static dashboard never masquerades as
live tracking.

## Acceptance criteria

- [ ] Odds are exact hypergeometric without replacement: `1 − C(deck−k, N)/C(deck, N)` for
      an element carried by k cards; 0 when k = 0; 1 whenever a miss is impossible.
- [ ] Probability assertions on tiny hand-checkable fixtures (e.g. 5-card deck, 2 with the
      element, draw 2 → 0.7), plus edge cases: k = 0, N at both clamp ends, N ≥ deck size.
- [ ] N stepper defaults to 4; changing N recomputes every element's odds; clamping holds
      when the deck shrinks below the current N.
- [ ] The assumption label ("full deck, nothing drawn") is visible on both power-deck
      segments.
- [ ] Type check, lint, and the full test suite pass.

## Blocked by

- `06-walking-skeleton-dashboard-tab.md`
