# PRD-2 — Island retheme rollout: the app-wide token sweep

Status: done
Assembled: 2026-07-21 (the terminal deliverable of [MAP.md](MAP.md), produced once
[05](issues/05-ornament-vocabulary.md) resolved and the decided direction shipped)
Parent: [PRD.md](PRD.md) (the decision effort this rollout was deferred from — see its
"Out of Scope") · [MAP.md](MAP.md) (the live work plan, now closed)

**This is the handed-off execution PRD.md's own "Out of Scope" pointed to: "The mechanical
app-wide rollout execution — every non-anchor surface inheriting the winning tokens. Handed off
per the deliverable decision; a future v6 effort, not this map."** The decision itself (warm-dark
direction, minimal accent rules, chips/modal unchanged) is closed and shipped as the app's
unconditional default. This document specs the remaining mechanical work: making the *rest* of the
app's chrome — buttons, inputs, tables, tracks, borders — consistent with that shipped direction,
instead of the leftover hardcoded cool-toned hexes from the pre-retheme "command deck" look.

## Problem Statement

The four anchor surfaces (app shell, Browse, tier board, Archive/Cards) were built against the
`--deck-*` tokens during the variant round and now read the shipped warm-dark direction correctly.
Everywhere else, the stylesheet still hardcodes the *old* cool near-black palette
(`#16202a`, `#1a222b`, `#17202a`, `#2c3a46`, `#222`, plain `#fff`/`#f2f2f2` text) predating this
retheme entirely. An audit of `src/deck.css` (2026-07-21, `grep -n '#[0-9a-fA-F]\{3,6\}'` outside
the token blocks) found roughly 45 such hardcoded declarations, clustered in:

- **Card/other-card rows and chips** — `.card-row-pill`, `.card-row-cost`, `.card-row-spirit`,
  `.expansion-chip`, `.subtype-chip`, `.subtype-chip-empty` (Archive/Cards' row chrome, distinct
  from the already-tokenized chip *palettes* in `tagColors.ts`)
- **Dashboard** — `.dashboard-picker`, `.dashboard-facet-bar`, `.dashboard-facet-slow`,
  `.dashboard-gap-odds-table td`, `.deck-element-track`, `.deck-upset-totaltrack`,
  `.deck-upset-dot` track/background colours (distinct from `DeckUpset.tsx`'s own semantic
  element/set-size colours, which are locked judgment values, not shell chrome)
  and `OcfduBars`' `.ocfdu-column-track`, `.ocfdu-element-chip`
- **Tier board** — `.tier-tile-art`, `.tier-tile-card-art`, `.tier-tile-spirit-name`,
  `.tier-tile figcaption`, `.tier-label` neighbouring chrome
- **Misc chrome** — `.spirit-tile select`, `.home-door-banner:hover`, `.notice`, `.notes`,
  `.placeholder-art`, `.deck-why`, `.deck-heat`, `.deck-row-head:hover`, `.deck-thumb`,
  `.aspect-hint`, `.scenario-difficulty`, `.adversary-tile-level`

None of this is a design decision left to make — the direction (warm-dark, which role each token
plays) is already locked in `token-palette.md` and shipped in `:root`. This is purely "does this
declaration point at the token that already exists for its role, or a leftover literal hex."

## Solution

A per-surface sweep: for each hardcoded declaration found in the audit above, replace the literal
hex with the semantically-nearest existing `--deck-*` token (`bg`/`panel`/`panel-2`/`line`/
`line-soft`/`text`/`body`/`dim`/`accent`/`accent-bg`/`warn`). Where no existing token fits a role
(e.g. a hover-state tint, a disabled-state grey), that is a genuine new judgment call — escalate it
to the owner rather than inventing a value, exactly as `token-palette.md`'s own provenance
discipline requires. Do **not** touch the chip-system palettes in `tagColors.ts`/`tierColors.ts` or
`DeckUpset.tsx`'s element/set-size colours — those are separate, already-decided semantic systems
(`cardChipColors.test.ts` pins them), not shell chrome.

## User Stories

1. As a player, I want every part of the app — not just the four anchor surfaces — to read the
   same warm-dark direction, so the app feels like one coherent theme rather than a partially
   retthemed patchwork.
