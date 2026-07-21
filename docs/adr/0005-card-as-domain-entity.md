# 0005 — The card as a provenance-bound domain entity

Status: accepted
Date: 2026-07-21

## Context

The app modelled spirits, tier lists and adversaries but not the cards a player spends most of an
evening looking at (471: minor/major/unique powers, fear, event, blight). Adding them meant taking
in the repo's highest-fabrication-risk kind of data — card elements, cost, speed, rules text — at
volume. The question was not "what shape" but "how do we add 471 cards without reading a single one
off an image". Decided in the v4 map + PRD; the source research is `.scratch/v4/card-data-source.md`.

## Decision

- **`PowerCard` and `OtherCard` join `Spirit`/`TierList`/`Adversary` in `src/domain/types.ts` as
  discriminated unions on card kind, not one wide interface of optionals.** `PowerCard`
  (minor/major/unique) carries `expansion`, `cost`, `speed`, `elements`, `image`; uniques
  additionally carry `spirit` + `spiritName`. `OtherCard` (fear/event/blight) carries none of
  elements/cost/speed — those cards have none, so `card.elements` on a fear card is a compile
  error, not an empty field. Fear carries `tags` + `impact`; events carry `eventClass` + `valence`;
  blight carries `tags`. (Provenance markers on these per ADR 0003; vocabulary in CONTEXT.md.)
- **Card data comes from a machine-readable source, never a card image.** The source is
  `oberien/spirit-island-card-katalog` (`src/types.ts` + `db.ts`, upstream of the `cards.js` SICK
  serves), read by a committed, re-runnable extraction script — not a model reading images. The
  471 records join `images/manifest.json` by primary card name with zero misses in either
  direction; a unique's spirit comes from the source's `"Unique Power: <Spirit>"` type string,
  never from a filename.
- **Filtering is one pure function — the only new seam.** Card dataset + filter state → matching
  cards, testable with no React, exactly like `recommend()` (ADR 0007). Every filter control is
  closed-vocabulary and derived from the dataset's actual values (no free-text search), so a
  control can never offer a query the data cannot answer. The element multi-select's AND/OR
  semantics are pinned explicitly in the filter test — the one place a plausible-but-wrong
  implementation would pass a lazy test.
- **Card images live under `public/`, resolved from the dataset by rule.** The original archive in
  `images/` stays git-ignored (ADR 0006); Pages serves only `public/`. v3's starting cards are
  reconciled with, not duplicated by, the browsable uniques.
- **Tripwire: `cardCanon.test.ts`** pins the per-type counts (101/78/153/50/65/24) against the
  archive and spot-pins hand-checked fields; `dataIntegrity.test.ts` gains card image-existence
  checks.

## Consequences

- A new card field is added only when a machine-readable source carries it; the discriminated union
  makes "this card kind does not have that" a type-level fact rather than a runtime surprise.
- The Cards tab is a pure filter over audited data — the same testable shape as the recommender.

## Left open, deliberately

**Element-threshold matching and Cards↔spirit cross-links** are deferred (see ADR 0004's "Left
open" and the v4 map's *Not yet specified*). They need the tab shipped before they can be specified.
