# Expansion picker

Status: done

## Parent

`../PRD.md` (Deck Dashboard spec)

## What to build

The Dashboard gains an expansion picker defining what is "in the decks". It boots pre-set
to the player's Collection, so the common case costs zero clicks; a base-game-only night
takes two. Expansions the player doesn't own are listed but annotated (never hidden),
consistent with Collection treatment elsewhere in the app, so hypothetical pools stay
explorable. Checking or unchecking any expansion recomputes every count, plot, and
probability on every segment. The picker is session-only: a reload reverts to the
Collection default. No new storage key.

## Acceptance criteria

- [ ] Picker defaults to the Collection's owned set; unowned expansions visible and
      annotated, unchecked by default.
- [ ] Toggling an expansion recomputes deck sizes, element counts, and draw odds on the
      power-deck segments (and any other segment already built) immediately.
- [ ] An empty checked set produces empty compositions and no throws (pinned in the domain
      module's tests).
- [ ] State is session-only — no localStorage writes; reload restores the default.
- [ ] Type check, lint, and the full test suite pass.

## Blocked by

- `06-walking-skeleton-dashboard-tab.md`
