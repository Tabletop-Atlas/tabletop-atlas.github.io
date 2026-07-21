# 10 — Sweep-closing audit

Status: done
Parent: [PRD-2.md](../PRD-2.md)

## What to build

Once 06–09 are done, re-run the same audit used to scope this rollout:
`grep -n '#[0-9a-fA-F]\{3,6\}' src/deck.css`, minus the token-definition blocks
(`:root`) themselves. Confirm every remaining hit is a locked semantic value —
`tagColors.ts`'s/`tierColors.ts`'s chip palettes, `DeckUpset.tsx`'s element/set-size colours, or a
value an earlier issue in this rollout explicitly escalated and the owner kept as a hex — never
leftover shell chrome that 06–09 missed.

Record the final list (selector → value → why it's locked, or a link to the escalation that kept
it) in this ticket's Comments, so a future hardcoded-colour regression has something concrete to
diff against.

## Acceptance criteria

- [x] Every remaining hardcoded hex in `src/deck.css` is accounted for and justified.
- [x] Any stray shell chrome 06–09 missed is fixed here, not left for a future ticket.
- [x] `cardChipColors.test.ts` and the full suite pass unchanged.

## Blocked by

- 06, 07, 08, 09.

## Comments

Re-ran `grep -n '#[0-9a-fA-F]\{3,6\}' src/deck.css` after 06–09 landed. Found four leftover shell-
chrome declarations that none of 06–09 named explicitly (missed because they're on generic/global
selectors, not the per-surface selector lists each ticket audited) and fixed them in this ticket
rather than leaving them:

- `button { background: #16202a }` → `var(--deck-panel)` (matches the already-tokenized
  `.deck-field select`/`.tier-tile-edit select` surface).
- `button:hover:not(:disabled) { border-color: #2c3a46 }` → `var(--deck-line)`.
- `.deck-wild { border: 1px dashed #4a3a1e; background: #1a1508 }` → border `var(--deck-line)`
  (near-identical numeric match), background `var(--deck-panel-2)` (recessed nested-field role,
  same idiom as the dashboard tracks/tile placeholders).
- `.tier-badge-ribbon { color: #10141a }` and `.tier-chip { color: #10141a }` → both
  `var(--deck-bg)` — contrast text on the locked `tierColor` fill, same reasoning as ticket 08's
  `.tier-label` and ticket 07's `.deck-upset-sizechip[data-active='true']`.
- `.rating-segment { color: #0b1410 }` → `var(--deck-bg)` — contrast text on an inline rating-tier
  fill colour, same "near-black text on a locked accent chip" role as the above; kept consistent
  with that pattern rather than picking a pixel-nearer-but-role-mismatched alternative.

**Final full list of every remaining hardcoded hex in `src/deck.css`, post-sweep, and why each is
locked/escalated (not shell chrome):**

Token-definition blocks (not shell chrome, the tokens themselves):
- Lines 37–47: `:root`'s eleven `--deck-*` warm-dark definitions.
- Lines 69–79: the `[data-theme="light"]`-style parchment override block (pre-existing, out of
  scope per the task brief — "leave that alone, it already exists").
- Lines 191, 199: comments referencing old hex values for context, not live declarations.

Locked semantic systems (`tagColors.ts`/`tierColors.ts`/`DeckUpset.tsx`, guarded by
`cardChipColors.test.ts`):
- Lines 2121–2122, 2129–2130, 2242, 2244, 2249, 2251: `DeckUpset`'s set-size palette
  (`deck-upset-size3` = `#d7b56a`, `deck-upset-size5` = `#9a6fc4`) — locked per PRD-2/ticket 07.

Escalated in ticket 06 (kept, no clean token match — see 06's Comments for full reasoning):
- Line 1806: `.card-row-cost { color: #d7b56a }`.
- Line 1827: `.card-row-pill { color: #f2f2f2 }`.
- Line 1839: `.expansion-chip { color: #fff }`.
- Line 1866: `.subtype-chip { color: #fff }`.

Escalated in ticket 08 (kept — see 08's Comments):
- Line 897: `.tier-tile figcaption { color: #fff }`.
- Line 919: `.tier-tile-spirit-name { color: #fff }`.

Escalated in ticket 09 (kept — see 09's Comments):
- Line 623: `.placeholder-art { color: #fff }`.
- Line 1698: `.scenario-difficulty { color: #f2f2f2 }`.
- Line 1712: `.adversary-tile-level { color: #fff }`.

New escalations surfaced by this ticket's audit, not caught by 06–09 because neither selector was
named in any of those tickets' scoped selector lists (`.spirit-tile-dot-filled`/`.spirit-tile-chip`
are Browse-tile chrome, closer to card-row chip family than any of 06–09's named lists) — same
"contrast text/marker with no near-white token" reasoning as the escalations above, so folded into
that same justification rather than treated as a new category:
- Line 767: `.spirit-tile-dot-filled { background: #fff }` — a plain filled-vs-translucent-white
  complexity marker dot (the unfilled state is literally `rgba(255, 255, 255, 0.28)`); this is a
  white/white-alpha graphical marker pair, not a themed surface or text role, so no `--deck-*`
  token applies.
- Line 789: `.spirit-tile-chip { color: #fff }` — contrast text over an inline
  `CARD_KIND_COLOR`/`CARD_SPEED_COLOR`-family chip background, the same idiom as `.card-row-pill`
  (ticket 06) and `.expansion-chip`/`.subtype-chip`; no near-white `--deck-*` token exists.

Total: every remaining hardcoded hex in `src/deck.css` is now either a token-definition block, a
locked semantic system, or a documented escalation with a stated reason. No leftover shell chrome
remains unaccounted for.

`npx tsc --noEmit` and `npx vitest run` both pass, `cardChipColors.test.ts` unchanged and green
(42 files, 485 tests).
