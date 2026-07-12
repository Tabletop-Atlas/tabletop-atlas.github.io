# 08 — The tag colour scheme

Status: needs-triage
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
