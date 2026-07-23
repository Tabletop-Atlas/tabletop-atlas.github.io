# 03 — Inline glossary

Status: done
Parent: ../PRD.md

## What to build

Let a user look up a domain term where it appears. Defined terms render with a subtle dotted-underline
affordance and reveal a plain-language definition in a popover on hover, click/tap, and focus (must
work on touch and keyboard, not hover-only). Wire it into the Fear and Event views first.

- One central keyed glossary map: `id -> { text, source }`, `source` ∈ `'context' | 'owner' | 'wiki'`.
- Populate only entries that restate existing `CONTEXT.md`/data definitions (`source: 'context'`):
  impact weak/solid/strong, valence harmful/mixed/beneficial, the fear/event tag & class buckets.
- Terms with **no in-repo source** are omitted from the map and collected into an owner-TODO list
  (delivered as a markdown list in this effort dir) — never invented.
- `<Term id="...">` component: dotted underline + popover; an id absent from the map renders as plain
  text (no broken affordance).
- A canon tripwire test (mirroring `aspectCanon.test.ts`) fails the build if any map entry has empty
  `text` or an invalid `source`.

The map/component are structured so any other surface can adopt a term later by adding a map entry —
no dedicated Glossary page in this ticket.

## Acceptance criteria

- [ ] Fear and Event views render defined terms with a dotted underline; hovering, clicking/tapping, or focusing reveals the definition.
- [ ] The definition popover is reachable by keyboard and works on touch (not hover-only).
- [ ] Every populated entry carries a valid `source`; the canon test fails on a missing/blank text or bad source.
- [ ] Terms with no in-repo source are absent (plain text), and the owner-TODO list of those terms is delivered.
- [ ] `CONTEXT.md`'s "Glossary term" definition matches the shipped map's shape.

## Blocked by

- None — can start immediately (parallel to 01/02).
