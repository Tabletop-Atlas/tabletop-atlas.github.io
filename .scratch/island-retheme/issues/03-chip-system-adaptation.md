# 03 — Chip-system adaptation for the light-parchment win

Status: done
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
- [x] Owner's pick + reaction notes recorded.

## HITL

The **OWNER** judges "aligned," never the agent — this is an aesthetic call, not a legibility
check the agent can verify alone. Ticket waits at `needs-info` once candidates are live.

## Candidates live (2026-07-17)

Behind `?theme=A&chips=original|warm` on any tab (a second switcher stacks under ticket 02's
theme switcher, bottom-right):

- **original**: every chip system exactly as shipped today (dark-tuned hues, unchanged).
- **warm** (v3): every value in `EXPANSION_COLOR`, `TAG_COLOR`, `CARD_KIND_COLOR`,
  `CARD_SPEED_COLOR`, `SCENARIO_BAND_COLOR`, and `SUBTYPE_COLOR` pushed by a fixed
  `R+50 / G+15 / B-50` channel shift, clamped to 0-255 (a new `chipRoundColors.test.ts` pins the
  warm values apart from each other and from every shipped palette, the tier rainbow, and
  `PANEL_COLOR`).

  Two earlier attempts didn't land, both recorded in `tagColors.ts`'s comment for whoever reopens
  this: **v1** (22% blend toward the vibe sheet's `gold`) came back from the owner as
  indistinguishable from the shipped palette at a glance. **v2** (a gentler `R+28/G+6/B-26` fixed
  push, deliberately tuned to hold luminance dead level for contrast safety) was still too shy. A
  bolder *multiplicative* grade tried in between (`×1.35` red, `×0.5` blue) actually broke —
  `blight-positive` and `ramping-economy` clamp to the exact same hex once boosted that hard, since
  their only difference is a red channel both saturate past 255. v3 keeps the push additive (order-
  preserving, no clamp-collision risk) but goes considerably further, verified collision-free by
  direct computation against every palette in the app. This is a real, visible shift now (e.g. the
  Browse tile's "Base" chip moves from blue `#4a6b8a` to olive-khaki `#7c7a58`) — confirmed by
  zoomed-crop comparison, not just by eye on the full page (at full-page scale the shift still
  reads as subtle, which is a legitimate finding about how visible any chip-level re-tint can be at
  that size, not a sign the change isn't real).

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

## Resolution — owner's pick (2026-07-17)

**Owner picked `warm` (v3)** — "it's aligned now." `EXPANSION_COLOR_WARM`, `TAG_COLOR_WARM`,
`CARD_KIND_COLOR_WARM`, `CARD_SPEED_COLOR_WARM`, `SCENARIO_BAND_COLOR_WARM`, and
`SUBTYPE_COLOR_WARM` in `tagColors.ts` — the `R+50/G+15/B-50` push — are the winning re-tint.
`tierColors.ts`'s pastel palette stays as shipped (plus its ticket-02 light-variant fix); the
modal's `PANEL_COLOR` is untouched, per ticket 04.

This ticket resolved the *aesthetic* direction; it did not ship the winner as the shell's default
(the `?chips=` scaffolding is still live, matching ticket 02's own "leave it in place for
03/04/05 to build against" call). Shipping — deleting `chips=original`, making `*_WARM` the only
values, and tearing down `ChipRound.tsx`/`chipRoundColors.test.ts` — is deliberately left for
whichever ticket finalizes the whole island-retheme direction (the terminal deliverable fog item),
so all three graduated tickets (03/04/05) ship together rather than the shell shifting under the
owner's feet between each pick.
