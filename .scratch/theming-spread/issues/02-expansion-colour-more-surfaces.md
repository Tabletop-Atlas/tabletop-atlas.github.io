# Add expansion colour to surfaces that don't show it today

Status: needs-triage

## Parent

`../README.md`, `phase-4/issues/21-*.md` (the ticket that raised and parked this question)

## Background

Phase 4 #21 set out to make "an expansion is one colour everywhere" true. The audit found the
structural call already held: `EXPANSION_COLOR` in `tagColors.ts` is the one mapping, and its
only two consumers — Browse's `SpiritTile` and the detail's `SpiritDetail` — are the only two
surfaces that colour expansions **at all**. Nothing shipped for that box because there was
nothing inconsistent to fix.

But the ticket's own wording named the tier board and the Archive among the surfaces expansion
colour should appear on, and neither shows it today. The ticket flagged this as a reading
question rather than guessing: consistency-where-it-already-appears (the weaker reading, which
is what #21 shipped) vs. colour-added-to-new-surfaces (the stronger reading, parked here).

## What this needs before it's buildable

- Owner confirmation of which surfaces should gain expansion colour — the tier board, the
  Archive, both, or something else.
- Once scoped, this is likely a small ticket: extend `EXPANSION_COLOR` consumption to the named
  surfaces, no new palette work (the mapping already exists and is single-source).

## Out of scope (for now)

Redesigning `EXPANSION_COLOR` itself — that mapping already shipped and isn't in question, only
where it's consumed.
