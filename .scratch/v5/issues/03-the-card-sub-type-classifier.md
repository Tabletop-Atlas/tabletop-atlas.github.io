# 03 — The card sub-type classifier

Status: needs-triage
Type: wayfinder:task (AFK)
Parent: [v5 map](../MAP.md)

## Blocked by

- [#02 — What the fear / event / blight buckets are](02-what-the-buckets-are.md)

## What to build

Implement #02's taxonomy verbatim. Two halves: the data, then the control.

### The data

Extend `scripts/extract-other-cards.mjs` (or add a sibling script — whichever keeps the extraction
re-runnable in one command) so each of the 139 fear/event/blight cards carries its sub-type.

**The mechanism is settled and is not up for reinterpretation** (owner, 2026-07-12): a table of
hand-written keyword/regex rules matched against the card's **real rules text** from the source. No
model reads a card. No model reads an image. Every card's tag traces back to a phrase that literally
appears in its text, and the script can print that trace.

```js
// shape, not the answer — #02 decides the actual buckets and rules
const FEAR_RULES = [
  { tag: 'defense', match: /\bDefend\b|\bprevent\b/i },
  { tag: 'removal', match: /Remove .*(Explorer|Town|City)/i },
]
```

Two things follow from this and must be honoured:

- **The rule set is judgment.** It is a human's reading of what a phrase implies, not a fact stated by
  the source. Mark it the way this repo already marks `shiftsToward` and `ratingsSource` — the field
  says, in the data, that it was derived by rule and not read off the card. Whoever reads
  `other-cards.json` in a year must not mistake it for source data.
- **Events likely need no rules at all.** v4 #01 found the five event classes (`ChoiceEventCard`,
  `StageEventCard`, `TerrorLevelEventCard`, `HealthyBlightedLandEventCard`, `AdversaryEvent`) already
  encode the healthy/blighted and terror-level distinction the owner asked for. If #02 confirms it,
  carry the class through — that's source data, not judgment, and it should be typed and marked
  differently from the keyword-derived tags.

A **tripwire test** ships with it, as every dataset in this repo does (`aspectCanon.test.ts`,
`cardCanon.test.ts`): re-running the classifier over the committed text must reproduce the committed
tags exactly. A rule edited by accident fails the build.

### The control

The Fear / Events / Blight filter panel gains a sub-type control — the one it should have had instead
of the redundant "Type" row that [#01](01-the-four-broken-controls.md) deletes.

`OtherCardFilterState` is currently *deliberately* narrow — v4 #13 made it structurally impossible to
offer a control for a field these cards lack, and that property is the point. Adding sub-type must
preserve it: the state gains a field only for a filter the data can actually honour, and the three
segments must not share one control if their bucket sets differ (a fear bucket is not a blight
bucket). If #02's answer is three disjoint taxonomies, the type system should say so.

Filtering stays a **pure function in the domain layer** (`filterOtherCards`), composing by **AND**
with the existing controls — v4 #03's rule, which holds across the whole app.

## Acceptance criteria

- Every fear/event/blight card's sub-type is reproducible by re-running one committed command, with no
  network dependency beyond the source `cards.js` the existing scripts already fetch.
- The script can print, for any card, the phrase that triggered its tag. Spot-check ~10 by hand against
  the card images in `images/` before committing.
- Cards no rule matches end up in whatever state #02 chose (no tag / "Other") — **never** forced into
  the nearest bucket.
- A tripwire test fails if the committed tags and the classifier's output diverge.
- The filter control appears only on the segments whose cards actually carry sub-types, composes by AND
  with expansion, and the match count is live.
- Verified in a real browser at 375px and desktop.

## Comments
