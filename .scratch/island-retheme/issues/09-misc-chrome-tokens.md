# 09 — Misc/global chrome onto `--deck-*` tokens

Status: done
Parent: [PRD-2.md](../PRD-2.md)

## What to build

Replace the hardcoded hex declarations in `src/deck.css` for `.spirit-tile select`,
`.home-door-banner:hover`, `.notice`, `.notes`, `.placeholder-art`, `.deck-why`, `.deck-heat`,
`.deck-row-head:hover`, `.deck-thumb`, `.aspect-hint`, `.scenario-difficulty`, and
`.adversary-tile-level` with the semantically-nearest `--deck-*` token. Re-grep before starting —
this is the widest-net issue in the rollout and most likely to turn up a value with no clean token
match; escalate those rather than guessing.

## Acceptance criteria

- [x] Every hardcoded hex found in the audited selectors is either a `--deck-*` token or escalated
      to the owner as a declaration with no clean token match — never silently invented.
- [ ] Visual check at 375px + desktop across the Homepage, Browse (placeholder art / notices),
      Archive (scenario/adversary chrome), and Recommend (`.deck-why`); screenshot before/after in
      `screenshots-06/`. (skipped — no browser/screenshot tooling in this session)
- [x] `cardChipColors.test.ts` and the full suite pass unchanged.

## Blocked by

None.

## Comments

Re-grepped `src/deck.css`. Changes:

- `.home-door-banner:hover` border `#2c3a46` → `var(--deck-line)`, background `#16202a` →
  `var(--deck-line-soft)` (matches the `.card-row:hover` hover-fill idiom already established).
- `.deck-row-head:hover` background `#16202a` → `var(--deck-line-soft)` (same hover idiom).
- `.deck-thumb` background `#222` → `var(--deck-panel-2)` (recessed image-loading placeholder).
- `.deck-why` color `#6f8090` → `var(--deck-dim)` (muted meta text).
- `.deck-heat span` background `#17202a` → `var(--deck-panel-2)` (recessed cell background).
- `.notes` color `#8aa0b2` → `var(--deck-dim)` (muted text).
- `.aspect-hint` and `.notice` color `#d8c48b` → `var(--deck-text)` (both are warm-gold
  emphasis/attention text next to the `--deck-warn` left border; `#d8c48b` sits closest to
  `--deck-text` of the three text tokens by hue and lightness).
- `.spirit-art`/`.placeholder-art` shared background `#222` → `var(--deck-panel-2)` (matches
  `.deck-thumb`'s reasoning — recessed art-loading placeholder).
- `.spirit-tile select` background `#16202a` → `var(--deck-panel)`, matching the already-tokenized
  `.tier-tile-edit select` (`var(--deck-panel)`) elsewhere in this file — same widget type, kept
  consistent rather than picking a different surface token for no reason.

Escalated (left alone, no clean token match):

- `.placeholder-art { color: #fff }` — near-white placeholder-icon/label text over the dark
  placeholder background; no `--deck-*` token is near-white (same reasoning as ticket 06/08's
  white-text cases).
- `.scenario-difficulty { color: #f2f2f2 }` — near-white contrast text sitting on the inline,
  locked `SCENARIO_BAND_COLOR` banded frame; no near-white token exists, and `--deck-text`
  (`#e7d19c`) is a warm gold, not white, so it would shift hue against arbitrary band colours.
- `.adversary-tile-level { color: #fff }` — near-white badge text over an `rgba(0, 0, 0, 0.7)`
  scrim (the scrim itself is an rgba() literal, outside the hex audit's scope); same
  no-near-white-token reasoning.

Screenshots not captured — no visual/browser tooling available in this session.

`npx tsc --noEmit` and `npx vitest run` both pass, `cardChipColors.test.ts` unchanged and green.
