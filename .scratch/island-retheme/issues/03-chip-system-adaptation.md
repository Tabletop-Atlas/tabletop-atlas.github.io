# 03 — Chip-system adaptation for the light-parchment win

Status: needs-info
Type: wayfinder:prototype
Blocked by: —
Assignee: claude
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

- [x] At least one re-tint candidate per chip system (or a documented case for "leave as-is")
      rendered against the live light-parchment shell.
- [x] `cardChipColors.test.ts` stays green — re-tune, not collision.
- [x] Data honesty holds — OCFDU true, unrated absent, judgment-provenance tags still labelled.
- [ ] Owner's pick + reaction notes recorded.

## HITL

The **OWNER** judges "aligned," never the agent — this is an aesthetic call, not a legibility
check the agent can verify alone. Ticket waits at `needs-info` once candidates are live.

## Candidates live (2026-07-17)

Behind `?theme=A&chips=original|warm` on any tab (a second switcher stacks under ticket 02's
theme switcher, bottom-right):

- **original**: every chip system exactly as shipped today (dark-tuned hues, unchanged).
- **warm**: every value in `EXPANSION_COLOR`, `TAG_COLOR`, `CARD_KIND_COLOR`, `CARD_SPEED_COLOR`,
  `SCENARIO_BAND_COLOR`, and `SUBTYPE_COLOR` mixed 22% toward the vibe sheet's `gold` (`#eecb73`)
  — warms and slightly desaturates each hue without moving its rank in the family, so every
  system stays pairwise-distinct (a new `chipRoundColors.test.ts` pins the warm values apart from
  each other and from every shipped palette, the tier rainbow, and `PANEL_COLOR`).

`tierColors.ts`'s pastel palette is **left as-is beyond its ticket-02 legibility fix** — those
seven hues are sampled from the owner's own TierMaker board, not a chip system this repo invented,
so re-tinting them further would break the tie to that external reference rather than align an
in-house palette. Documented here as the "leave as-is" case the acceptance criteria allows for.

The spirit detail modal's `PANEL_COLOR` is untouched (out of scope — ticket
[04](04-modal-realignment.md)'s job); screenshots below show it deliberately still clashing, so
the two tickets stay visibly decoupled.

Screenshots (desktop 1280 + mobile 375 where applicable) covering Browse, the spirit detail
modal, Archive Powers/Fear rows, and the Scenarios grid+rows, for both `original` and `warm`, are
in [screenshots-03/](../screenshots-03/).

**Waiting on the owner's reaction** — this ticket stays at `needs-info`.
