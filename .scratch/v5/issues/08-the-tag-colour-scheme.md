# 08 — The tag colour scheme

Status: done
Type: wayfinder:prototype (HITL)
Parent: [v5 map](../MAP.md)

## Blocked by

_(nothing)_

## Question

Spirits carry tags and they're invisible. The owner (2026-07-12):

> The tags that we have in the browse tab for the spirits with the Base, Moderate, Nature and so on —
> I think it would be nice if we had some colouring to it, as they're a bit hard to spot. We should
> ideally have some colour scheme for that too, so it's also visible in the dropdown. I like the tags
> that you've introduced — those could also be added. I mean the aggressive, blight-positive and so on.
> It would be great if those are also visible under the spirit name, as we have it for now for
> [expansion] and Moderate.

Two changes tangled together:

1. **Colour** the tags that already render.
2. **Show more of them.** `SpiritTile.tsx:20` renders exactly `{spirit.expansion} · {spirit.complexity}`
   as plain text. But `spirits.json` carries a `tags` array — `["fast-tempo", "aggressive"]` on
   Lightning's Swift Strike — that renders **nowhere on the tile**. The owner wants those under the
   name too.

This is a "show me", not a "tell me". **Build the prototype, don't write a spec.**

## What the prototype answers

- What the colour is keyed to. Three axes are in play and they are not the same kind of thing:
  **expansion** (categorical, 7 values), **complexity** (ordinal — Low → High, so a ramp, not hues),
  and **playstyle tags** (categorical, open-ish set: aggressive, fast-tempo, blight-positive, …). A
  scheme that treats all three identically will read as noise.
- How many tags fit under a name before the tile breaks — some spirits will have four or five, and
  names like *"Shifting Memory of Ages"* are long. **Check at 375px**, not just desktop. v4 #07/#14
  already found the tile and modal are the tight spots.
- "Also visible in the dropdown" — find out **which dropdown** he means (the Browse tab's filter? the
  tier list's list picker?) and whether coloured chips even work in a native `<select>`. They largely
  don't — a native option can't hold a styled span. If that's the ask, the honest answer may be
  "the dropdown has to stop being a native select", which is a real cost and should be surfaced now,
  not discovered in the build.
- Whether tags become **filter controls** on Browse (click "aggressive" → see all aggressive spirits)
  or stay decorative. The owner didn't ask for this. Don't build it — but if the prototype makes it
  obvious, say so and let him decide.

## Notes

Use `/prototype`. Put two or three schemes on screen side by side, with real spirits — including the
worst cases (longest name, most tags) — at 375px and desktop. Screenshot into
`.scratch/v5/screenshots-08/` the way v4 #04 and #07 did. The owner judges the pictures; the winner
becomes [#09](09-coloured-tags-everywhere.md)'s spec.

There is an existing colour decision to not contradict: `src/components/tierColors.ts` holds the tier
palette, sampled from the owner's TierMaker board. Whatever this scheme is, it must not collide with
it — a spirit chip that looks like a tier badge is worse than a grey chip.

## Comments

Resolved via `/prototype`, four rounds of owner review against real spirit data at 375px and
desktop (screenshots in `.scratch/v5/screenshots-08/`, variants A through H). **The winner is
variant H**, now folded into `src/components/SpiritTile.tsx` with its palette in the new
`src/components/tagColors.ts`:

- **Expansion** gets a left-edge stripe on the tile *and* a solid pill chip on its own line
  (same colour in both places, verified byte-identical) — the two reinforce one signal rather
  than reading as two.
- **Complexity** is not a colour at all — it's ordinal, so it's a 4-dot meter (●●○○) with the
  complexity word as text next to it, the same "dots + word" idiom Claude Code's own effort-level
  picker uses. Round 1 tried colouring it (ramp/rainbow); dropped once the dots-plus-word version
  landed.
- **Playstyle tags** get their own outlined chips (coloured border + coloured text, transparent
  fill) on a separate line below the expansion chip - never sharing a row or a visual style with
  expansion, so "provenance" and "playstyle fact" read as two different kinds of information.

**What round 1 got wrong, caught by the owner, not by review:** the first tag palette was an
8-colour hash for 11 known tags, which guaranteed collisions - `token-heavy` and
`blight-sensitive` rendered as the identical green. Fixed with an explicit, collision-free colour
per known tag (hash only as a fallback for a future unmapped one). A colour scheme where two
different things read as the same colour is worse than no colour scheme; this is the same
"the field must be honest" discipline this repo already applies to data, applied here to a
palette instead.

**Answers to the prototype's other questions:**
- *"Also visible in the dropdown"* — **not built.** A native `<select>` can't hold a styled chip;
  replacing the dropdown with a custom listbox is a real, separate cost that was surfaced but
  never asked for outright. Still open if the owner wants to pursue it - a new ticket, not part of
  #08/#09.
- *Tags as filter controls* — **not built**, as instructed. The tag chip is inert (no `onClick`).
- *Collision with `tierColors.ts`* — checked: the two palettes are separated by lightness/
  saturation (tier = light pastel, tags/expansion = darker and more saturated), not by hue alone;
  a couple of tag hues land near a tier hue in raw hue-angle terms but read distinctly on this
  app's dark background. Documented in `tagColors.ts`'s own comment, including a note to re-check
  if either palette is ever brightened independently.

The throwaway prototype (`src/prototypes/v5-tag-colors/`, `prototype-v5-tag-colors.html`) is
deleted now that the winner is folded in; the screenshots stay as the historical record, same as
v4 #04/#07's prototypes. Browser-verified (Playwright, production build, 375px + desktop): stripe/
chip colour match confirmed via computed styles, dots/label/tags all render correctly, #07c's
collection annotation (dimming + "not in your collection") still works unchanged, no console
errors, no horizontal overflow.

A code-review pass (standards + spec) found no structural drift from the approved screenshots and
no scope creep; one real, minor finding (the `tierColors.ts` comment overstated "no shared hues"
when the actual separation is lightness/saturation) - fixed by correcting the comment's wording.

[#09](09-coloured-tags-everywhere.md) is unblocked - this ticket **was** #09's spec-setting
half for the Browse tile; #09's remaining scope is wherever else in the app tags/expansion/
complexity render undecorated (the ticket itself should say where).
