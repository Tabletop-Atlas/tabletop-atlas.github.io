# 03 — Log form: second adversary, board, scenario dropdown, difficulty field + schema v4

Status: ready-for-agent
Parent: ../PRD.md

## What to build

Extend the "Record a game" form and the log schema to capture the new setup and the (editable)
difficulty.

Schema (`src/domain/backup.ts`):
- Bump `CURRENT_SCHEMA_VERSION` 3 → 4.
- Add optional `LogEntry` fields: `secondaryAdversary?: string`, `secondaryAdversaryLevel?: number`,
  `boardType?: 'classic' | 'thematic-base' | 'thematic-rebalanced'`, `difficulty?: number`.
  (`startTime?`/`endTime?` land in 04 — declare them here too if convenient, all optional.)
- All new fields optional → no migration needed; v≤3 backups still parse. Confirm the `parse` path and
  `mergeLog` are untouched by the additions.

Form (`GameLog.tsx`):
- **Second adversary + level** (optional): a second adversary `<select>` + level input, mirroring the
  primary, with the same level-clamp behaviour (`handleSetAdversary`/`handleSetAdversaryLevel` logic).
  Empty second adversary → fields stored as `undefined`.
- **Board type**: three-way segmented chip control (Classic / Thematic·base / Thematic·rebalanced),
  same `log-chip` pattern as the Outcome group. Default Classic.
- **Scenario**: replace the free-text input with a `<select>` over `scenarios.json` (blank option =
  none). Keep storing `scenario` as the name string (or `undefined`).
- **Difficulty**: call `computeDifficulty` (issue 02) from the current form state; render the labelled
  **breakdown** and a number input seeded from `total`. The input is editable; store its current value
  as `difficulty` (or `undefined` if blank / no base). Label the block "Difficulty (≈ approximate)".
- On submit, include the new fields (clamp difficulty to a sane non-negative int via
  `clampOptionalInt`); on reset, clear them.

## Acceptance criteria

- [ ] A game can be recorded with two adversaries, a board type, a dropdown-picked scenario, and a
      difficulty; all persist and reload.
- [ ] The difficulty input pre-fills from the computed suggestion and can be overridden before submit.
- [ ] Changing any input (adversary/level/second/board/scenario) updates the breakdown live.
- [ ] A v3 backup still imports without error; a v4 export round-trips the new fields.
- [ ] `appSmoke.test.tsx` renders the new controls and the breakdown without crashing.

## Blocked by

- 02 (uses `computeDifficulty`).
