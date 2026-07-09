# 21 — The random drawer still draws spirits, not configurations

Status: needs-triage

## Parent

`.scratch/v2/PRD.md`

## The observation

v2 changed the unit of recommendation from a spirit to a configuration. `recommend`,
`dedupeBySpirit`, the result rows, the wildcard, the tier board, the game log and the backup
file all speak configurations now.

`RandomChooser` does not. It calls `drawRandom(spirits, …)` and hands back a base spirit.
`randomChoose.ts` filters its eligible pool on `spirit.complexity` — the printed base value —
so it cannot see that *Shadows–Reach* is simpler than base Shadows, or that *Shadows–Dark
Fire* is harder. The complexity ceiling the drawer offers is therefore scored against a number
v2 stopped believing in for every other feature.

Two features sit in the same tab and disagree about what you are choosing: the wildcard names
an aspect, the drawer never can.

No user story covers the drawer, which is why this is an observation and not a bug. v2 simply
never mentioned it.

## The decision to make

Should the drawer draw configurations?

- **Yes** — it becomes consistent with everything else, its ceiling filter reads
  `effectiveComplexity`, and "draw me something at random" can hand you an aspect. The pool
  grows from 37 to 68, which changes the odds: aspect-rich spirits become likelier to appear
  in some form. Whether that is desirable is exactly the question.
- **No** — the drawer is a *spirit* picker by intent, and aspects are a second choice made
  after. Then say so in a comment, because the inconsistency currently reads as an oversight.

If the answer is yes, note that `eligiblePool`'s hard filter should read `effectiveComplexity`
(printed base + aspect arrow), not `personalEffectiveComplexity` — the drawer's ceiling is the
newcomer safeguard's cousin, and the split rule applies to it too.

## Blocked by

- None
