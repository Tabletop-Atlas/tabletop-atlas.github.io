# 06 — Glossary tab + missing event-class & difficulty terms

Status: ready-for-agent
Parent: ../PRD.md

## What to build

Make the glossary browsable and fill its gaps. The `Term`/`GLOSSARY` infrastructure already exists
(`dashboard-picker-glossary` #03); this adds a page and the missing entries.

- **Missing entries in `GLOSSARY` (`src/domain/glossary.ts`).** The Fear/Event views already reference
  `event-class-*` ids that have no map entry, so event classes render as plain text with no popover.
  Add the `event-class-*` entries (source from `CONTEXT.md` / `otherCardClassifier` rules — the same
  place the `fear-tag-*` entries come from; if a class has no in-repo source it stays absent and is
  listed as an owner TODO, never invented). Add a `difficulty` entry explaining the additive model.
  The `glossaryCanon.test.ts` tripwire already guards non-empty text + valid source.
- **Glossary tab.** New nav item (after Log) + page. List every `GLOSSARY` entry grouped by category —
  Fear impact, Event valence, Fear tags, Event classes, Difficulty — each showing the term and its
  definition, and its source. Read the categories off the id prefixes (`impact-`, `valence-`,
  `fear-tag-`, `event-class-`, `difficulty`) so adding a future entry needs no page edit.
- **Difficulty section.** Render the additive model as a table built from `adversaries.json`'s
  `difficultyByLevel` (rows = adversaries, cols = levels 0–6) plus the modifier constants (board
  +3/+1, second adversary "higher + ~60% of lower", scenario adds its own difficulty). Cite the source:
  the Spirit Island Wiki (per-level numbers) and the community difficulty chart
  (`Spirit_Island_Difficulty_Chart_with_Expansions_053122v2.pdf`, modifiers). Table scrolls
  horizontally inside its own container on narrow screens; theme-aware.

## Acceptance criteria

- [ ] Event classes in the Fear/Event views now show a dotted-underline popover (their entries exist).
- [ ] The Glossary tab lists all defined terms grouped by category, each with source, and updates
      automatically when a new entry is added to the map.
- [ ] The Difficulty section renders the per-level table from the dataset (no hardcoded duplicate of
      the numbers) and cites both sources; an adversary with no `difficultyByLevel` shows blank cells,
      not zeros.
- [ ] `glossaryCanon.test.ts` passes with the new entries; `appSmoke.test.tsx` renders the tab.
- [ ] Any event class with no in-repo source is delivered as an owner-TODO list, not invented.

## Blocked by

- 01 (Difficulty table reads `difficultyByLevel`). The glossary-entry + tab work is otherwise
  independent and can start in parallel.
