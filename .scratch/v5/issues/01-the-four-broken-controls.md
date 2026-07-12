# 01 — The four broken controls

Status: done
Type: wayfinder:task (AFK)
Parent: [v5 map](../MAP.md)

## Blocked by

_(nothing — this is the first ticket on the map)_

## What to build

Four independent controls that don't do what they claim. They decide nothing and block nothing, so
they're merged into one ticket: one session, one diff, one verification pass. Ship this before the
features.

### 1. The player-count input accepts anything

`src/components/Recommender.tsx` — two inputs, the wizard's (line ~439) and the side panel's
(line ~168). Both are `<input type="number" min={1} max={6}>` wired to
`onChange={(e) => setPlayerCount(Number(e.target.value))}`.

`min`/`max` on a number input are **advisory** — they gate the spinner arrows and form validation,
not typing. So the user can type `0`, or `47`, or clear the field entirely (`Number('')` is `0`).
And once it's `0`, backspace can't recover: the value is already the empty string, so there's
nothing to delete, and only the spinner gets you back to `1`.

**Root cause:** no clamp on the way in. Fix it once, in `setPlayerCount` (the shared setter in the
recommender's context) — not in each of the two `onChange` handlers, or the next input added is
broken again. Bounds are **1–6** (owner, 2026-07-12).

Watch the empty-field case: clamping `''` to `1` on every keystroke makes the field impossible to
edit. The usual shape is to let the input hold a transient empty string and clamp on blur, or to
keep the raw string in local state and clamp what reaches the store. Pick the smaller one.

### 2. The tier list's player-count filter is dead machinery

`src/components/TierListControls.tsx:61` filters the list picker by
`l.players === undefined || l.players === playerCount`.

Every tier list in `src/data/tier-lists/` is **solo or unstated**:

| List | `players` |
|---|---|
| `3mbg-strength-solo-2025.json` | 1 |
| `sia-favorites-fun-solo-2026.json` | 1 |
| `owners-board.json` | unstated |

So the dropdown can only ever *remove* lists. Set the recommender to 3 players and the tier tab says
"No tier list exists for 3 players" — an honest message about a filter that should not exist. The
owner isn't aware of any multiplayer tier list existing at all, in this app or in the wild.

**Remove the player-count control and the `players`-based filtering from the tier list.** Keep the
`players` field on the JSON and keep displaying it in the citation panel (line ~28) — *"1 player"* is
true and useful provenance about a source. It just isn't a filter.

**Do not remove `playerCount` from the Recommender.** It still earns its place there: `noteRelevance`
uses it to decide whether a spirit's note (*"shines in solo"*) applies. Only the tier list's use of it
goes.

### 3. The redundant "Type" control on Fear / Events / Blight

`src/components/OtherCardFilters.tsx` renders a "Type" row of `fear | event | blight` toggle buttons.
But v4 #13 shipped a segmented switch **above** the filter panel (`Powers | Fear | Events | Blight`)
that already picks exactly one kind. The buttons inside the panel are a second, contradictory control
over the same axis — you can be on the "Fear" segment with the "blight" button pressed.

**Remove the Type row.** The segment is the kind. `OtherCardFilterState.kinds` likely collapses to
nothing once the control is gone — check whether `filterOtherCards` still needs it, or whether the
segment filters the array before the filter function ever sees it. Prefer deleting the field over
leaving a filter state nobody can set.

Note this does **not** conflict with [#03](03-the-card-sub-type-classifier.md), which adds a
*sub*-type control (defensive / removal / …). That's a different axis, and it's the one the panel
should have had.

### 4. The "Unrated" label is squashed

`src/components/TierBoard.tsx:68` — `.tier-label-unrated`. The tier labels are single letters
(`S`, `A`, `B`…) and the label column is sized for them; "Unrated" is seven characters and leans into
the panel edge. Visible on the 3MBG board.

Fix it in CSS in `src/deck.css`. Options in rough order of laziness: shorten the label; let it wrap;
rotate it vertically (`writing-mode: vertical-rl`) so it reads top-to-bottom in the same column width.
The owner has no strong preference — pick the one that doesn't widen the label column for every other
row, and screenshot it.

## Acceptance criteria

- Typing `0`, `-3`, `47`, or clearing the player-count field cannot put the recommender into a state
  with a player count outside 1–6. Backspacing from a two-digit number to empty and typing `4` works
  without fighting the input.
- The clamp lives in one place, and a unit test on the domain/store setter proves it (`0 → 1`,
  `9 → 6`, `''` doesn't crash).
- The tier tab has no player-count control. The citation panel still shows "1 player" for the two solo
  lists. The recommender still has its player-count input, and note relevance still works.
- On Fear / Events / Blight, the filter panel offers no control over card kind.
- The "Unrated" label is fully legible on the 3MBG board at desktop and 375px, and no other tier row's
  layout changed.
- Verified in a real browser (`playwright` is already a dev dependency — v4 #14), not just by test.

## Comments

Shipped 2026-07-12. Player-count clamping lives in `src/domain/playerCount.ts`
(`clampPlayerCount`), used by the recommender's context setter; both number inputs are a shared
`PlayerCountInput` that holds the typed string locally and clamps on blur, so an emptied field can
be retyped. The tier list's player-count control and `players`-based filtering are gone from
`TierListControls.tsx`; the citation panel still shows the sourced player count, untouched. The
Fear/Events/Blight "Type" row and `OtherCardFilterState.kinds` are deleted outright — the segment
already picks the kind. The "Unrated" label rotates (`writing-mode: vertical-rl`) rather than
wrapping or shrinking, verified in a real browser at desktop and 375px on both the 3MBG and owner's
boards; no other row's layout moved. All four fixes landed in one diff per the ticket's ask.
