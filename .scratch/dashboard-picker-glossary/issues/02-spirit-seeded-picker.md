# 02 — Spirit-seeded picker

Status: done
Parent: ../PRD.md

## What to build

Make the free-form element/count picker follow the picked spirit. When a spirit is selected on the
Dashboard, pre-fill the picker with the demanded element the spirit is least likely to hit and that
element's first-rung demand count — so the user no longer re-derives it from the demand table by
hand. The user can still edit the chips freely.

- Add a pure domain function (in/near `elementDemand.ts`) that takes a spirit's
  `ElementDemandSupply` and returns `{ element, count } | undefined`: the demanded row with the
  **lowest `odds`** (deterministic tie-break), `count` = that element's **first threshold rung**.
  Returns `undefined` when there is no demand.
- Wire it into `DashboardTab`: re-seed when the picked **spiritId** changes; do **not** re-seed on
  segment (Minor↔Major) switch; manual edits to element/count persist until the next spirit change
  overwrites them (no lock/`touched` flag). No spirit → picker stays blank. Values stay session-only
  (a reload reverts).

## Acceptance criteria

- [ ] Picking a spirit pre-fills the element strip with its lowest-odds demanded element and the count chips with that element's first-rung demand.
- [ ] Picking a different spirit re-seeds to that spirit's problem element/count.
- [ ] Switching segment (Minor↔Major) leaves the picked element/count alone.
- [ ] A manual element/count edit sticks until the next spirit change.
- [ ] Selecting "No spirit" leaves the picker blank.
- [ ] The seeding function has a domain test (alongside `elementDemand.test.ts`): multi-element demand returns the lowest-odds element + its first-rung count; no-demand returns `undefined`.
- [ ] `appSmoke.test.tsx` reaches a seeded state via the existing `initialSpiritId` hatch without crashing.

## Blocked by

- 01 — Element + count chip controls (the seed writes into those controls).
