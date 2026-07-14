# 04 — Subtypes in the Archive rows view

Status: needs-info
Label: wayfinder:prototype (HITL — owner picks the look)
Parent: [Legibility-pass map](../MAP.md)

## Blocked by

_(nothing — blight/fear/event subtypes already exist in the data)_

## Question

The Archive rows view hides subtypes that already exist in the data and are only used as filters.
Surface them, colour-coded, in `OtherCardRows.tsx` (`src/components/OtherCardRows.tsx:16-21`):

- **Blight** — `tags: BlightTag[]` (`presenceLoss`/`boardChange`/`damageBonus`/`resourceSwing`,
  `tagsSource: 'judgment'`). The owner's specific ask: **replace the redundant "blight" kind label**
  (uniform across every blight card, so it carries no information) **with the subtype tags**.
- **Fear** — `tags: FearTag[]` (`removal`/`defensive`/`weaken`/`disruption`/`displacement`).
- **Events** — `eventClass` (`choice`/`stage`/`terrorLevel`/`healthyBlightedLand`/`adversary`).

**How should the subtype render** — a coloured pill (the `CARD_KIND_COLOR` filled-pill idiom already
in `CardRows`), tinted text, or a small tag? This needs a **new subtype colour palette** in
`tagColors.ts`, pinned pairwise-distinct by `cardChipColors.test.ts` against every existing palette
(expansion, tag, kind/speed, scenario-band, panel). Run a `?variant=` round; the **owner picks**.

Notes:
- Blight tags are `tagsSource: 'judgment'` — presentation of judgment data is fine, but don't dress
  it as canon; carry the provenance the way the filter label does ("Sub-type (judgment)").
- A card may carry **multiple** tags (blight/fear) — the treatment must handle 0, 1, or several.
- Adversary subtype is deliberately **not** in this ticket — it waits on
  [03](03-adversary-subtype-canon.md) (the data may not exist).

## Acceptance criteria

- [x] Blight/fear/event subtypes render in the rows view, colour-coded
- [x] Blight's uniform "blight" kind label is replaced by its subtype tags
- [x] A new subtype palette lives in `tagColors.ts`, pinned distinct by `cardChipColors.test.ts`
- [x] Multi-tag and zero-tag cases render cleanly
- [ ] `?variant=` round run, owner pick recorded, scaffolding deleted, screenshots kept
- [x] Legible on dark theme at 375px + desktop; test suite green

## Comments

**Round live (2026-07-14) — OWNER PICK NEEDED, question at the end.**

The mechanical part ships regardless of the pick: `OtherCardRows` now shows every card's subtype —
fear/blight tags (0..n) or the event's single class — sourced from the new `SUBTYPE_COLOR`/
`subtypeLabel` in `tagColors.ts` (14 values: 5 fear + 4 blight + 5 event, pinned pairwise-distinct
from each other and from every other chip/band/panel/tier palette by `cardChipColors.test.ts`).
Blight's uniform "blight" kind label — the owner's specific ask — is gone, replaced by its tags; a
one-time "judgment" note carries `tagsSource: 'judgment'`'s provenance per row rather than
repeating it on every chip. Fear/event rows keep their kind label and gain the badge alongside it.
Zero-tag cards ("Unclassified") and multi-tag cards (2-3 blight/fear tags on one row) both render
cleanly — see `Invaders find the Land to their Liking` (blight, 0 tags) and `Untended Land Crumbles`
(blight, 3 tags) in the screenshots. `OtherCardFilters.tsx`'s three local label maps were replaced
with the one shared `subtypeLabel()` — no more duplicate label source.

**What's gated behind the round:** only the chip's render treatment (`SubtypeVariantRound.tsx`,
`?subtypeVariant=A|B|C`). Without the param, subtypes still show — as plain comma-joined text, the
same "mechanical ships, treatment is picked" split ticket 05 used for its expansion column.

- **A — filled pill:** the `CardRows` kind/speed idiom (solid background, white text).
- **B — tinted text:** no fill, colour carried by the text itself.
- **C — outlined tag:** the `SpiritTile` playstyle-tag idiom (border + colour text, transparent).

Screenshots (baseline + A/B/C, Blight/Fear/Events segments, at 375px + 1280px) in
[`../screenshots-04/`](../screenshots-04/).

## The pick (owner)

Which treatment ships — **A** (filled pill), **B** (tinted text), or **C** (outlined tag)? Any
reaction goes here. **This ticket does not self-close — it waits for your pick.**
