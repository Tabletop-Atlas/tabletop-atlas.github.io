# 04 — Subtypes in the Archive rows view

Status: ready-for-human
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

- [ ] Blight/fear/event subtypes render in the rows view, colour-coded
- [ ] Blight's uniform "blight" kind label is replaced by its subtype tags
- [ ] A new subtype palette lives in `tagColors.ts`, pinned distinct by `cardChipColors.test.ts`
- [ ] Multi-tag and zero-tag cases render cleanly
- [ ] `?variant=` round run, owner pick recorded, scaffolding deleted, screenshots kept
- [ ] Legible on dark theme at 375px + desktop; test suite green
