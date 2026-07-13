# 10 — Strip the player-count input

Status: done
Parent: [Phase 4 PRD](../PRD.md) · cluster 1 (honest fixes)

## Blocked by

None — can start immediately.

## What to build

The recommender stops asking for a player count. The wizard opens directly on its first real
question; the sidebar has no player-count field; the note-relevance badge (the input's only
consumer) is deleted with it — a note's own text ("strong solo") already carries that signal.
The ranking must be provably untouched: player count never influenced it, and a test pins that
removing the input changed nothing.

Standing constraint (from the [recommender resolution](08-the-recommenders-short-term-shape.md)):
player count must not be reintroduced into ranking until sourced per-player-count data exists.

## Acceptance criteria

- [x] No player-count input exists in the wizard or the sidebar; the wizard opens on its first
      questionnaire question
- [x] The note-relevance logic and its tests are deleted, not orphaned
- [x] A test pins recommendation output as identical before/after the removal (model:
      the collection-ranking regression test)
- [x] Last-answers restore and all existing recommender behaviour unchanged; app smoke passes

## Comments

**Resolved (2026-07-13).** Deleted `playerCount.ts`, `noteRelevance.ts`, both their test files, the
wizard's step-0 screen, the sidebar players field, and the orphaned `.notes-relevant` CSS. The
wizard now indexes `QUESTIONS` directly and opens on question 1; the "Just pick one at random"
escape moved from the deleted step-0 screen onto question 1 (in place of Back, which only renders
from question 2 on), so no behaviour was lost. `useRecommender` lost its export — the "other tabs
read the shared player count" comment was aspirational; nothing ever imported it.

The pin: `rankingPin.test.ts` captured the full-pipeline ranking (answers → weights → recommend →
dedupe, real dataset, default tier prior via injected memory storage) with exact configIds and
scores **before** the removal, and passes unchanged after it — player count was never a ranking
input, now proven, not asserted. Verified in Playwright against the production build at 375px and
1280px (wizard Q1, full run-through to results, sidebar knobs, restore prompt); screenshots in
`../screenshots-10/`. Full suite 324/324, tsc clean. Two-axis code review: no hard violations;
its two judgement calls (inject tier-store storage in the test, dead `Math.max` clamp) applied.
