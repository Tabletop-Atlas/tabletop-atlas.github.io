# Game difficulty + browsable glossary

Status: needs-triage

## Problem Statement

The game log records *what* was played but not *how hard it was*. Spirit Island difficulty is an
additive quantity: a base per-adversary-per-level number, adjusted by a supporting second adversary,
the board type (classic vs thematic), and the scenario. Today none of that is captured, so a logged
loss at England L1 reads the same as a loss at England L6 + thematic board + a second adversary.

Three smaller gaps sit alongside it:

- The **Scenario** field in the log is free text, even though `scenarios.json` is a closed set with
  wiki-sourced difficulty values already transcribed. Free text fragments the data and mismatches the
  scenario chip art.
- The inline **glossary** (`Term` popovers, one central `GLOSSARY` map) exists but is only reachable
  where a term happens to be rendered — there is no browsable list. The `dashboard-picker-glossary`
  effort explicitly deferred a Glossary page ("the map is structured to render as one later").
- The Fear/Event views wire `event-class-*` term ids that **have no entry in the map**, so event
  classes render as plain text with no popover — the owner reads this as "the glossary is broken".

## Solution

Add per-level difficulty to the adversary dataset (wiki-sourced, tripwire-pinned), compute an
**editable suggested difficulty** for each logged game from adversary(s) + board + scenario, and
surface it in the history and stats. Switch the scenario field to the closed-set dropdown. Add a
browsable **Glossary tab** that lists every defined term and renders the additive difficulty model as
a sourced table, and fill the missing `event-class-*` entries so event classes get their popover.

Difficulty is presented as an **≈ approximate** figure: the per-level adversary numbers are official,
but the board / second-adversary modifiers are fan heuristics (the chart itself hedges them
"approximate / rough guide"). The computed value is only a *suggestion*; the stored number is an
editable field the owner can override. This keeps the repo's no-false-precision discipline.

## User Stories

1. As a player recording a game, I want the app to **suggest a difficulty number** from the adversary,
   level, board type, second adversary, and scenario I picked, so I don't compute it by hand.
2. As a player, I want that suggestion shown as a **line-by-line breakdown** (base + each modifier), so
   I can see where the number came from.
3. As a player, I want the final difficulty to be an **editable field** I can override, so a fuzzy
   modifier the app can't judge doesn't lock in a wrong number.
4. As a player, I want to record a **second (supporting) adversary and its level**, so two-adversary
   games are captured and counted toward the difficulty.
5. As a player, I want a **board-type toggle** — Classic / Thematic·base / Thematic·rebalanced — so the
   board's difficulty contribution is recorded.
6. As a player, I want to pick the **scenario from a list** (not type it), so it matches the known set,
   contributes its difficulty, and shows the right chip art.
7. As a player, I want each spirit/aspect and adversary picker to show a **preview image chip** of my
   current selection, so the form is as visual as the history.
8. As a player, I want the **Win/Loss** control colored green/red, so outcome reads at a glance.
9. As a player, I want to optionally record **start and end time**, so the app shows the game's length
   without my computing it.
10. As a player, I want each **history row to show its difficulty**, so past games are scannable by how
    hard they were.
11. As a player, I want a **win-rate-by-difficulty-band** statistic, so I can see how I do as games get
    harder, matching the existing by-adversary / by-complexity stats.
12. As a player, I want a **Glossary tab** listing every defined term grouped by category, so I can
    learn the vocabulary without hunting for a place it's rendered.
13. As a player, I want **event classes** to have the same hover definition the other Fear/Event terms
    have, so the glossary isn't half-wired.
14. As a player, I want the Glossary's **Difficulty** section to render the additive model as a table
    with its **source cited**, so the number's provenance is visible.
15. As the owner, I want the per-level adversary difficulty to be **wiki-sourced and tripwire-pinned**,
    with **Habsburg Mining Expedition absent** if the wiki lacks it — never guessed.

## Implementation Decisions

- **Dataset.** Add `difficultyByLevel: number[]` (index = adversary level 0–6) to each record in
  `adversaries.json`, transcribed from each adversary's Spirit Island Wiki page. Habsburg Mining
  Expedition's array is **omitted** unless the wiki lists it. `adversaryCanon.test.ts` is extended to
  pin the values; a record whose `difficultyByLevel` is present must have the right length and match.
