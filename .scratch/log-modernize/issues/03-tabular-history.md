# 03 — Tabular history

Status: done
Parent: ../PRD.md

## What to build

Replace the nested `<ul>` history with a scannable table, one row per game.

- Columns: Date · Outcome · Spirits (a cluster of avatar chips, one per player) · Adversary + level ·
  Scenario (avatar chip) · Notes. Terror/blight fold in as they do today.
- Uses the avatar chip component (ticket 02) for spirit, adversary and scenario cells.
- The Notes cell truncates with the full text available on hover/expand.
- Must degrade to a usable layout at narrow (phone) widths — the table/chips must not overflow the
  viewport.

## Acceptance criteria

- [ ] History renders as one row per logged game with the columns above.
- [ ] A multi-player game shows all its spirits as chips within that single row.
- [ ] Adversary and scenario render as avatar chips; a long note truncates with full text reachable.
- [ ] The layout stays usable and non-overflowing at small widths.
- [ ] `appSmoke.test.tsx` renders the table history (with chips) without crashing.

## Blocked by

- 01 — Per-game note + form/shell restyle (Notes column/field).
- 02 — Avatar chip component (spirit/adversary/scenario cells).
