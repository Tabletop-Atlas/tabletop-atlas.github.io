# 20 — Scenario difficulty: source it, then show it 🎨

Status: ready-for-agent
Parent: [Phase 4 PRD](../PRD.md) · cluster 5 (Archive & theming)

## Blocked by

None — can start immediately.

## What to build

The locked call wants a difficulty indicator on scenario tiles — but **the scenario dataset
carries only name and image today**. This ticket is sourcing first, display second, under
CLAUDE.md's cardinal rule:

1. **Source it:** the printed game assigns each scenario an official difficulty modifier. Obtain
   each of the 16 scenarios' difficulty from a verifiable reference (the Spirit Island wiki is
   the repo's precedent for live verification — see how aspect expansions were sourced in v5),
   record provenance on the dataset, and add the tripwire test pinning all sourced values. **Any
   scenario whose difficulty cannot be verified stays honestly absent — no estimates — and is
   named in the resolution comment.**
2. **Show it:** scenario tiles in the Archive gain the difficulty indicator.

**Variant round (HITL):** present 2–3 indicator treatments (e.g. corner badge, dot meter, plain
figure) on the real scenario grid via the `?variant=` switcher pattern; the owner picks; the
winner ships; screenshots kept in `../screenshots-20/`.

## Acceptance criteria

- [ ] A difficulty value with recorded provenance exists for every scenario that a verifiable
      source covers; unverifiable ones are absent and named, never estimated
- [ ] A tripwire test pins every sourced value (model: the adversary/aspect canon tests)
- [ ] Scenario tiles display the indicator; scenarios with absent difficulty show nothing (no
      placeholder value)
- [ ] Variant round run and recorded (screenshots kept, scaffolding deleted)
- [ ] Browser-verified at 375px + desktop
