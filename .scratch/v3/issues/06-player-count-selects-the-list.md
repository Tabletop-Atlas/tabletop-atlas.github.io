# 06 — Player count selects the list

Status: done

## Parent

`.scratch/v3/PRD.md`

## What to build

Player count currently feeds exactly one consumer — `isRelevantToPlayerCount`, which decides whether
a spirit's free-text note gets highlighted. It does not touch ranking. The owner's complaint that
"it is not doing anything" is very nearly literally true.

Player count becomes **metadata you select on**. It never becomes a delta anyone authors.

- Choosing a player count filters the list picker to lists declaring that count.
- A list with no `players` is always eligible — the source never claimed a count, so it cannot be
  excluded by one.
- If no list matches the chosen count, the app **says so**, rather than presenting an empty picker
  that reads as broken.
- The recommender names the list it scored against, so a user can trace why a spirit ranked where it
  did.

**No solo tier is ever derived from a four-player tier.** If no solo list exists, the app tells you
that. It does not compute one.

## Acceptance criteria

- [ ] Selecting a player count narrows the picker to lists whose `players` matches, plus lists with
      no `players`
- [ ] Selecting a count with no matching list shows an explanatory empty state, not a blank picker
- [ ] Changing the player count changes which tier prior the recommender uses
- [ ] The results view names the active list
- [ ] Nothing anywhere derives a tier for one player count from a list made for another
- [ ] `isRelevantToPlayerCount` and its tests are untouched

## Blocked by

- #03 (the recommender cannot honestly name the list it scored against until it scores against one)
- #04 (the picker must exist before it can be filtered)

## Comments

Resolved. `TierListControls` filters eligible lists by `players === count || players ===
undefined`, further filtered by type. Zero matches renders an explanatory notice instead of an
empty select. If the active list falls outside the current filter, the picker falls forward to
the first eligible list (never derives a tier - just re-selects among lists that already exist).
`ResultsBoard` names the active list via `tierStore.getActiveList().name`.
