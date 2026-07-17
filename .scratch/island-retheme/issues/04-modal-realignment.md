# 04 — Modal re-alignment for the light-parchment win

Status: ready-for-human
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

- [ ] A "flip to light" candidate (parchment surface, ink text, band-tan accent — analogous to the
      shell's own light tokens) and a "stays dark, deliberately" candidate (shipped `PANEL_COLOR`
      unchanged) both rendered against the live `?theme=A` shell.
- [ ] OCFDU data-honesty rules (true figures, absent-unrated) hold in whichever wins.
- [ ] `cardChipColors.test.ts`'s `PANEL_COLOR` pairwise-distinctness pins stay green.
- [ ] Owner's pick + reaction notes recorded.

## HITL

The **OWNER** picks flip-vs-stay, never the agent — panel-theming already established this as a
standing HITL rule for exactly this modal. Ticket waits at `needs-info` once candidates are live.
