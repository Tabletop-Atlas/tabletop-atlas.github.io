# 10 — Strip the player-count input

Status: ready-for-agent
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

- [ ] No player-count input exists in the wizard or the sidebar; the wizard opens on its first
      questionnaire question
- [ ] The note-relevance logic and its tests are deleted, not orphaned
- [ ] A test pins recommendation output as identical before/after the removal (model:
      the collection-ranking regression test)
- [ ] Last-answers restore and all existing recommender behaviour unchanged; app smoke passes
