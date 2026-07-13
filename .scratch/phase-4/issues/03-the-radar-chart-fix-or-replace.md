# 03 — The radar chart: fix or replace

Status: done
Type: wayfinder:prototype (HITL)
Parent: [phase-4 map](../MAP.md)

## Blocked by

_(nothing)_

## Question

Does `OcfduRadar` get its colouring fixed for the dark theme, or is it replaced entirely by a
panel showing the spirit's composition, styled like the original game's spirit panels? What's
feasible?

Facts: `OcfduRadar.tsx` has two consumers — `SpiritDetail.tsx` (Browse's detail view) and
`Recommender.tsx`. Whatever wins must work in both, or the ticket decides they diverge.

This is a prototype ticket: build both cheap versions against real spirit data and let the owner
react — v5's tag-colour ticket (#08 there) is the model, screenshots per round.

- **Variant "fix":** the existing radar with dark-theme-correct colours.
- **Variant "replace":** a composition panel in the game's visual idiom (growth track / presence
  track / innate powers layout). Prototype the *layout* with placeholder styling; whether official
  fonts/icons/formatting may be used is
  [#05](05-official-assets-and-licensing.md)'s question — don't wait on it, note the seam where
  official assets would drop in.

Feasibility counsel to bring: what composition data the app actually has per spirit (the panel can
only show what's sourced — this repo never invents data), and roughly what the replace variant
costs at 68-configuration scale.

## Comments

**Resolution (2026-07-13, via `/prototype` — one round, three variants live on the real detail
modal, owner picked directly):**

**Winner: replace the radar with labelled bars.** Five full-word rows (Offense … Utility), thin
accent bars against a track, value figure at the right, max = 5 — plus an **Elements chip row**,
surfacing sourced data the detail view never displayed anywhere.
Screenshot kept: [screenshots-03/winner-B-labelled-bars.png](../screenshots-03/winner-B-labelled-bars.png).
The prototype (`Prototype03Profile.tsx`, variants A/B/C with a `?variant=` switcher) is deleted;
`SpiritDetail` restored byte-identical; the winner is **specced, not shipped** — built properly
downstream of [#09](09-assemble-the-phase-4-spec.md).

Findings the prototype surfaced:

- The radar's dark-theme bug was two bugs: SVG `<text>` labels with no fill default to black
  (invisible on the dark surface), and the polygon scaled against max **6** when ratings top out
  at 5 — no spirit could ever reach the rim. Moot now, but recorded for honesty.
- The feared "recreate the game panel" scope never existed: the detail view already shows the
  real panel scans and starting-card images below the profile block. The replace question was
  only ever about the OCFDU block itself.
- **Second consumer decided (owner's call): the Recommender's per-row 80px radar is dropped
  entirely, not miniaturised** — an unreadable 5-axis thumbnail was decoration; the full profile
  is one click away in the detail. `OcfduRadar.tsx` is deleted outright at build time.

For [#09](09-assemble-the-phase-4-spec.md): spec = bars block in `SpiritDetail` (full words,
value figures, elements chips, estimate note unchanged), `OcfduRadar` deleted, Recommender rows
lose the thumbnail.
