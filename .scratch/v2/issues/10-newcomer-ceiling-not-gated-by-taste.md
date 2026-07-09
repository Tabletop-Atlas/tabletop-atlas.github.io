# 10 — The newcomer ceiling must not be gated by the enjoyment knob

Status: done

## Parent

`.scratch/v2/PRD.md`

## What to build

`complexityPenalty()` currently returns `0` whenever `complexityImportance <= 0`, and its
ceiling term is multiplied by `complexityImportance`. That importance value comes from the
**"how much complexity do you enjoy"** question, whose `bring-it` option sets it to `0`. The
ceiling comes from a **different question about a different person**: "how well does the
player know Spirit Island".

So answering *"Complete newcomer"* **and** *"Bring on the bookkeeping"* silently switches off
the newcomer safeguard entirely. The PRD calls that ceiling "the single most valuable
safeguard in the questionnaire" (story 16); the host's own taste must never disable it.

Separate the two terms:

- The **ceiling penalty** is a safeguard. It fires whenever a ceiling is set and a
  configuration's `effectiveComplexity` exceeds it, regardless of `complexityImportance`.
- The **preference penalty** is taste. It stays scaled by `complexityImportance` and keeps
  reading `personalEffectiveComplexity`.

The split rule from the PRD (ceiling reads printed, preference reads the override) is already
correct and must stay correct. This issue only decouples *when* each term fires.

## Acceptance criteria

- [ ] With `complexityImportance = 0` and a `Low` ceiling, a Very High configuration is still buried
- [ ] With `complexityImportance = 0` and no ceiling, no penalty is applied at all
- [ ] The ceiling penalty still reads `effectiveComplexity` (printed base + aspect arrow), never the override
- [ ] The preference penalty still reads `personalEffectiveComplexity` and is still scaled by `complexityImportance`
- [ ] Existing `recommend.test.ts` cases for the split rule continue to pass
- [ ] A test pins the interaction directly: `experience: newcomer` + `complexityTolerance: bring-it` still buries a Very High configuration

## Blocked by

- None — can start immediately

## Comments

Resolved: `complexityPenalty()` in `recommend.ts` now computes the ceiling term unconditionally
(no longer gated by `importance <= 0`); only the preference term stays scaled by
`complexityImportance`. Tests added/updated in `recommend.test.ts` pin the newcomer+bring-it
interaction and the no-ceiling/importance-0 no-penalty case.
