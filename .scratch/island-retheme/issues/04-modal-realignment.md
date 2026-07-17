# 04 — Modal re-alignment for the light-parchment win

Status: done
Type: wayfinder:prototype
Blocked by: —
Assignee: —
Parent: ../MAP.md

## Question

Now that the owner has picked candidate A (light-parchment) on the theme variant round
([02](02-theme-variant-round.md)), does the spirit detail modal's shipped `PANEL_COLOR` (dark
umber-parchment, panel-theming #03) flip to a light treatment, or stay dark deliberately (a
"lantern" moment against the lighter shell)? This is exactly the question panel-theming's own
spread verdict (ticket 04 there) deferred: "the shipped modal is a *movable* anchor — if a light
direction wins, the modal flips to match... not this map's job to pre-decide" (map Notes).

The owner's reaction to the live A candidate named the panel/modal text specifically as
misaligned — unlike ticket 03's chip systems (a "does this feel warm enough" question), this one
also has a real option on the table of *not* re-tinting at all, if the owner likes the modal
reading as a distinct, darker focal moment. Both should be built and shown, not just the
re-tinted one.

## Acceptance criteria

- [x] A "flip to light" candidate (parchment surface, ink text, band-tan accent — analogous to the
      shell's own light tokens) and a "stays dark, deliberately" candidate (shipped `PANEL_COLOR`
      unchanged) both rendered against the live `?theme=A` shell.
- [x] OCFDU data-honesty rules (true figures, absent-unrated) hold in whichever wins.
- [x] `cardChipColors.test.ts`'s `PANEL_COLOR` pairwise-distinctness pins stay green.
- [x] Owner's pick + reaction notes recorded.

## HITL

The **OWNER** picks flip-vs-stay, never the agent — panel-theming already established this as a
standing HITL rule for exactly this modal. Ticket waits at `needs-info` once candidates are live.

## Candidates live (2026-07-17)

Behind `?theme=A&modal=stay|flip` on any tab (a third switcher stacks under tickets 02/03's
switchers, bottom-right):

- **stay**: the modal's shipped `PANEL_COLOR` exactly as-is (dark umber-parchment,
  panel-theming #03) — the "deliberate lantern moment" case.
- **flip**: a new `PANEL_COLOR_LIGHT` (`tagColors.ts`) — the same vibe-sheet roles as
  `PANEL_COLOR`, but using the sampled hexes directly rather than their dark-translation:
  parchment surface (`#e7d19c`), parchment-lit raised (`#f2e7c8`), parchment-aged edge
  (`#cdb88c`), ink text (`#2e2520`), ink-soft body (`#5b4e2d`). `accent` deliberately reuses the
  exact same band-tan hex as the shipped dark modal (`#d2b068`) — the vibe sheet notes band-tan
  "holds on dark," i.e. it was sampled to work on both.

`PANEL_COLOR` itself is untouched — `cardChipColors.test.ts`'s existing pins stay green
unedited. No new distinctness test was added for `PANEL_COLOR_LIGHT`: the two palettes are
mutually exclusive (never rendered together, gated behind the same switcher), unlike the chip
systems ticket 03 guarded, which can appear on-screen simultaneously.

Screenshots (desktop 1280, spirit detail modal) for both `stay` and `flip` are in
[screenshots-04/](../screenshots-04/).

## Resolution — owner's pick (2026-07-17)

**Owner picked `stay`** — the modal keeps its shipped `PANEL_COLOR` (dark umber-parchment)
unchanged, the deliberate "lantern" moment. Consistent with ticket 02's revised base-direction
pick (B, warm-dark) — B was already noted at charting as "near-identical to the shipped modal's
`PANEL_COLOR` — the 'no modal changes needed' case," so `stay` needs no further reconciliation.

`PANEL_COLOR_LIGHT` (the `flip` candidate) is left in place as inert scaffolding rather than
deleted, matching the standing "shipping deferred to the terminal ticket" convention — no code
currently reads `?modal=flip` as the app default.
