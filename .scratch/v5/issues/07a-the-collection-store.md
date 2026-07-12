# 07a — The collection store, and the tier list respects it

Status: done
Type: wayfinder:task (AFK)
Parent: [v5 map](../MAP.md) · Spec: [PRD.md](../PRD.md)

## Blocked by

- [#06 — What "I own this" filters](06-what-i-own.md)

## What to build

The first vertical slice of the collection: the setting exists, persists, and the tier board honours it.
Demoable on its own — tick off Jagged Earth, watch the tier board stop rating spirits you can't play (in
whatever way #06 chose: hidden, greyed, or their own row).

The store **mirrors `complexityStore`** and does not invent a new pattern: the same injected
`KeyValueStorage`, the same create-function-plus-default-instance shape, the same participation in
`backup.ts`. Adding it to the backup blob is a schema change — follow the existing versioning rather than
bolting a field on.

The filter is a **pure function in the domain layer** taking the collection and a list of
spirits/configurations and returning what's in it. Components hold no filtering logic. This is how
`recommend()`, `configurations`, `filterPowerCards()` and `filterOtherCards()` are already built, and it's
what makes the whole thing testable without React. It composes by **AND** with every existing filter (v4
#03's rule, app-wide).

**The default is "owns everything," and this is the criterion that matters most on the whole map.** A
first-time visitor to a public knowledge base has not filled in a collection form. If an untouched
collection narrows anything, the site is silently broken for every user who is not the owner, and the
owner — whose collection *is* filled in — will never see it. Assert it.

**#06 resolved: aspects are gated independently of their spirit.** The filter operates on
configurations (spirit + aspect), not just spirits — the two can disagree (you can own the base
spirit but not the expansion an aspect shipped in). #06's Comments carry the sourced
aspect → expansion table for all 31 aspects (verified against the wiki, not the asset archive's
incidental filename suffixes, which would mis-tag 2 of them) and the canonical expansion name
per dataset (`spirits.json`/`power-cards.json`/`other-cards.json` don't agree on raw strings -
`Aspect` itself has no `expansion` field yet, so this ticket adds one and populates it from #06's
table).

## Acceptance criteria

- [ ] An untouched collection narrows **nothing, anywhere**. Tested directly.
- [ ] The collection persists across reload and round-trips through backup export/import.
- [ ] The tier board handles spirits outside the collection the way #06 chose.
- [ ] The filter is a pure domain function, unit-tested without rendering React, mirroring
      `complexityStore.test.ts`'s injected-storage approach.
- [ ] The Recommender, Browse and Cards are **untouched** by this ticket — they come next.
- [ ] Verified in a real browser at 375px and desktop.

## Comments

Shipped 2026-07-12. `src/domain/collectionStore.ts` mirrors `complexityStore`: injected storage,
`excluded: ExpansionName[]` as a delta from "owns everything" (absence, not an explicit snapshot),
`isConfigurationOwned`/`filterOwnedConfigurations` as pure domain functions. `Aspect` gained a
required `expansion` field, sourced from #06's wiki-verified table and applied to all 31 aspects
in `spirits.json` via a surgical text substitution (not a full `JSON.stringify` re-serialise,
which would have reformatted the whole file). `backup.ts` bumped to schema v3 with a `collection`
field and a v2→v3 migration (absent → empty array). "My collection" lives on Customise tiers as a
checkbox per canonical expansion. The tier board dims an unowned configuration in its rated row
with a small corner marker (a full-width badge label didn't fit a 116px tile - found and fixed via
browser verification) and offers a session-only "Only show spirits I own" hard-filter toggle.

Two code-review passes (standards + spec) both caught the same real gap before this was
considered done: the hard-filter path (`filterOwnedConfigurations`) existed but had no UI
consumer, making #06's opt-in toggle unreachable. Fixed by wiring the toggle into the tier board
rather than leaving the function as dead code - the spec reviewer correctly read #06's "when
hard-filter is on..." wording as a requirement for this ticket, not deferred scope.
