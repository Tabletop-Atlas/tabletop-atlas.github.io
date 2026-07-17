# PRD — Island retheme: a Spirit-Island-aligned visual identity, app-wide

Status: ready-for-agent
Assembled: 2026-07-17 (from the [island-retheme wayfinder map](MAP.md); the map remains the work plan)

**This is a contract for a *decision* effort, not an implementation spec.** It locks the process and
the constraints. It deliberately does **not** decide the palette, light-vs-dark, or the ornament
vocabulary — those are the output of the variant round, and pre-committing them here would be
fabricating the very choice the round exists to make (the failure mode CLAUDE.md is built around).
The map is the live work plan; this PRD is the assembled contract, mirroring how `panel-theming`
structured its PRD.

## Problem Statement

The app wears an all-black "command deck" look — deliberately dark, modern, monochrome
green-on-black. It's competent, but it doesn't feel like Spirit Island, whose identity is vibrant,
natural, and lush. The owner wants to explore a warmer, more Spirit-Island-aligned visual identity
across the whole app — **but refuses to commit to a direction in the abstract.** Light vs. dark,
which colours, and how much "floral" ornament are exactly the questions that need to be *seen*
before they're answered.

## Solution

Run a structured exploration rather than a leap:

1. Build a **token palette** sampled from real Spirit Island art — offered as both a light-parchment
   and a warm-dark option, with the vibrant range (greens, water, bloom, fire) sampled from the
   spirit illustrations, every value carrying its provenance.
2. Stand up a small set of **divergent theme candidates** behind a query param on the app's
   highest-signal surfaces, and let the owner **pick by reacting to real renders**.
3. Capture the pick as **design tokens + a rollout spec** to hand off. The app-wide sweep itself
   happens later, off this effort.

Nothing about the final look is decided in advance — the point is to see it before choosing.

## User Stories

1. As the owner, I want a token palette sampled from real Spirit Island art (not guessed), so that
   every candidate I react to is grounded in the game's actual colours.
2. As the owner, I want the palette offered as both a light-parchment and a warm-dark option, so that
   I can judge light-vs-dark from real values rather than in the abstract.
3. As the owner, I want the vibrant range sampled from the spirit illustrations, so that the palette
   is genuinely vibrant and not just the earthy panel tones the modal already uses.
4. As the owner, I want each sampled colour to record its provenance (which asset, coverage), so that
   I can trust it's real and not fabricated.
5. As the owner, I want a small set of divergent theme candidates rendered on the real running app,
   so that I can see the direction instead of imagining it.
6. As the owner, I want at least one light candidate and one or two warm-dark candidates, so that the
   full latitude I asked for is actually explored.
7. As the owner, I want the candidates shown on the app shell, Browse, the tier board, and the
   Archive, so that I judge the direction on the surfaces that matter most.
8. As the owner, I want to switch between candidates via a query param, so that I can compare them
   live without rebuilds.
9. As the owner, I want to make the final pick myself, so that the aesthetic call is mine and never
   the agent's.
10. As the owner, I want every candidate to keep the chip systems legible and pairwise-distinct, so
    that a vibrant palette never breaks the meaning-carrying colours.
11. As the owner, I want OCFDU figures and unrated markers to stay honest in every candidate, so that
    the restyle never distorts data.
12. As the owner, I want the winning direction captured as design tokens, so that the rollout has a
    single source of truth.
13. As the owner, I want a per-surface rollout spec produced *from the pick*, so that the app-wide
    sweep can be handed off cleanly.
14. As the owner, I want the exploration to reuse the existing fonts and the `panel-theming` vibe
    sheet, so that we build on prior art instead of reopening settled questions.
15. As the owner, I want "floral" delivered as palette + CSS ornament, not new art assets, so that we
    avoid the asset-provenance and trade-dress problems.
16. As the owner, I want the shipped detail modal treated as a movable anchor, so that if a light
    direction wins, the modal is realigned rather than left inconsistent.
