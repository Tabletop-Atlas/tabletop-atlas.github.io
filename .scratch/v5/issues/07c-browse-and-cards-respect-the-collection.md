# 07c — Browse and Cards respect the collection

Status: done
Type: wayfinder:task (AFK)
Parent: [v5 map](../MAP.md) · Spec: [PRD.md](../PRD.md)

## Blocked by

- [#07a — The collection store, and the tier list respects it](07a-the-collection-store.md)

## What to build

**This ticket may not survive [#06](06-what-i-own.md). Read that first — if #06 decided the collection
gates *play surfaces* (the tier list and the Recommender) but not *browse surfaces*, then close this
ticket as out of scope and add a line to the map's Out of scope section. Do not build it out of momentum
because it was on the map.**

The open question, which is #06's to answer and not this ticket's:

- **Browse** is the easy half. It lists spirits; if you don't own a spirit, hiding it is defensible.
- **Cards is the genuinely doubtful one.** Should the Cards tab hide 200 power cards because you don't own
  Jagged Earth? Browsing an expansion's cards is partly *how a player decides whether to buy it*. A
  collection setting that helps you play but stops you shopping is a worse product than one that doesn't
  exist. The counter-argument is that a player mid-game filtering for "a major with Fire" does not want
  cards from a box that isn't on the table.

If #06 said yes to either surface, the work itself is the easy tail of [#07a](07a-the-collection-store.md):
the store and the pure filter already exist, and this is wiring. It's split out only so that 07a is
demoable without waiting on the surfaces whose answer is least certain.

## Acceptance criteria

**#06 already split this exactly along the ticket's own fault line**: "Browse — respects it
(annotate/hard-filter)"; "Cards tab — does not respect it, at all." So this ticket is half in
scope: Browse gets wired, Cards is untouched, and that untouched-ness is itself the correct,
already-decided outcome — not a thing left for this ticket to re-litigate.

- [x] The surfaces #06 named respect the collection; the surfaces it didn't name are untouched.
      (Browse wired; `CardsTab.tsx` imports nothing from `collectionStore` - confirmed by
      browser verification, no unowned-related class or note appears anywhere on the Archive tab.)
- [x] An untouched collection changes nothing on either surface.
- [x] ~~The collection composes by AND with the existing Cards filters~~ — n/a, Cards is out of
      scope per #06.
- [x] Verified in a real browser at 375px and desktop.

## Comments

Browse gained the same session-only hard-filter checkbox pattern as the tier board and Recommender
("Only show spirits I own"). Off (default, annotate): every spirit still renders, an unowned one
gets `.spirit-tile-unowned` (dimmed) plus a "· not in your collection" note in its meta line -
same treatment #06/#07a established for the tier board. On: `!excluded.has(s.expansion)` composes
by AND with the existing expansion/complexity/tag filters (same `filtered` predicate chain), and
the "N of 68" count reflects it.

Aspects nested inside a spirit tile are gated independently of their base spirit (#06's call), but
a code-review pass flagged that showing every excluded aspect's note unconditionally would double
up confusingly when the spirit itself is already dimmed and noted unowned for the same reason.
Fixed: an aspect only gets its own note when the *spirit* is owned but the *aspect's own*
expansion is independently excluded - the one case where the note is actually new information.
The same pass also found `Browser.tsx` and `SpiritTile.tsx` were each calling
`collectionStore.owns()`/`getExcluded()` per spirit and per aspect (a storage read + JSON.parse
each time) instead of once per render; fixed by reading the excluded set once in `Browser.tsx` and
passing it down as a prop.

Cards (the Archive tab) received no changes at all - confirmed by grep, `CardsTab.tsx` has no
`collectionStore` import, matching #06's explicit "does not respect it, at all" and this ticket's
own framing that browsing a card pool is partly how you decide to buy the expansion.

Browser-verified (Playwright, production build, 375px + desktop) alongside
[#07b](07b-the-recommender-respects-the-collection.md): Browse's checkbox correctly drops the
count from 37 to 27 spirits with Jagged Earth excluded and hard-filtered on; annotate mode shows
10 dimmed/noted tiles; the Archive tab shows Jagged Earth cards completely normally regardless of
the collection setting; no console errors; no horizontal overflow at 375px on any of the three
tabs touched by #07b/#07c.
