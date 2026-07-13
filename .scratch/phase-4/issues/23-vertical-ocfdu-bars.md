# 23 — OCFDU bars: vertical columns

Status: done
Parent: [Phase 4 PRD](../PRD.md) · cluster 5 (Archive & theming) — owner request after the
phase-4 build (2026-07-13), follow-on to #11's labelled bars.

## What to build

The owner's words: the #11 bars feel "a bit out of theme … I really wanted it to align with
what is in the panels. … Or at least we change for now the vertical view to horizontal. So the
bars are from top to bottom, not from left to right. I know it's not ideal for readability,
but it's good."

So, for now: flip the OCFDU profile from horizontal rows to **vertical columns** — five columns
side by side (Offense…Utility), each a vertical track filled by the rating, value figure and
axis label on the column. Everything else #11 settled stays: the track represents 5, the three
transcribed 6s clamp at a full track while the figure tells the truth, the Elements chip row
stays.

**Panel-aligned theming (parchment surface, node-styled values like the printed spirit panels)
is explicitly NOT this ticket** — it belongs to the "left panel / global theming" fog item and
needs its own owner conversation.

## Acceptance criteria

- [x] The OCFDU profile renders as five vertical columns; fill height = rating/5, clamped
- [x] Value figures still show the true number (a 6 reads 6 over a full track)
- [x] Elements chip row unchanged
- [x] Smoke assertions updated from width-fill to height-fill
- [x] Browser-verified at 375px + desktop (five columns fit, no overflow)

## Comments

**Resolved (2026-07-13).** `OcfduBars` renders five columns (value figure on top, 72px vertical
track filling bottom-up, full-word label beneath); #11's rules unchanged — track = 5, the three
transcribed 6s clamp at a full track with the true figure shown, Elements chips unchanged.
Smoke assertions flipped `width:` → `height:`. Verified on the production build at 375px +
1280px: five columns, fills proportional to ratings, no overflow. 381/381 tests. Panel-aligned
theming (parchment, node-styled values, like the printed panels) deliberately left to the
global-theming conversation — recorded here so the wish isn't lost.
