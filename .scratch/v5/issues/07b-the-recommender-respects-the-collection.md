# 07b — The Recommender respects the collection

Status: needs-triage
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

- [ ] With a collection set, every configuration in the ranking is one the user owns.
- [ ] The ranking is computed pre- or post-filter exactly as #06 specified, and a test pins which — the
      test should fail if someone later flips it.
- [ ] The user is (or isn't) told that the collection narrowed the answer, per #06.
- [ ] An untouched collection produces a ranking **identical** to today's. Tested — this is the regression
      that would otherwise go unnoticed.
- [ ] Verified in a real browser at 375px and desktop.

## Comments
