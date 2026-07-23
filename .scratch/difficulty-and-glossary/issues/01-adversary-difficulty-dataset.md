# 01 — Adversary per-level difficulty dataset

Status: done
Parent: ../PRD.md

## What to build

Add per-level difficulty numbers to the adversary dataset so difficulty can be computed. These are the
**official** difficulty values printed on each adversary panel — transcribe them from each adversary's
Spirit Island Wiki page (one fetch per adversary), the same provenance discipline the dataset's
existing `_note` already follows.

- Add `difficultyByLevel: number[]` (index = level 0–6, so length 7) to each record in
  `src/data/adversaries.json`.
- **Habsburg Mining Expedition**: if its wiki page does not publish per-level difficulty, **omit the
  field entirely** for that record. Do not guess, interpolate, or copy another adversary's curve.
- Update the dataset `_note` with the fetch trail (date, per-adversary source), matching the existing
  transcription note's style.
- Extend `adversaryCanon.test.ts`: pin each present `difficultyByLevel` to its transcribed values and
  assert length 7; a record may legitimately lack the field (Habsburg Mining), but a present one must
  match exactly. The tripwire fails the build on drift.
- Extend the `Adversary` interface in `src/domain/adversaries.ts` with `difficultyByLevel?: number[]`.

Reference values from the 2022 fan chart (cross-check against the wiki, do not trust blindly):
Brandenburg-Prussia 1/2/4/6/7/9/10 · England 1/3/4/6/7/9/11 · Sweden 1/2/3/5/6/7/8 ·
France 2/3/5/7/8/9/10 · Scotland 1/3/4/6/7/8/9 · Russia 1/3/4/6/7/9/11 ·
Habsburg Monarchy 2/3/5/6/8/9/10. Habsburg Mining Expedition: not on the chart — confirm on the wiki.

## Acceptance criteria

- [ ] Each present `difficultyByLevel` has length 7 and matches the adversary's own wiki page.
- [ ] Habsburg Mining Expedition either carries wiki-sourced values or has no `difficultyByLevel` field.
- [ ] `adversaryCanon.test.ts` pins the values and fails on any change.
- [ ] The `_note` records the per-adversary fetch trail.
- [ ] If the wiki is unreachable, STOP and flag — do not fall back to the PDF for any missing value.

## Blocked by

- None. Foundation for 02 and 06.

## Comments

- Implemented 2026-07-23. Fetched each adversary's own Spirit Island Wiki page directly (raw
  wikitext `leveldifficulty0`-`leveldifficulty6` params where present, escalation-table values
  otherwise). All values match the PRD's 2022 fan-chart reference except Scotland L6 (wiki: 10,
  chart: 9 — wiki wins) and Habsburg Mining Expedition, which the chart omits but the wiki
  publishes in full (`[1, 3, 4, 5, 7, 9, 10]`) — included, since it's sourced. `_note` updated
  with the fetch trail; `adversaryCanon.test.ts` pins all values and a length-7 tripwire.
