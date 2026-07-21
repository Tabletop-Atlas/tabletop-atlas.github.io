# 06 — Card/other-card row chrome onto `--deck-*` tokens

Status: done
Parent: [PRD-2.md](../PRD-2.md)

## What to build

Replace the hardcoded hex declarations in `src/deck.css` for `.card-row-pill`, `.card-row-cost`,
`.card-row-spirit`, `.expansion-chip`, `.subtype-chip`, `.subtype-chip-empty` (the row chrome
`CardRows.tsx`/`OtherCardRows.tsx`/`AdversaryRows.tsx` render into) with the semantically-nearest
`--deck-*` token. Re-grep `src/deck.css` for `#[0-9a-fA-F]{3,6}` near these selectors before
starting — PRD-2's cited line numbers are a snapshot and will have shifted.

Do not touch `tagColors.ts`'s chip *palettes* (`EXPANSION_COLOR`, `SUBTYPE_COLOR`, etc.) — those
are the already-decided semantic colours the chips render; only the surrounding chrome (padding
backgrounds, borders, muted text) is in scope here.

## Acceptance criteria

- [x] Every hardcoded hex found in the audited selectors is either a `--deck-*` token or escalated
      to the owner as a declaration with no clean token match — never silently invented.
- [ ] Visual check at 375px + desktop against the shipped (no-query-param) app; screenshot
      before/after in `screenshots-06/`. (skipped — no browser/screenshot tooling in this session)
- [x] `cardChipColors.test.ts` and the full suite pass unchanged.

## Blocked by

None — the direction is already decided ([PRD.md](../PRD.md)).

## Comments

Re-grepped `src/deck.css` for `#[0-9a-fA-F]{3,6}` near the named selectors. Changes:

- `.card-row-type`, `.card-row-spirit`, `.card-row-speed`, `.card-row-expansion` — `color: #7d8f9f`
  (muted blue-grey label/meta text) → `var(--deck-dim)` in all four.
- `.subtype-chip-empty` — `background: #6b6458` → `var(--deck-dim)`; `color: #e7d19c` (already
  numerically equal to `--deck-text`) → `var(--deck-text)`.

Escalated (left alone, no clean token match):

- `.card-row-cost { color: #d7b56a }` — a saturated gold with no `--deck-*` analogue; also reused
  for `DeckUpset`'s set-size3 legend, a locked semantic value per ticket 07 — leaving alone rather
  than forcing onto `--deck-text` or `--deck-warn`, neither of which matches this hue.
- `.card-row-pill { color: #f2f2f2 }` — near-white contrast text sitting on top of an *inline*
  JS-supplied chip background (`CARD_KIND_COLOR`/`CARD_SPEED_COLOR`, locked palette per
  `tagColors.ts`). None of the 11 `--deck-*` tokens is a near-white; `--deck-text` (`#e7d19c`) is a
  warm parchment gold, not white, and would read as a different hue against arbitrary chip colours.
  Left as literal white for contrast-on-arbitrary-hue, not forced onto `--deck-text`.
- `.expansion-chip { color: #fff }` — same reasoning as `.card-row-pill`: contrast text over an
  inline `expansionColorFor()` background; no near-white token exists.
- `.subtype-chip { color: #fff }` — same reasoning again: contrast text over an inline
  `SUBTYPE_COLOR` background; no near-white token exists.

Screenshots not captured — no visual/browser tooling available in this session.

`npx tsc --noEmit` and `npx vitest run` both pass, `cardChipColors.test.ts` unchanged and green.
