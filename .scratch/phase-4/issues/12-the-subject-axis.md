# 12 — The subject axis

Status: ready-for-agent
Parent: [Phase 4 PRD](../PRD.md) · cluster 2 (tier data layer)

## Blocked by

None — can start immediately.

## What to build

The domain expand that makes the tier-UX cluster easy, per the
[architecture resolution](06-multi-tier-list-architecture.md) — no UI change in this ticket:

- Every tier list declares a required **subject** — `configurations`, `minor-powers`,
  `major-powers` — defining the id namespace of its tier keys. The three shipped lists migrate
  to `subject: configurations`.
- The tier store tracks **one active list per subject**, and a durable **default list**
  preference (seeded to the credited cited list) that boot activates. Settings UI for the pick
  arrives in [#18](18-attribution-and-the-default-list.md); list-creation UI in
  [#16](16-card-subject-lists-end-to-end.md) — this ticket ships the domain seams they call.
- ADR 0001's rules extend unchanged along the axis: cited = immutable + citation required;
  personal = editable, any subject. No `game` field.
- **ADR 0002 (the tier-list subject axis)** is written, per the map's standing note.

## Acceptance criteria

- [ ] The canon test pins `subject` on every shipped list and resolves card-list tier keys
      against the power-card dataset (the tripwire for any future card list)
- [ ] Active-list-per-subject and default-list rules are unit-tested with injected storage
      (model: the existing tier-store tests)
- [ ] Backup round-trips unchanged, or the schema version is bumped with a migration — verified,
      not assumed
- [ ] ADR 0002 committed; CONTEXT.md vocabulary (subject, active list, default list) matches
- [ ] All existing tests green; zero visible UI change
