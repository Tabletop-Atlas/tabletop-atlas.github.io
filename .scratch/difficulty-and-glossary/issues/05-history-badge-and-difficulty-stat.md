# 05 — History difficulty badge + win-rate-by-difficulty stat

Status: done
Parent: ../PRD.md

## What to build

Surface the recorded difficulty in the two read views.

- **History row.** When an entry has `difficulty`, show a small badge (e.g. "Diff 12") in the Adversary
  cell next to the level, styled like the existing `log-outcome-meta`. Absent → nothing.
- **Statistics.** Add `byDifficultyBand` to `computeLogStats` (`src/domain/logStats.ts`): bucket
  entries by difficulty into bands **0–2 / 3–5 / 6–8 / 9+**, each a `RateStat` (reuse the existing
  small-sample rule). Entries with no `difficulty` are **excluded** from this stat, never bucketed as
  band 0. Render it in `GameLog.tsx` under a "Win rate by difficulty" heading, matching the existing
  by-adversary / by-complexity lists, in band order.

## Acceptance criteria

- [ ] A history row with a difficulty shows its badge; one without shows no badge.
- [ ] `logStats.test.ts` covers banding: entries spread across bands land in the right buckets, and a
      difficulty-less entry is excluded from `byDifficultyBand` (but still counted in `overall`).
- [ ] The Statistics panel lists the bands in order with formatted rates, hidden when no games qualify.

## Blocked by

- 03 (entries must be able to carry `difficulty`). Independent of 04/06.

## Comments

- Implemented 2026-07-23. History row shows a "Diff N" badge next to the level when
  `entry.difficulty` is present. `computeLogStats` gained `byDifficultyBand` (0-2/3-5/6-8/9+),
  rendered under a "Win rate by difficulty" heading in band order; difficulty-less entries are
  excluded from the band stat but still counted in `overall`, per
  `logStats.test.ts`.
