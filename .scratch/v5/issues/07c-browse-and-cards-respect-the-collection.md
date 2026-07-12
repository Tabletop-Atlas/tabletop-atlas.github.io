# 07c — Browse and Cards respect the collection

Status: needs-triage
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

If #06 kept this in scope:

- [ ] The surfaces #06 named respect the collection; the surfaces it didn't name are untouched.
- [ ] An untouched collection changes nothing on either surface.
- [ ] The collection composes by AND with the existing Cards filters (elements, cost, speed, kind,
      expansion, sub-type), and the live match count reflects it.
- [ ] Verified in a real browser at 375px and desktop.

If #06 ruled it out:

- [ ] The ticket is closed, the map's Out of scope section records the gist and why, and nothing was built.

## Comments
