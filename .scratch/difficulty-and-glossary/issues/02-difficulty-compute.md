# 02 — Difficulty computation (pure domain function)

Status: ready-for-agent
Parent: ../PRD.md

## What to build

A pure function that turns the recorded setup into an approximate difficulty with a labelled
breakdown. No React, no storage.

`src/domain/difficulty.ts`:

```
computeDifficulty(inputs: {
  adversary: string; adversaryLevel: number;
  secondaryAdversary?: string; secondaryAdversaryLevel?: number;
  boardType?: 'classic' | 'thematic-base' | 'thematic-rebalanced';
  scenario?: string;
}): { total: number | undefined; lines: { label: string; value: string; amount: number }[] }
```

Rules:
- Primary base = `findAdversary(name).difficultyByLevel[level]`. If that adversary has no
  `difficultyByLevel` (Habsburg Mining), emit no base line and return `total: undefined` — nothing to
  suggest, never a fabricated number.
- Second adversary → combine the two adversaries' difficulties as `higher + Math.round(0.6 * lower)`.
  The breakdown line shows the added amount (`higher + 0.6·lower − primary`), labelled with the second
  adversary + level.
- Board: `classic` +0 (omit the line), `thematic-base` +3, `thematic-rebalanced` +1.
- Scenario → numeric part of the `scenarios.json` difficulty string. Show the raw string in the line
  (`"Rituals of Terror (3)"`, `"Elemental Invocation (1*)"`). `+/- 1` parses to `0` and the line shows
  `±1`. Parse a leading optional sign + digits; ignore trailing `*`.
- `total` = sum of amounts, or `undefined` if there's no base.

Add a small exported helper `parseScenarioDifficulty(raw: string): number` used by the above and
reusable elsewhere.

## Acceptance criteria

- [ ] `difficulty.test.ts` covers: primary only; primary + second; each board type; a clean-integer
      scenario and a qualified one (`1*`, `+/- 1`); an adversary with no `difficultyByLevel` → `total`
      is `undefined`.
- [ ] The breakdown `lines` are ordered base → second → board → scenario and each carries a
      human-readable label + the raw value shown.
- [ ] Function is pure (no imports of React/storage); safe to call on every keystroke.

## Blocked by

- 01 (needs `difficultyByLevel` on the dataset).
