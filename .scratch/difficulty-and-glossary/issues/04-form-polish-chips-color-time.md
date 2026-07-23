# 04 — Log form polish: preview chips, win/loss color, start/end time

Status: done
Parent: ../PRD.md

## What to build

Three independent quality-of-life touches on the form.

- **Preview AvatarChip beside each picker.** Next to each spirit/aspect `<select>` and each adversary
  `<select>`, render the `AvatarChip` for the current selection (blank when none). Aspect configs show
  the spirit's art + the aspect name — identical to how the history already renders a config
  (`configLabel` + `spiritForConfig`). Reuse `AvatarChip` unchanged.
- **Win/Loss color.** Green for win, red for loss. The history badge already carries
  `data-outcome`; extend the CSS so the value is green/red there, and apply the same to the form's
  Outcome chip group (the active chip reads green when "win", red when "loss"). Keep the pressed/active
  affordance accessible (not color alone — the label text stays).
- **Start / end time → length.** Two optional `<input type="time">` ("Start", "End"). Add a pure
  `formatDuration(start?: string, end?: string): string | undefined` helper (in `logEntry.ts` or a new
  `duration.ts`): parses `HH:MM`, adds 24h if end < start (past midnight), returns e.g. `"2h 15m"`;
  returns `undefined` if either is missing. Store `startTime`/`endTime` (declared optional in 03).
  Show the computed length in the form near the inputs and in the history row's outcome meta when both
  are present.

## Acceptance criteria

- [ ] Selecting a spirit/aspect or adversary shows its image chip beside the dropdown; clearing hides it.
- [ ] Win renders green, Loss renders red, in both the form control and history — with the text label
      still present (color is not the only signal).
- [ ] Entering start + end shows a computed duration; past-midnight is handled; a missing field shows
      nothing (no `NaN`, no "0m").
- [ ] `formatDuration` has a unit test (same-evening, past-midnight, missing input).

## Blocked by

- 03 (schema fields + form structure). Independent of 05/06 otherwise.

## Comments

- Implemented 2026-07-23. `AvatarChip` previews added beside each player/adversary/second-adversary
  picker (and, beyond the letter of this issue but consistent with its intent, the scenario picker
  too). Win/loss colored via `data-outcome` on both the history badge and the form's Outcome chip
  group, text label always present. `formatDuration` added to `logEntry.ts` with a unit test
  (same-evening, past-midnight, missing input); shown in the form and the history row.
