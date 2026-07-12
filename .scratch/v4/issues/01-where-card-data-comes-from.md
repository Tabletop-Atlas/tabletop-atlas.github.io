# 01 — Where card data comes from

Status: done
Type: wayfinder:research (AFK)
Parent: [v4 map](../MAP.md)

## Question

The archive has 471 card **images** and no card **data**. Filtering by element, cost, speed, type or
expansion is impossible until a machine-readable source for those fields exists. Where does it come
from, and which fields can each card type actually supply?

## What is already known

`https://sick.oberien.de/cards.js` is a 276 KB compiled-TypeScript bundle that defines `PowerCard`,
`FearCard`, `ChoiceEventCard`, `StageEventCard`, `TerrorLevelEventCard`,
`HealthyBlightedLandEventCard` and `AdversaryEvent` classes and constructs the whole catalogue from
them. SICK is the same site the 471 images were mirrored from (`source_site: sick.oberien.de` on 471
of the 616 manifest rows), so its names already line up with `images/manifest.json`.

## What this ticket produces

A markdown summary at `.scratch/v4/card-data-source.md` answering:

1. **The source.** Is `cards.js` the whole catalogue, and is there anything upstream of it (an
   oberien repo with the data as JSON/TS before compilation)? Prefer the most upstream form.
2. **The field inventory, per card type.** For power cards: elements, cost, speed, range, target,
   type (minor/major/unique), expansion, spirit (for uniques), card text. For fear/event/blight:
   whatever they actually carry. **List the fields that exist. Do not list fields that ought to
   exist.**
3. **The join.** Does every one of the 471 mirrored images match exactly one card in the source, by
   name? Report the misses in both directions — a card with no image, an image with no card. Do not
   guess a match.
4. **Which of the owner's filters are sourceable and which are not.** He named: elements, cost,
   quick/slow, major/minor, expansion. If any of those is not in the source, say so plainly — that
   filter then does not ship, rather than shipping fabricated.
5. **Licensing/attribution of the *data*.** The image-hosting risk is already accepted and settled;
   this is a separate, one-line note on what SICK says about reuse, if anything. Report it, do not
   litigate it.

Nothing is written into `src/data/` by this ticket — that's [#02](02-land-the-card-dataset.md).

## Comments

Answered in full at [`card-data-source.md`](../card-data-source.md). Headline findings:

- **Upstream form found**: `github.com/oberien/spirit-island-card-katalog` — `src/types.ts` +
  `src/db.ts`, the pre-compiled TypeScript `cards.js` is built from. Both carry the
  `// This file contains material owned by Greater Than Games, LLC.` header.
- **`DB.CARDS`** (loaded from the compiled `cards.js` in a sandboxed Node `vm`, not hand-parsed) is
  471 entries: 332 power (101 minor / 78 major / 153 unique) + 50 fear + 65 event (18 choice + 9
  stage + 12 terror-level + 25 healthy/blighted + 1 adversary-wrapped) + 24 blight. Matches the
  manifest and PRD counts exactly.
- **Join is perfect** (471/471, 0 misses either direction) once event/blighted-land cards are keyed
  by their *primary* name — SICK's own image-naming convention (`name[0]` for multi-name cards). A
  naive full-name join produces 45 false misses; noted in the doc so it isn't rediscovered.
- **Every filter the owner named is sourceable**: elements, cost, speed and major/minor only exist
  on `PowerCard` (332 of 471) — fear/event/blight have none of them, which is a real constraint for
  #03's filter-bar-vs-segmented-switch decision, not a gap in the data. Expansion (`set`) exists on
  all 471. A unique's spirit isn't a dedicated field — it's the substring after `"Unique Power: "`
  in the `type` enum value, which `manifest.json`'s `spirit` field already resolves for all 153.
- **Licensing**: no separate data-reuse grant found; card data sits under the same "all materials
  belong to Greater Than Games, LLC" statement the images already do. Rights are already accepted
  and settled (2026-07-09) — not reopened.

Ready for #11 (power cards end-to-end) and #13 (fear/event/blight) to build the dataset from this.
