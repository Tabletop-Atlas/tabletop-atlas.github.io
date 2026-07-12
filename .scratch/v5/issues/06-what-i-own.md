# 06 — What "I own this" filters

Status: needs-triage
Type: wayfinder:grilling (HITL)
Parent: [v5 map](../MAP.md)

## Blocked by

_(nothing)_

## Question

The app assumes you own every expansion. The owner asked for an expansion filter **on the tier list**:

> Potentially add a filter in the tier list for what expansions the player has. Right now we always
> assume all of them are available, but maybe we could go with the mindset of not all expansions are
> available.

The charting call (2026-07-12) was to build this as **one app-wide "my collection" setting**, not a
tier-list-local control — because the same filter would otherwise be re-invented on Browse, the
Recommender, and the Cards tab within a month, four times, four ways. That's settled. What the setting
*does* is not.

## What to settle

1. **Granularity.** Expansion-level (Base, Branch & Claw, Jagged Earth, Horizons, Nature Incarnate,
   Promo, Promo 2) — or something finer? Note the data already carries `expansion` on every spirit and
   every one of the 471 cards (v4 #01), so expansion-level is nearly free and anything finer is not.
   Also: **Promo/Promo2 are not expansions you buy.** Decide whether they're a checkbox at all.
2. **Hard filter or annotation?** Does a spirit you don't own *disappear* from Browse and the
   Recommender, or does it show, greyed, marked "not in your collection"? These are very different
   products. The Recommender case is the sharp one: recommending a spirit the user cannot play is
   useless — but *hiding* it means the app silently narrows its answer, and the user may want to know
   "the best spirit for you is in Jagged Earth, which you don't have."
3. **Which surfaces respect it.** Browse, Recommender candidates, Tier list, Cards tab. Cards is the
   least obvious — do you want the Cards tab to hide 200 power cards because you don't own Jagged
   Earth, when browsing cards is partly *how you decide whether to buy it*?
4. **The tier list's specific case.** A tier list rates spirits from expansions you don't own. Are they
   hidden from the board, greyed in place, or moved to their own row? (This is currently in the map's
   fog; it graduates or resolves here.)
5. **Aspects.** Aspects ship with expansions too, and a configuration is spirit-plus-aspect. Does the
   collection gate aspects independently of their spirit?
6. **Persistence and default.** The default must be "you own everything" — a new visitor to a public
   knowledge base has not filled in a collection form and must not see a crippled app. Where the
   setting lives (there's already `complexityStore` / `answersStore` / `tierStore` and a `backup.ts` —
   follow the existing pattern, don't invent a new one) and whether it's part of the backup blob.

## Notes

Use `/grilling` and `/domain-modeling` — "collection" is a new domain concept and it wants a name and a
definition, not just a checkbox array. Read `src/domain/backup.ts` and the existing stores first so the
answer fits the persistence pattern that's already there.

Scope guard: the owner asked for a tier-list filter. If the grilling reveals the app-wide version is a
much bigger animal than it looks, it is legitimate to come back with "ship the tier list's, and here is
why app-wide is a separate effort" — but say so explicitly, don't drift there by accident.

## Comments
