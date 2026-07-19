# Event segment

Status: done

## Parent

`../PRD.md` (Deck Dashboard spec)

## What to build

The Event segment replaces its stub: for the current expansion set, the event pool's size,
its composition by event class, and an expansion breakdown. A base-game-only set contains
no event cards — the segment states that plainly as a rule of the game, not an error or a
blank screen. No valence axis; existing sourced classes only.

## Acceptance criteria

- [ ] Pool size, per-class composition, and expansion breakdown derive from the domain
      module and respect the current expansion set.
- [ ] An expansion set with zero events renders the explicit "no events in this set"
      state; the module returns an empty composition without throwing (pinned on
      fixtures).
- [ ] No good/bad classification appears anywhere — existing sourced classes only.
- [ ] Type check, lint, and the full test suite pass.

## Blocked by

- `06-walking-skeleton-dashboard-tab.md`
