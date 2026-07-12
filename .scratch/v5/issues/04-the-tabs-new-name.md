# 04 — The tab's new name, and what an adversary or scenario tile shows

Status: needs-triage
Type: wayfinder:grilling (HITL)
Parent: [v5 map](../MAP.md)

## Blocked by

_(nothing)_

## Question

The Cards tab is about to stop being only about cards. The owner wants adversaries and scenarios
browsable "through the knowledge hub", and chose (2026-07-12) to put them in the **existing tab as
new segments** rather than a separate tab:

> `Powers | Fear | Events | Blight | Adversaries | Scenarios`

Two things to settle.

### 1. What is the tab called now?

"Cards" is wrong once adversary panels and scenario sheets are in it. Whatever it becomes has to fit
the sidebar at 375px (v4 #14's responsive work), and it has to sit alongside the existing nav
alternatives without reading as a synonym for them.

### 2. What does a tile show — and here the two are *not* the same

**Scenarios** are image-only. The archive has 16 fronts, 15 backs, 1 shared component
(`images/manifest.json`). There is no scenario dataset anywhere in this repo, and the v4 card source
(`sick.oberien.de`) doesn't carry one — it's a *card* catalogue. So a scenario is a picture with a
name, and the honest question is whether a front/back pair is one tile that flips or two tiles.

**Adversaries are different, and this is the interesting part.** This repo *already has* adversary
data: `src/data/adversaries.json` — 8 adversaries, difficulty levels 0–6, transcribed from
spiritislandwiki.com one page at a time and guarded by `adversaryCanon.test.ts`. It already drives the
Recommender. So an adversary tile could be:

- **just the panel image**, like every other tile in the tab (consistent, cheap, and the data stays
  where it is), or
- **image + the data we already have** — level range, escalation, what it punishes — which makes the
  Adversaries segment a genuinely different surface from the rest of the tab.

The second is more useful and less consistent. That tension is the grilling. If the answer is "image +
data", the follow-on question is whether the *card* segments should then also surface their rules text
(which the source has, and which [#02](02-what-the-buckets-are.md) is about to make the app read
anyway) — at which point the tab is a **card database**, not a card *gallery*, and that's a bigger
change than the owner asked for. Establish which one he wants before
[#05a](05a-adversaries-browse.md) builds it.

**This ticket gates both build slices.** [#05a](05a-adversaries-browse.md) needs the adversary tile's
shape; [#05b](05b-scenarios-and-the-rename.md) needs the scenario tile's shape *and* the tab's new name.

## What to settle

1. The tab's new name.
2. Scenario tile: front only, front+back flip, or two tiles.
3. Adversary tile: image-only, or image + `adversaries.json`'s existing data.
4. If image+data for adversaries — does the rest of the tab stay a gallery, or does everything grow a
   detail view? (Scope guard: the honest answer may be "not on this map".)
5. Whether the sub-type filter control from [#03](03-the-card-sub-type-classifier.md) has any analogue
   here (filter adversaries by difficulty? scenarios by expansion?), or whether these two segments
   have no filters at all beyond expansion.

## Notes

Use `/grilling`. The manifest's counts are the ground truth for what art actually exists: 8
`adversary_panel`, 16 `scenario_front`, 15 `scenario_back`, 1 `scenario_shared_component`. Note 16
fronts vs. 15 backs — one scenario has no back, and whoever builds [#05b](05b-scenarios-and-the-rename.md)
will hit that. Worth knowing which one before designing the flip.

## Comments
