# 02 — Source scenario expansions from canon

Status: ready-for-agent
Label: wayfinder:research (AFK — sourcing task with a tripwire)
Parent: [Legibility-pass map](../MAP.md)

## Blocked by

_(nothing — can run in parallel with 01)_

## Question

`scenarios.json` (16 records) carries **no expansion field** — its `_note` records that the manifest
had none. The owner wants scenarios to show (and later colour) their expansion. Per the owner's
charting decision, **source it from canon** rather than dropping it.

Transcribe each of the 16 scenarios' expansion from a **high-trust source** (Spirit Island wiki /
official product pages), add an `expansion` field (using a raw string that ticket
[01](01-canonical-expansion-normalization.md)'s normalisation resolves — coordinate on the exact
strings), and add a **tripwire test** pinning the sourced values (the `adversaryCanon.test.ts`
pattern) so drift/fabrication is caught.

⚠ This is the exact surface of the repo's documented failure mode. **If a scenario's expansion
can't be sourced confidently, that field is ABSENT for that scenario, not estimated** — record which
ones (if any) were left absent in the resolution.

Resolution records: the sourced expansion per scenario, the source URL(s), any left absent, and the
tripwire test added.

## Acceptance criteria

- [ ] Each of the 16 scenarios has a canon-sourced `expansion` (or is explicitly recorded as
      unsourceable and left absent)
- [ ] Source URLs captured in the resolution / a linked asset
- [ ] A tripwire test pins the sourced expansions (fails on drift)
- [ ] Raw strings chosen to resolve through ticket 01's normalisation
- [ ] Test suite / `tsc -b` / `oxlint` green

> Unblocks the fog item **"scenario expansion colouring"** — once this + ticket 05 land, applying the
> chosen expansion treatment to scenarios becomes a trivial follow-up ticket.
