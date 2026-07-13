# 21 — The colour pass 🎨

Status: ready-for-agent
Parent: [Phase 4 PRD](../PRD.md) · cluster 5 (Archive & theming)

## Blocked by

None — can start immediately.

## What to build

Three locked colour calls, delivered as one visible pass:

- **Card-kind tag colours:** Major / Unique / Minor visibly distinct in the Archive's grids.
  Heed v5's tag-colour lesson (its round 1 shipped a hash palette that guaranteed collisions):
  an explicit colour per kind, pinned by a test that no two kinds share a colour.
- **Speed:** Fast = red, Slow = blue — locked at spec assembly (the icon alternative was
  declined: only ~80px contested-provenance PNGs exist, per the
  [research](../official-assets-research.md)).
- **Expansion colours:** one expansion→colour mapping, consumed by every surface that colours an
  expansion (Browse, tier board, Archive, detail) — a single source of truth, so an expansion is
  the same colour everywhere.

**Variant round (HITL):** present 2–3 palette candidates for the kind/speed chips on the real
Archive grid (dark surface) via the `?variant=` switcher; the owner picks; winner ships;
screenshots kept in `../screenshots-21/`.

## Acceptance criteria

- [ ] Major/Unique/Minor chips are visibly distinct; a test pins that no two kinds (and neither
      speed) share a colour
- [ ] Fast renders red, Slow renders blue, everywhere speed is shown
- [ ] Expansion colours come from one mapping; no surface carries its own copy
- [ ] Variant round run and recorded (screenshots kept, scaffolding deleted)
- [ ] Legibility checked on the dark theme at 375px + desktop
