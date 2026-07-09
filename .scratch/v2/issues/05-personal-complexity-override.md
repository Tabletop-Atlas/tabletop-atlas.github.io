# 05 — Personal complexity override, with the split rule

Status: done

## Parent

`.scratch/v2/PRD.md`

## What to build

The printed Complexity number doesn't always match the owner's experience. Let them record
their own read — **without corrupting the newcomer safeguard**.

- A `complexityStore` on the **`tierStore` pattern**: get / set / reset / getAll / isCustomised.
  Seeds from the printed value in `spirits.json`, overlays user edits in `localStorage`, stamps
  them with a seed fingerprint, and discards them when the shipped seed changes.
- **Printed `complexity` stays untouched in the dataset.** Fact and judgment stay separable,
  exactly as `ratings` vs `ratingsSource`.
- Overrides live in the Customise tab alongside tier assignment, and are exported/imported by
  the `complexityOverrides` section that schema v1 already declares.

### The split rule — the subtlest thing in v2

Complexity currently serves two different consumers, and they must read different sources:

| Consumer | Question that feeds it | Reads |
|---|---|---|
| **newcomer ceiling** | *"How well does the player at the table know Spirit Island?"* | **printed** complexity |
| **enjoyment preference** | *"How much complexity and bookkeeping do you enjoy?"* | the **override** |

An override encodes *the owner's* familiarity. A stranger at the table does not share it. If the
owner marks Bringer "Low" because they find it easy, a first-timer must still not be handed
Bringer — its difficulty was never about rules load.

Effective complexity for scoring composes with the aspect arrow from #03: the override replaces
the *base* level, then the aspect's `complexityDelta` applies, then clamp.

**Aspects are not individually overridable.** Their printed arrow stands.

## Acceptance criteria

- [ ] Override round-trips: set then get returns the override, not the printed value
- [ ] Reset restores the printed value
- [ ] Overrides survive a reload, and are discarded when the shipped seed fingerprint changes
- [ ] `spirits.json` printed `complexity` is never mutated
- [ ] **The newcomer ceiling ignores the override** — a spirit overridden to Low is still buried for a first-timer if its printed complexity is High
- [ ] **The enjoyment preference honours the override** — the same spirit scores as Low against a "keep it simple" preference
- [ ] Override composes with the aspect arrow (override base level, then apply delta, then clamp)
- [ ] Overrides are exported and imported via `complexityOverrides`
- [ ] Aspects expose no override control

## Blocked by

- #01 (backup schema declares `complexityOverrides`)
- #03 (effective complexity composes the override with the aspect arrow in one place)
