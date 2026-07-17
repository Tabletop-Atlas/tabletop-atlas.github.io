# 03 — Group by for Fear, Blight, and Event cards

Status: done
Blocked by: None — can start immediately
Parent: ../README.md

## What

The Fear / Events / Blight segments have **no Group by** today — the control only renders for the
Powers segment (`src/components/CardsTab.tsx:109`). Add a Group by for these three segments with
options **None / Expansion / Subtype** (owner request, 2026-07-17).

- **Expansion** — group by `OtherCard.expansion` (single-valued).
- **Subtype** — the segment's own classification:
  - **Fear** → `tags: FearTag[]` (multi-valued)
  - **Blight** → `tags: BlightTag[]` (multi-valued) — see the judgment note below
  - **Events** → `eventClass: EventClass` (single-valued)

## Where

- **New domain fn** — add `groupOtherCards(cards, group)` returning `{ label, cards }[]` (same shape
  as `PowerCardGroup`). Prefer a **sibling module** `src/domain/otherCardArrange.ts` so
  `powerCardArrange.ts` stays power-only; export an `OtherGroup` union
  (`'none' | 'expansion' | 'subtype'`).
- `src/components/CardsTab.tsx` — add an `otherGroup` state (reset to `'none'` in `selectSegment`),
  render a Group by `<select>` when `isOtherSegment(segment)`, and add a grouped render branch
  analogous to the Powers one at `CardsTab.tsx:180` — map over the groups, rendering
  `CardGrid` in grid view and `OtherCardRows` in rows view (both already accept `OtherCard[]`).

## Semantics (mirror `groupPowerCards` EXACTLY)

- **Multi-valued grouping = the `element` pattern** (`powerCardArrange.ts:31-36`): a fear/blight card
  appears in EVERY group whose tag it carries; a card with zero tags lands in a trailing
  **"Unclassified"** group (the analogue of element's trailing "No element").
- **Fixed canonical group order, empty groups omitted** — use the declared array order from
  `src/domain/types.ts`: `FEAR_TAGS`, `BLIGHT_TAGS`, `EVENT_CLASSES`. Use `subtypeLabel()`
  (`tagColors.ts`) for human labels. Expansion grouping uses canonical `EXPANSIONS` order (as in
  issue 02).

## ⚠ Blight is judgment data — carry the provenance

`BlightTag[]` is `tagsSource: 'judgment'` (`src/domain/types.ts`), derived by `classifyBlight()`.
When grouping **Blight by Subtype**, the group headers must carry the same "(judgment)" note the
rows/filters already show (`OtherCardRows`'s row-level note, `OtherCardFilters`'s section header) —
**never** present a judgment subtype as canon by putting a bare label on the header. Fear tags and
event class are not judgment; no note needed for those.

## Tests

New test file (or extend an existing domain test) mirroring `powerCardArrange.test.ts`: fixtures per
segment; assert multi-value membership (one card landing in two groups), the trailing "Unclassified"
group, canonical order, and empty-group omission. Assert the blight-judgment note is present on
blight-by-subtype headers.

## Acceptance criteria

- [x] Fear / Events / Blight each show a "Group by" control with **None / Expansion / Subtype**, and
      the choice resets when the segment switches.
- [x] Expansion grouping uses canonical order and works in both grid and rows views.
- [x] Subtype grouping resolves per kind: fear → fear tags, blight → blight tags (both
      multi-valued), event → event class (single-valued).
- [x] Multi-valued: a card carrying two tags appears in both groups; zero-tag cards fall into a
      trailing **"Unclassified"** group; canonical order; empty groups omitted.
- [x] Blight subtype group headers carry the **"(judgment)"** provenance note; fear/event carry none.
- [x] A new `groupOtherCards` function and a new `otherCardArrange` test cover multi-value
      membership, Unclassified, canonical order, expansion, and the blight judgment note.
- [x] `tsc -b`, `oxlint`, and the suite are clean; verified in the running app at desktop + 375px.

## Comments

- Implemented 2026-07-17: new sibling module `src/domain/otherCardArrange.ts` exports
  `groupOtherCards`/`OtherGroup`, mirroring `powerCardArrange.ts`'s single-pass Map-based
  `expansion` grouping (the pattern ticket 02's code review settled on) and the `element`
  multi-valued pattern for `subtype`. `subtype`'s canonical order/judgment-note/Unclassified
  status is derived from `cards[0]?.kind` (fear/blight/event never mix in one call, since the
  Cards tab's segmented switch already isolates one kind — same assumption `groupPowerCards`
  makes about its input). Blight headers get a `(judgment)` suffix (including on its
  "Unclassified (judgment)" group); fear/event carry none. `CardsTab.tsx` gained `otherGroup`
  state (reset in `selectSegment`), a Group by control alongside the existing filters for the
  Fear/Events/Blight segments, and a grouped render branch reusing `CardGrid`/`OtherCardRows`.
  One judgment call: `otherCardArrange.ts` imports `subtypeLabel` from
  `components/tagColors.ts` per the ticket's explicit instruction, which is a domain→components
  import direction with no existing precedent in this codebase (checked: no other `src/domain/*`
  file imports from `components/`) — flagging for the owner in case label ownership should move
  domain-ward later; no circular import results since `tagColors.ts` only imports `domain/types.ts`.
  Code review (Standards + Spec sub-agents): Spec review found zero gaps and confirmed the
  `subtypeLabel` import is correctly-handled spec compliance, not a defect — the ticket named
  `tagColors.ts` explicitly, and duplicating `SUBTYPE_LABEL` into the domain layer would break that
  file's own "one label source... across all three buckets" invariant, so the import was kept as
  instructed. Standards review's other finding — the `cards[0]?.kind` homogeneity assumption is
  implicit, not type-enforced — got a one-line precondition comment added to the code (cheap,
  no behavior change); it's the same assumption `groupPowerCards` already makes about its input,
  so left unenforced rather than added a runtime assertion nothing else in the file has.
  `otherCardArrange.test.ts` added: 9 tests (fear/blight/event subtype grouping, multi-value
  membership, Unclassified with/without the judgment note, canonical order, empty-group
  omission, expansion grouping with canonical + raw fallback). Full suite 412/412, `tsc -b` and
  `oxlint` clean. Verified live via Playwright at desktop width across all three segments, both
  grid and rows views, plus segment-switch group-by reset, and at 375px (Blight/subtype) — no
  console errors, no layout breakage at either width.
