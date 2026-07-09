# 05 — A list shows its citation

Status: done

## Parent

`.scratch/v3/PRD.md`

## What to build

Today a visitor sees seven lettered rows and no author, no date, no methodology, and no way to tell
a strength read from a taste read. The tier list is one anonymous opinion.

A metadata panel above the board surfaces what the entity already carries:

- **Author** and a link to the **source**, so a visitor can go watch or read the original.
- **Type** — strength or fun — so nobody mistakes someone's taste for a power ranking.
- **Player count** the source ranked *for*, so a solo ranking is not applied to a four-player table.
  A list with no `players` says the source never stated one, rather than showing nothing.
- **Published date**, so a visitor can discount a ranking made before an expansion changed the meta.
- **Methodology**, in the author's own framing: what it covers and what it excludes.
- **Coverage**, rated N of 68 (shares the count from #02 — one source of truth).
- An **unverified badge** when `verified: false`, so a machine-scraped ranking is treated with the
  suspicion it deserves.

A `personal` list has no `source`; the panel shows its author as the owner and omits the link rather
than rendering an empty one.

## Acceptance criteria

- [ ] Author, type, player count, published date and methodology all render for a cited list
- [ ] The source URL is a real link, opening the original
- [ ] A list with no `players` says the source never stated one
- [ ] A list with `verified: false` shows a visible unverified badge; `true` shows none
- [ ] A personal list renders without a source section and without empty fields
- [ ] Coverage reads rated-N-of-68 and agrees with the board's Unrated bucket
- [ ] `appSmoke.test.tsx` still boots with a list selected

## Blocked by

- #04 (there is no "the list you are looking at" until a list can be selected)

## Comments

Resolved. `TierListCitation` (inside `TierListControls.tsx`) renders author/source link, type,
player count (or "player count not stated"), published date, methodology, the unverified badge,
and rated-N-of-68 sourced from the same `tierStore.getAll()` the board's Unrated bucket uses, so
they cannot disagree. A `personal` list shows "By you" and no source link.
