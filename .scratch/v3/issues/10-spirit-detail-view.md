# 10 — Spirit detail view (existing data only)

Status: done

## Parent

`.scratch/v3/PRD.md`

## What to build

A spirit tile in Browse becomes clickable, opening a detail view built entirely from data the app
already holds. No new fields, no transcription, no images beyond the art already shipped.

- The spirit's art, name, expansion, complexity and summary.
- Its **OCFDU radar** (`OcfduRadar` already exists), so its shape reads at a glance.
- The `ratingsSource: 'estimate'` marker **surfaced**, so a visitor knows which numbers are printed
  and which nobody has verified.
- Its **aspects**, each with the `delta` text already transcribed on it, and its complexity arrow —
  so a visitor weighs a configuration rather than a bare spirit. An aspect with no `delta` says it
  has not been transcribed rather than showing nothing.
- Its **tier under the active list**, so detail and board agree — including "not rated by this list"
  when `getTier` returns `undefined`.
- Closing returns to the filtered, sorted list exactly as it was. Browsing is not a dead end.

## Acceptance criteria

- [ ] Clicking a spirit tile in Browse opens its detail view
- [ ] The radar renders, and `ratingsSource: 'estimate'` is visibly marked when present
- [ ] Every aspect of the spirit is listed with its `delta` and complexity arrow; an untranscribed
      aspect says so
- [ ] The spirit's tier matches what the tier board shows for it under the active list
- [ ] A spirit unrated by the active list says "not rated by this list", not a letter
- [ ] Closing the detail view restores the previous filter, tag and sort selections
- [ ] `appSmoke.test.tsx` renders the detail view for a spirit, server-side, without throwing

## Blocked by

- #02 (the detail view must be able to say "unrated" from the day it ships)

## Comments

Resolved (existing-data slice only; #12 adds panel/card images once #11 sources them).
`SpiritDetail.tsx` is a modal opened from `SpiritTile` in `Browser`; since `Browser` never
unmounts to open it, closing trivially preserves filter/tag/sort state. Shows art, OCFDU radar,
the `ratingsSource: 'estimate'` marker, every aspect with its `delta`/`complexityDelta` (or
"effect not transcribed yet"), and the spirit's tier under the active list ("not rated by this
list" when `getTier` returns `undefined`). Pinned by two new `appSmoke.test.tsx` cases.
