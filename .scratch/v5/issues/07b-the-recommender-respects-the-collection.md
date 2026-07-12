# 07b — The Recommender respects the collection

Status: done
Type: wayfinder:task (AFK)
Parent: [v5 map](../MAP.md) · Spec: [PRD.md](../PRD.md)

## Blocked by

- [#07a — The collection store, and the tier list respects it](07a-the-collection-store.md)

## What to build

The Recommender stops recommending spirits you cannot play.

This is split out from [#07a](07a-the-collection-store.md) because it is the **hard** surface, and the
hardness is a single question:

`recommend()` ranks configurations. The collection filter can apply **before** ranking — an unowned
configuration never competes — or **after** — it competes, then is dropped, leaving the surviving
configurations' order and scores untouched. **These produce different results.** Pre-filtering can promote
a configuration that would never otherwise have surfaced; post-filtering can hand back a shorter list than
asked for.

[#06](06-what-i-own.md) decides which. **If #06's answer doesn't settle it, stop and ask — do not pick.**
Silently choosing one is how the app starts giving different advice than the owner thinks it gives, and
nothing in the test suite would catch it.

The related question #06 should also have settled: **does the user get told** when the collection changed
the answer? "The best spirit for you is in Jagged Earth, which you don't own" is information; silently
recommending the second-best is a different product. Implement whichever #06 chose.

`noteRelevance` and `playerCount` are unrelated to this and stay as they are — [#01](01-the-four-broken-controls.md)
already established that the Recommender's player count earns its place.

## Acceptance criteria

- [x] With a collection set, every configuration in the ranking is one the user owns.
- [x] The ranking is computed pre- or post-filter exactly as #06 specified, and a test pins which — the
      test should fail if someone later flips it.
- [x] The user is (or isn't) told that the collection narrowed the answer, per #06.
- [x] An untouched collection produces a ranking **identical** to today's. Tested — this is the regression
      that would otherwise go unnoticed.
- [x] Verified in a real browser at 375px and desktop.

## Comments

**#06 didn't fully settle pre- vs. post-filter explicitly for this ticket** (it named which
surfaces respect the collection, not the ranking mechanics), so per this ticket's own instruction
("if #06's answer doesn't settle it, stop and ask") the owner was asked directly: pre-filter the
candidate pool before `recommend()` runs, matching #07a's tier board (`filterOwnedConfigurations`
applied to the raw configuration list before anything downstream sees it). Confirmed.

`useRanking()` in `Recommender.tsx` now takes a session-only `hardFilter` toggle
("Only recommend spirits I own" checkbox, same UX as the tier board's). Off (default): candidates
untouched, ranking identical to before this ticket - unowned results can still surface, each
annotated with a "· not in your collection" note and dimmed (`.deck-row-unowned` /
`.unowned-note`), the "information, not silently hidden" case #06/this ticket both called out. On:
`filterOwnedConfigurations` runs over the full candidate pool *before* `recommend()`, so an unowned
configuration never enters scoring, never occupies a shortlist slot, and score normalization only
ever runs over the owned pool.

`src/domain/__tests__/recommendCollection.test.ts` (new) pins the wiring itself, not just the pure
`collectionStore` functions (already covered by #07a's tests): an untouched collection reproduces
`recommend()`'s unfiltered output byte-for-byte; a hard-filtered unowned expansion never appears in
the ranking; and a third test proves pre-filtering is what's implemented (not post-filtering) by
showing that excluding a strong unowned competitor measurably renormalizes the surviving
candidates' scores - the exact "these produce different results" case the ticket described. That
test fails if the filter is ever moved to run after `recommend()` instead of before.

Browser-verified (Playwright, production build, 375px + desktop) alongside [#07c](07c-browse-and-cards-respect-the-collection.md):
checkbox present, unowned results annotated when off, fully excluded when on, no console errors, no
horizontal overflow.

A code-review pass caught a real gap in the first version of this test: it called
`filterOwnedConfigurations` directly rather than the code path `Recommender.tsx` actually runs, so
it would keep passing even if the wiring itself were later changed to filter after `recommend()`
instead of before. Fixed by extracting `candidatesForRecommender(configs, hardFilter, excluded)`
into `collectionStore.ts` - the literal function `useRanking()` calls - and re-pointing the test at
it, so the test and the component now share one implementation rather than two that could drift.
