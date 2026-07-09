# 20 — Nits from the second review: a lying comment, a twin test, a dangling pointer

Status: ready-for-agent

## Parent

`.scratch/v2/PRD.md`

## What to build

Four small things found reviewing the #10–#18 fixes. None is a behaviour bug. They can be done
in any order.

**1. `getOverrides()`'s comment describes a filter that does not exist.** Both `tierStore` and
`complexityStore` document it as returning "only the user's edits (keys whose value differs
from the seed)". It returns the stored overrides map. Assign a spirit the tier it already has
and that no-op is stored, exported in the backup, and re-imported as an override. The export
round trip is still correct, so this is a documentation bug, not a data one — but the comment
is the only place the intended semantics are written down. Either filter out values equal to
the seed, or say what the function actually does.

**2. Two tests in `recommend.test.ts` are the same test.** *"still buries an over-ceiling
configuration when complexityImportance is 0"* and *"pins the interaction: complete newcomer +
'bring on the bookkeeping'"* make the same call with the same arguments and assert the same
thing. The second earns its keep only through its name. Keep the one whose name explains why
the behaviour matters, and delete the other — or make them actually differ.

**3. `adversaries.json`'s `_note` points nowhere.** It says "See docs/agents or the #16 issue
comment for the fetch trail." There is no fetch trail in `docs/agents`. Point at the one place
that has it.

**4. `backup.parse` accepts `schemaVersion: 0` and negative numbers.** Only `> CURRENT` is
rejected. A version below 1 was never written by this app, so a file claiming one is malformed.
Reject it with the same clarity the future-version branch already manages.

## Acceptance criteria

- [ ] `getOverrides()` either filters seed-equal values or is documented as returning the stored map
- [ ] Whichever is chosen, a test pins it
- [ ] `recommend.test.ts` no longer contains two identical tests
- [ ] `adversaries.json`'s `_note` references a location that exists
- [ ] A `schemaVersion` below 1 is rejected with a clear error
- [ ] `npm test`, `npx tsc -b` and `npm run lint` stay green

## Blocked by

- None — can start immediately
