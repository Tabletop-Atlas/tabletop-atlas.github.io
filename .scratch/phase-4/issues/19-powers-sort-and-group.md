# 19 — Powers sort and group

Status: ready-for-agent
Parent: [Phase 4 PRD](../PRD.md) · cluster 5 (Archive & theming)

## Blocked by

None — can start immediately.

## What to build

Per the locked owner call and the [Archive resolution](04-the-archives-structure.md): the
Archive's **Powers segment** (and only it) gains controls to sort and group the deck by **cost**,
**elements**, and **speed**, composing with the existing filters. Grouping renders labelled
sections in both Grid and Rows views. Fear/Events/Blight and the other segments keep their
current ordering — their data honestly can't support more (the locked call: alphabetical/by-type
stays). No structural change: the six-segment switch is settled.

## Acceptance criteria

- [ ] Powers can be sorted by cost and grouped by cost, by speed, and by element — deterministic
      and stable, tested at the domain seam (model: the existing filter tests)
- [ ] Group headers render in Grid and Rows views; filters and sort/group compose
- [ ] All other segments are byte-unchanged in behaviour
- [ ] Controls fit a 375px viewport (the segment switch overflow lesson from v5)
