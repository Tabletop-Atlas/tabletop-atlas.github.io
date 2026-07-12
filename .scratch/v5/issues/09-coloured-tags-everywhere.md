# 09 — Coloured tags, everywhere they belong

Status: needs-triage
Type: wayfinder:task (AFK)
Parent: [v5 map](../MAP.md)

## Blocked by

- [#08 — The tag colour scheme](08-the-tag-colour-scheme.md)

## What to build

Ship #08's winning scheme. The prototype code is the starting point — v4 #04 set the precedent of
keeping the prototype rather than deleting it and rewriting from scratch.

Scope: the surfaces #08's grilling named. At minimum `SpiritTile.tsx` (which today renders
`{spirit.expansion} · {spirit.complexity}` as bare text and drops `spirit.tags` entirely), and whatever
#08 established about the dropdown — including, if that's where it landed, the finding that a native
`<select>` cannot hold a coloured chip and something has to give.

One rule the tag component has to hold: **a tag whose colour isn't in the scheme still renders.**
`spirits.json`'s `tags` is an open set — someone will add `"summon-heavy"` next month and it must come
out as a legible neutral chip, not an unstyled span or a crash. The scheme is a lookup with a default,
not an exhaustive map.

Accessibility is not negotiable here (it's the one thing the whole ticket is *for* — the tags are
currently hard to spot): the chips need contrast that actually passes against both the tile background
and the modal background, and colour must not be the **only** channel carrying the meaning — the tag's
text is right there, so this is nearly free, but don't ship a scheme where two tags are distinguishable
only by hue for a colour-blind reader.

## Acceptance criteria

- Every spirit's `tags` render under its name on the Browse tile, alongside expansion and complexity,
  coloured per #08's scheme.
- The worst cases don't break the tile: longest spirit name, most tags, at 375px.
- An unknown tag renders as a neutral chip.
- Contrast checked against both backgrounds; meaning survives greyscale.
- No collision with `tierColors.ts` — a spirit chip is not mistakable for a tier badge.
- Verified in a real browser at 375px and desktop.

## Comments