2. As a player, I want no visual regression on the four anchor surfaces already built against the
   shipped tokens, so this sweep only touches what's still inconsistent.
3. As the owner, I want any declaration that doesn't map cleanly onto an existing token escalated
   to me, not guessed, so a new judgment value is still my call, not the agent's.
4. As a maintainer, I want the chip-system palettes and `DeckUpset`'s semantic colours left
   completely untouched, so this sweep can't accidentally re-open an already-decided system.
5. As a maintainer, I want `cardChipColors.test.ts` to keep passing unchanged, so the
   pairwise-distinctness guarantee survives the sweep.

## Implementation Decisions

- **Per-surface issues, one PR-sized unit each** (mirrors `v6`-style rollout slicing):
  1. **Card/other-card row chrome** (`CardRows.tsx`/`OtherCardRows.tsx`/`AdversaryRows.tsx`'s
     `deck.css` rules: `.card-row-pill`, `.card-row-cost`, `.card-row-spirit`, `.expansion-chip`,
     `.subtype-chip`, `.subtype-chip-empty`)
  2. **Dashboard chrome** (`.dashboard-picker`, `.dashboard-facet-bar`, `.dashboard-facet-slow`,
     `.dashboard-gap-odds-table`, `.deck-element-track`, `DeckUpset`'s non-semantic tracks,
     `OcfduBars`' track/chip chrome)
  3. **Tier board chrome** (`.tier-tile-art`, `.tier-tile-card-art`, `.tier-tile-spirit-name`,
     `.tier-tile figcaption`'s neighbouring rules, `.tier-label` chrome — not the `PALETTE` hues
     themselves)
  4. **Misc/global chrome** (`.spirit-tile select`, `.home-door-banner:hover`, `.notice`, `.notes`,
     `.placeholder-art`, `.deck-why`, `.deck-heat`, `.deck-row-head:hover`, `.deck-thumb`,
     `.aspect-hint`, `.scenario-difficulty`, `.adversary-tile-level`)
  5. **Sweep-closing audit**: re-run the same `grep -n '#[0-9a-fA-F]\{3,6\}' src/deck.css` audit
     used to scope this PRD, confirm each remaining hit is a locked semantic value
     (`tagColors.ts`/`tierColors.ts`/`DeckUpset.tsx`'s element or set-size colours — never shell
     chrome), and record the final list so a future hardcoded regression has something to diff
     against.
- **No new query-param scaffolding for this rollout.** Every value here is already decided
  (`token-palette.md`); this is direct replacement, not another variant round. A declaration that
  doesn't map cleanly is a stop-and-ask, not a new round.
- **Verification per issue:** visual check at 375px + desktop against the *shipped* app (no query
  params — the default is now the winning direction), `cardChipColors.test.ts` and the full suite
  passing unchanged, and a screenshot before/after in `screenshots-06/`.

## Testing Decisions

- No new domain seam — this is a CSS-only sweep. The guard is `cardChipColors.test.ts` (must stay
  green, unchanged) plus the existing app smoke tests (must stay green, unchanged) — if either
  needs an edit to pass, that's a signal the sweep touched a chip-system or semantic colour it
  shouldn't have.
- Screenshots per issue (before/after), same convention as `screenshots-02` through `-05`.

## Out of Scope

- **Re-opening the theme/chip/modal/ornament decisions** — all four are closed
  ([PRD.md](PRD.md)'s decisions); this rollout consumes them, never revisits them.
- **`DeckUpset.tsx`'s element/set-size colours, `tagColors.ts`/`tierColors.ts`'s chip palettes** —
  separate, already-decided semantic systems guarded by `cardChipColors.test.ts`.
- **New tokens invented without owner sign-off** — any declaration that doesn't map onto an
  existing `--deck-*` role escalates; it doesn't get a guessed value.
- **Anything not surfaced by the `src/deck.css` hex audit** — if a future audit finds more, it's a
  new ticket, not silently folded into this one's issues.

## Further Notes

- The audit line numbers cited above are a snapshot (2026-07-21); re-grep before starting each
  issue, since earlier issues in this same rollout will shift line numbers for later ones.
- This PRD is deliberately narrow and mechanical — the interesting design work (the direction, the
  ornament) is already done and shipped. What's left is consistency, not more decisions.
