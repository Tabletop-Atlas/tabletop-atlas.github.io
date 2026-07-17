# 03 — Chip-system adaptation for the light-parchment win

Status: ready-for-human
Type: wayfinder:prototype
Blocked by: —
Assignee: —
Parent: ../MAP.md

## Question

Now that the owner has picked candidate A (light-parchment) on the theme variant round
([02](02-theme-variant-round.md)), how should the dark-tuned semantic chip systems in
`src/components/tagColors.ts` — `EXPANSION_COLOR`, `TAG_COLOR`, `CARD_KIND_COLOR`,
`CARD_SPEED_COLOR`, `SCENARIO_BAND_COLOR`, `SUBTYPE_COLOR` — re-tune to feel aligned with the
light shell, while staying legible and pairwise-distinct (`cardChipColors.test.ts`)?

The owner's reaction to the live A candidate: "the other elements such as chips... are not really
aligned with the light theme aesthetic." Ticket 01's reconciliation ([token-palette.md](../token-palette.md))
had assessed these as "probably fine, verify by eye" on a legibility basis — the owner's call is
an *aesthetic* one on top of that: technically legible isn't the same as feeling like it belongs
on parchment. `tierColors.ts`'s pastel `PALETTE` already got a `'light'`-variant fix during ticket
02 (a legibility fix, not an aesthetic re-tune) — this ticket is about the rest of the chip
systems, and may also revisit whether that fix reads as *aligned*, not just legible.

Build candidates the owner can react to (in context, against the live `?theme=A` shell — the
round scaffolding from ticket 02 is still in place) rather than deciding the retint unilaterally.
Consider whether "aligned" means warming/desaturating the existing hues to sit closer to the
parchment/ink/gold family, or something else — that's for the owner to react to, not to presume.

## Acceptance criteria

- [ ] At least one re-tint candidate per chip system (or a documented case for "leave as-is")
      rendered against the live light-parchment shell.
- [ ] `cardChipColors.test.ts` stays green — re-tune, not collision.
- [ ] Data honesty holds — OCFDU true, unrated absent, judgment-provenance tags still labelled.
- [ ] Owner's pick + reaction notes recorded.

## HITL

The **OWNER** judges "aligned," never the agent — this is an aesthetic call, not a legibility
check the agent can verify alone. Ticket waits at `needs-info` once candidates are live.
