# 04 — Pick a list; personal lists edit, cited lists do not

Status: done

## Parent

`.scratch/v3/PRD.md`

## What to build

The user picks which tier list they are looking at, and the choice sticks.

- A list picker on the tier board and in the editor. The owner's board is the default selection.
- The active list persists across page loads.
- Overrides key by `listId`. **An edit to one list leaves every other list untouched** — fixing the
  strength board must not disturb the fun board.
- `setTier` **refuses** a list with `origin: 'cited'`. Editing 3MBG's list makes it no longer 3MBG's
  list. The refusal is enforced in `tierStore`, not merely in the UI.
- The editor disables its controls for a cited list and **says why**, so a dead control does not
  read as a bug.
- Reset applies to a single list: resetting the personal strength list to its shipped seed leaves
  the owner's other lists alone.
- `wasDiscarded()` and the seed-fingerprint guarantee are preserved **per list**.

With only the owner's list shipped, the picker has one entry. Multi-list behaviour is proved by
fixture lists in `tierStore.test.ts`.

## Acceptance criteria

- [ ] The active list persists across reloads; a fresh install selects the owner's board
- [ ] An override written to list A is not visible from list B
- [ ] `setTier` on a `cited` list is refused and leaves storage untouched
- [ ] The editor's controls are disabled for a cited list, with prose explaining that a citation
      cannot be edited
- [ ] Resetting one personal list leaves another personal list's overrides intact
- [ ] `isCustomised()` and `getOverrides()` report against the active list only
- [ ] The fingerprint discard guarantee holds per list: changing one list's seed discards that
      list's overrides and reports it, without touching another list's
- [ ] Tests use the in-memory `KeyValueStorage`, never `localStorage` directly

## Blocked by

- #02 (the board must render a list's own vocabulary before it is worth switching lists)

## Comments

Resolved. `TierListControls` (shared by board and editor) renders the picker; active list id
persists at `spirit-island:active-list-id`. `setTier` refuses `origin: 'cited'` inside
`tierStore` itself. The editor disables its per-configuration selects and shows prose when the
active list is cited. `reset()`/`resetList()` and `wasDiscarded()` all operate per list id.