17. As the owner, I want the app-wide rollout kept out of this effort, so that the decision stays
    small and I'm not committing to a sweep before I've picked a look.
18. As an end user, I want the app to eventually feel like Spirit Island — warm, vibrant, alive —
    rather than a black modern tool, so that browsing spirits matches the game's spirit.

## Implementation Decisions

- **This effort decides a direction; it does not sweep the app.** The deliverable is the pick +
  tokens + a rollout spec, handed off.
- **Prior art consumed, not reopened:** the `panel-theming` vibe sheet, `PANEL_COLOR`, and the
  phase-4 #22 font decisions.
- **Token palette (ticket work item 1):** extend the modal-only vibe sheet into an app-wide token
  sheet with a **light-parchment column and a warm-dark column**; sample the vibrant range from the
  spirit illustrations (and card art if useful); and note, per variant, which semantic chip systems
  read cleanly vs. would need re-tuning. Delivered as a markdown asset with provenance; presentation
  data, so **no canon tripwire is owed** — provenance is recorded instead.
- **Variant round (ticket work item 2):** candidates behind a namespaced query param
  (`?theme=A|B|C`, the established `?variant=`/`?panel=`/`?headerVariant=` idiom), **≥1 light and
  1–2 warm-dark**, applied to the four anchor surfaces (app shell, Browse, tier board, Archive).
  **Base palette / surface / light-dark only** — ornament is held back so it can't muddy the base
  decision. The **owner picks**; the agent never decides.
- **Deferred to the pick — NOT decided in this document:** light vs. dark, the winning palette, the
  ornament vocabulary, how the chip systems adapt to the winning surface, whether the shipped modal
  flips or re-tints, and the per-surface rollout plan. These graduate into fresh tickets *after* the
  round.
- **Invariants that survive any restyle:** chip-system pairwise distinctness (guarded by
  `cardChipColors.test.ts`); data honesty (OCFDU true, unrated absent); fonts/icons settled by
  phase-4 #22.

## Testing Decisions

This is a decision effort, so there is **no code seam** to unit-test the way a feature has. The
verification is:

- **Token palette:** provenance discipline is the guard — sampled hexes marked sampled (asset +
  coverage), judgment values marked judgment, no fabricated colours. Cross-checked against the panel
  vibe sheet's sampling method.
- **Variant round:** verified by rendering the **production build at 375px + desktop**, screenshots
  captured to `screenshots-NN/`, and resolved by the **owner's pick**. Every candidate must keep the
  chip systems legible/distinct and the data honest.
- The chip-distinctness tripwire (`cardChipColors.test.ts`) remains the standing guard that no
  palette change ever collides two chip systems — it bites during the *rollout* (out of scope here),
  and any candidate that would break it is flagged during the round.
- The real per-surface implementation tests belong to the handed-off rollout effort, not here.

## Out of Scope

- **The mechanical app-wide rollout execution** — every non-anchor surface inheriting the winning
  tokens. Handed off; a future effort.
- **Deciding the palette / light-dark / ornament in this document** — that is the round's job.
- **Literal botanical art assets** — ruled out by the figurative-floral scope.
- **New fonts / icon sourcing** — settled by phase-4 #22.
- **Pixel-faithful panel recreation** — the `panel-theming` fidelity guard (vibe, not replica).
- **Re-tuning the chip palettes** — graduates after the pick, if the winning surface needs it.

## Further Notes

- This is the **spread** `panel-theming` deferred; it consumes that effort's vibe sheet +
  `PANEL_COLOR` as prior art (breadcrumbed from `panel-theming/MAP.md`).
- The [MAP.md](MAP.md) remains the live work plan (frontier, fog, out-of-scope); this PRD is the
  assembled contract the tickets build against — the same split `panel-theming` used.
- The spec is deliberately **outcome-open**: it specifies the process and constraints, not the look.
  A future `/to-spec` run *after* the round produces the genuine rollout spec, with the real
  decisions in it.
