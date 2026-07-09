# 02 — Configurations + 68-key tier seed

Status: done

## Parent

`.scratch/v2/PRD.md`

## What to build

Change the unit the app reasons about from a **spirit** to a **configuration**: a base spirit,
or that spirit with exactly one aspect applied. 37 spirits + 31 aspects = **68 configurations**.

- A **pure `configurations` module**: `expand(spirits) → Configuration[]`, where a
  Configuration is `{ configId, spirit, aspect?, isBase, effectiveComplexity }`.
- `configId` is the spirit's id for a base configuration, and `"<spiritId>::<Aspect Name>"`
  for an aspect configuration. These ids are stable and become the keys used by `tierStore`,
  the game log, and the backup file.
- **`tierStore` is keyed by `configId`**, not spirit id. Its public API does not change.
- **`tiers.json` grows from 37 to 68 entries.** The 31 aspect tiers are transcribed from the
  owner's TierMaker board (labels are legible; cross-checked against the canonical 31):

```
X  Regrowth
S  Intensify, Nourishing
A  Travel, Sparking, Tangles
B  Encircle, Unconstrained, Transforming, Enticing, Violence, Stranded, Lair, Haven,
   Spreading Hostility
C  Locus, Might, Deeps, Wind, Pandemonium, Mentor, Dark Fire
D  Warrior, Tactician, Immense, Resilience, Foreboding
F  Amorphous, Reach, Madness, Sunshine
```

- The **Tier list tab renders all 68 configurations** grouped by tier — it becomes a faithful
  reproduction of the owner's board.
- `effectiveComplexity` is computed here but is not yet fed into scoring (that's #03).

Fit is **inherited** from the base spirit's OCFDU, unmodified. Aspects have no printed OCFDU
and none will be invented.

## Acceptance criteria

- [ ] `expand()` produces exactly 68 configurations; exactly 37 have `isBase === true`
- [ ] `configId` is stable and unique across all 68
- [ ] `tiers.json` has 68 entries, all valid tiers, one per configuration
- [ ] The aspect tiers match the mapping above (spot-check a sample against `my-image.png`; report any mismatch rather than "fixing" it silently)
- [ ] `tierStore` reads and writes by `configId`; its existing public-API tests still pass
- [ ] The Tier list tab shows all 68 configurations, grouped by tier
- [ ] **Regression: a backup exported against the 37-key seed imports losslessly into the
      68-key seed** — every spirit key resolves, the 31 new aspect configs fall back to
      neutral, and nothing is reported unresolved
- [ ] `dataIntegrity` / `aspectCanon` tests still pass

## Blocked by

- #01 (export/import must exist before the seed fingerprint changes, or browser tier edits are destroyed)
