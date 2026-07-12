# 05a — Adversaries browse

Status: needs-triage
Type: wayfinder:task (AFK)
Parent: [v5 map](../MAP.md) · Spec: [PRD.md](../PRD.md)

## Blocked by

- [#04 — The tab's new name, and what an adversary or scenario tile shows](04-the-tabs-new-name.md)

## What to build

The 8 adversaries become browsable as a new segment on the card tab, showing whatever #04 decided a
tile shows (panel art alone, or panel art plus the data).

**The whole point of this ticket is that the data already exists.** `src/data/adversaries.json` holds
all 8 with their 0–6 level ranges, transcribed from spiritislandwiki.com one page at a time, guarded by
`adversaryCanon.test.ts`, and already driving the Recommender's adversary picker. The 8 panel images are
already in `images/manifest.json` as `adversary_panel`.

So this is a **join**, not an extraction. There is no new dataset.

**Do not create a second adversary record.** One adversary, one record, used by both the Recommender and
the browser. If the join needs a field the JSON lacks — an image path — add the field to the existing
file; don't fork it, and don't build a parallel `adversary-cards.json` alongside the one that's already
canon-tested. Two adversary datasets will drift, and the tripwire only guards one of them.

Reuse the existing browse machinery: the segmented type switch, the grid/rows toggle, and `CardViewer`
(v4 #10 lifted it out standalone for exactly this). If #04 decided an adversary tile shows *data* and not
just art, that tile is a new component — but everything it can share with the card tile, it shares.

The tab is **not renamed here** — that lands with [#05b](05b-scenarios-and-the-rename.md), so the rename
happens once, when both new segments actually exist, rather than leaving the tab briefly named for content
it doesn't have yet.

## Acceptance criteria

- [ ] An Adversaries segment renders all 8 adversaries, in the shape #04 chose.
- [ ] The data comes from the existing `adversaries.json`. No second adversary dataset exists in the repo.
- [ ] `adversaryCanon.test.ts` still passes, unmodified. This is the proof of the point above.
- [ ] A test asserts the count against `images/manifest.json`'s 8 `adversary_panel` entries, so a missing
      image fails the build rather than rendering a hole in the grid.
- [ ] Enlarging an adversary opens the same `CardViewer` the card segments use.
- [ ] Verified in a real browser at 375px and desktop, against a production build.

## Comments