- **Difficulty compute is a pure domain function** (`src/domain/difficulty.ts`), no React:
  `computeDifficulty(inputs) -> { total, lines }` where `lines` is the labelled breakdown.
  - Primary adversary → `difficultyByLevel[level]`.
  - Second adversary (optional) → `higher + Math.round(0.6 * lower)` of the two adversaries'
    difficulties (60% = midpoint of the chart's 50–75%).
  - Board: Classic `+0` / Thematic·base `+3` / Thematic·rebalanced `+1`.
  - Scenario → numeric part of the `scenarios.json` difficulty string; the raw string (`1*`, `+7`)
    is shown in the breakdown; `+/- 1` contributes `0` with the `±` shown. An adversary with no
    `difficultyByLevel` (Habsburg Mining) yields no base line and the function returns
    `total: undefined` (nothing to suggest) rather than a fabricated number.
- **The stored difficulty is editable.** The form shows the computed suggestion and a number input
  seeded from it; the owner may override. The stored value is what's in the field at submit.
- **Scenario field** becomes a `<select>` over `scenarios.json`. Existing free-text entries in old
  logs are left as-is (we never rewrite history); only new entries use the closed set.
- **Preview chip**: reuse `AvatarChip` beside each dropdown for the current selection (aspect configs
  show the spirit's art + aspect name, exactly as the history already does).
- **Win/Loss color**: green for win, red for loss, applied to the form chips and the history badge
  (the history badge already keys off `data-outcome`; extend the styling to the form group).
- **Start/end time**: two optional `<input type="time">`; a pure helper computes duration (handling a
  past-midnight end by adding 24h) and the form/history render e.g. "2h 15m". Absent → not shown.
- **History**: a small difficulty badge next to the adversary cell when `difficulty` is present.
- **Stats**: add `byDifficultyBand` to `logStats` — bands 0–2 / 3–5 / 6–8 / 9+ — rendered like the
  existing groupings. Entries without a difficulty are excluded from the band stat (not bucketed as 0).
- **Glossary tab**: a new nav item + page listing every `GLOSSARY` entry grouped by category (impact,
  valence, fear tags, event classes, difficulty). Add the missing `event-class-*` entries and a
  `difficulty` entry to the map (sourced — `owner` for prose the owner authors, `wiki` where the wiki
  is the source). The Difficulty section renders the additive model as a table built from the dataset
  + modifier constants, citing the wiki and the fan difficulty chart as sources.
- **Schema**: bump `CURRENT_SCHEMA_VERSION` 3 → 4. New `LogEntry` fields are all **optional**
  (`secondaryAdversary?`, `secondaryAdversaryLevel?`, `boardType?`, `difficulty?`, `startTime?`,
  `endTime?`), so v≤3 backups import unchanged.

## Testing Decisions

- **Adversary canon** (`adversaryCanon.test.ts`): extend to pin `difficultyByLevel` — present arrays
  have length 7 (levels 0–6) and match the transcribed values; the tripwire fails on drift.
- **Difficulty function** (`difficulty.test.ts`): given primary only, primary+second, each board type,
  and a scenario with a qualified difficulty string, the breakdown lines and total match; an adversary
  with no `difficultyByLevel` yields `total: undefined`.
- **Duration helper**: same-evening and past-midnight cases; absent input → undefined.
- **logStats** (`logStats.test.ts`): banding buckets a spread of entries correctly and excludes
  difficulty-less entries.
- **Glossary canon** (`glossaryCanon.test.ts`): unchanged discipline — the new `event-class-*` and
  `difficulty` entries have non-empty text and a valid source.
- **Component smoke** (`appSmoke.test.tsx`): the Glossary tab renders its categories; the Log form
  renders the second-adversary picker, board toggle, scenario dropdown, preview chips, and the
  difficulty breakdown without crashing.

## Out of Scope

- Extra-board count and archipelago modifiers from the chart (excluded per the grill).
- Auto-locking the difficulty (it stays editable) or feeding difficulty back into scoring/tiers —
  the log remains a journal, not a feedback loop.
- Rewriting existing free-text scenario entries to the closed set.
- A visual grid picker replacing the dropdowns (preview chip only).
- Embedding the fan difficulty-chart PDF image (the table is rebuilt from our own dataset instead).
- Any difficulty value for an adversary the wiki doesn't publish (stays absent).

## Further Notes

The per-level numbers are official (printed on the adversary panels); the modifiers are the chart's
own approximations, which is why difficulty is surfaced as "≈" and stays editable. The provenance
discipline is the repo's standing one — a tripwire test on any new dataset, absence over estimation.
Source chart: `Spirit_Island_Difficulty_Chart_with_Expansions_053122v2.pdf` (a community
compilation; used for the modifier constants and cited, not for the per-level numbers).
