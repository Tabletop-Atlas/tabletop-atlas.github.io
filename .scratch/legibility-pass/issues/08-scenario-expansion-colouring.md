# 08 — Scenario expansion colouring

Status: ready-for-agent
Label: wayfinder:task (AFK — mechanical once both blockers land)
Parent: [Legibility-pass map](../MAP.md) · [PRD](../PRD.md)

## Blocked by

- [02 source scenario expansions](02-source-scenario-expansions.md) — scenarios have no expansion
  field to colour until this lands.
- [05 expansion colour across the Archive](05-expansion-colour-archive.md) — this ticket applies
  **that** ticket's owner-picked treatment; there's no treatment to apply until #05 ships.

## What to build

Bring scenarios into the expansion-colour system now that they have the data (#02) and the treatment
is decided (#05). Apply the same owner-picked "underlying character" expansion treatment to the
Scenario grid (`ScenarioGrid`) and Scenario rows (`ScenarioRows`) that #05 applied to the other card
types — using the same `EXPANSION_COLOR` value (via `normalizeExpansion()`), so a scenario's
expansion matches that expansion's colour everywhere else on the site.

This is deliberately mechanical: no new variant round, no new palette, no new decision — it's the
follow-through that #05 excluded only because scenario data didn't exist yet. If #02 left any
scenario's expansion honestly absent, that scenario shows no expansion colour (honest absence, not a
default).

Note: the Scenario grid already colours its tiles by **difficulty band** (`SCENARIO_BAND_COLOR`).
Adding expansion colour must not clobber or clash with the difficulty banding — reconcile the two
signals the same way #05 reconciled expansion colour with any existing tile colour (follow the
treatment #05 shipped; if the two genuinely can't coexist on the scenario tile, surface it rather
than dropping either).

## Acceptance criteria

- [ ] Scenario grid + rows show expansion in the treatment #05 shipped, from the one `EXPANSION_COLOR` map
- [ ] A scenario's expansion colour matches that expansion's colour on Browse tiles / other Archive types byte-for-byte
- [ ] Scenarios left expansion-absent by #02 show no colour (no default)
- [ ] Difficulty banding and expansion colour coexist legibly (or the conflict is surfaced, not silently resolved)
- [ ] `cardChipColors.test.ts` green; test suite / `tsc -b` / `oxlint` green
- [ ] Legible on dark theme at 375px + desktop
