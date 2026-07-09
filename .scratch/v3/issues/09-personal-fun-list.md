# 09 — A personal Fun list

Status: done

## Parent

`.scratch/v3/PRD.md`

## What to build

What is strong and what is fun to play are different rankings. The owner wants to record both.

- Create a new **personal** list from the UI, typed `fun` or `strength`.
- A new personal list starts **fully unrated** — every one of the 68 configurations sits in the
  Unrated bucket. It is not pre-filled from the strength board, and it is not seeded with `B`. The
  owner should be able to see honestly how much of it he has actually rated.
- The list picker filters by type, so fun rankings and strength rankings can be looked at separately.
- Created lists persist, are editable (they are `personal`), and reset independently (#04).

Coverage on a fresh fun list reads "rated 0 of 68", and that is correct.

## Acceptance criteria

- [ ] A personal list can be created with a name and a type, and it persists across reloads
- [ ] A newly created list has an empty `tiers`; the board shows all 68 configurations as unrated
- [ ] Rating a configuration on the fun list does not change its tier on the strength list
- [ ] The picker can be filtered to `fun` or `strength`
- [ ] A created list is editable and resettable, and its reset leaves other lists alone
- [ ] A created list's edits export and restore (#07 covers "every personal list")

## Blocked by

- #04 (a created list is unreachable until lists can be selected and edited per-id)

## Comments

Resolved. `tierStore.createList({ name, type })` persists a new personal list with
`tiers: {}` and the owner's `tierLabels`, stored at `spirit-island:custom-tier-lists`. The
"Create a personal list" form lives in the editor's `TierListControls` (`allowCreate`). The type
filter dropdown is shared with #06's player-count filter.
