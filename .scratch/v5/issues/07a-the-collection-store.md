# 07a — The collection store, and the tier list respects it

Status: needs-triage
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

Note #06 may have decided aspects are gated independently of their spirit (an aspect ships in a different
box than its spirit). A configuration is spirit-plus-aspect, so if that's the call, the filter operates on
configurations and not just spirits, and the two can disagree.

## Acceptance criteria

- [ ] An untouched collection narrows **nothing, anywhere**. Tested directly.
- [ ] The collection persists across reload and round-trips through backup export/import.
- [ ] The tier board handles spirits outside the collection the way #06 chose.
- [ ] The filter is a pure domain function, unit-tested without rendering React, mirroring
      `complexityStore.test.ts`'s injected-storage approach.
- [ ] The Recommender, Browse and Cards are **untouched** by this ticket — they come next.
- [ ] Verified in a real browser at 375px and desktop.

## Comments
