# 04 — Dedup by base spirit, with base-wins tie-break

Status: ready-for-agent

## Parent

`.scratch/v2/PRD.md`

## What to build

The pool is now 68 configurations, and sibling configurations of one spirit inherit **identical
fit by construction**. Without a rule, the shortlist would cluster (three Shadows rows) and,
worse, would pick an aspect arbitrarily.

- The shortlist contains **at most one configuration per base spirit** — the best-scoring one.
- **Ties break toward the base configuration.** With the novelty knob at zero and complexity
  indifference, siblings score *exactly* equal; without this rule the app recommends an
  arbitrary aspect for no reason. An aspect must **earn** its way past base via tier, complexity
  fit, or novelty.
- After `isBase`, fall back to a stable order so the ranking is deterministic across reloads.
- A result names the configuration: *"Shadows Flicker Like Flame — play the **Dark Fire** aspect"*.
- The **expanded row lists the spirit's other configurations with their tiers**, so the aspect
  choice can be made right after the spirit choice.

## Acceptance criteria

- [ ] The shortlist never contains two configurations of the same base spirit
- [ ] When siblings tie exactly, the **base** configuration is chosen
- [ ] A high-tier aspect configuration outranks its low-tier base when the tier knob is up (e.g. Dark Fire (C) over base Shadows (F))
- [ ] At `tierKnob = 0` with complexity importance 0, base is recommended for every spirit
- [ ] Ranking is deterministic across repeated calls and reloads
- [ ] A recommended aspect configuration is named as spirit + aspect in the UI
- [ ] The expanded row lists sibling configurations with their tiers
- [ ] Wildcard selection still never returns a configuration already in the top 3

## Blocked by

- #02 (configurations must exist)
