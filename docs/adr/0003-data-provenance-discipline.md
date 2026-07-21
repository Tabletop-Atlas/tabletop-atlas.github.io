# 0003 — Data provenance discipline: absent over estimated, fact vs judgment, canon tripwires

Status: accepted
Date: 2026-07-21

## Context

This repo has a documented failure mode: agents invent data when a source cannot answer. It has
shipped fabricated OCFDU ratings, wrong elements on seven of nine spirits checked, and five
aspects that do not exist. The discipline that contains this was set in v1 and hardened in every
dataset since — aspects, tier lists (ADR 0001), cards (ADR 0005), the asset archive (ADR 0006),
innate thresholds — but it lived only as a warning in `CLAUDE.md` and as a pattern in the code,
never as a decision record. This ADR states it, so a future dataset inherits the rule by reading
one file rather than by osmosis. ADR 0001 and ADR 0004 are specific applications of it.

## Decision

Three rules govern every dataset in `src/data/`.

1. **A field a source cannot answer is absent, never estimated.** Absent is a legal, expected,
   common state — never null, never a default, never the middle band, never inherited. Examples in
   the code: `TierList.tiers` omits unrated keys; `TierList.players` is absent when the source
   never said; `Aspect.delta`/`shiftsToward` are absent until transcribed or where no honest axis
   read exists; `OtherCard` carries no elements/cost/speed because those cards have none. A partial
   record is never padded to look complete — `Spirit.startingCards` ships four names or none, never
   a partial array.

2. **Provenance lives on the data, distinguishing fact from judgment.** A value read from print is
   a fact; a value that is someone's read is judgment, and it says so *in the data*, not just in a
   comment: `ratingsSource: "estimate"` (OCFDU nobody has verified — absent means printed),
   `shiftsToward` (an aspect's axis lean), `tagsSource: "judgment"` (blight buckets),
   `impactSource`/`valenceSource: "judgment"` (fear/event ratings), `source: "wiki+tts"` (innate
   thresholds). Anyone reading the JSON in a year sees the provenance without opening `types.ts`.

3. **Every new or changed dataset ships with a canon tripwire test.** Modelled on
   `aspectCanon.test.ts`: a deliberate duplication of the dataset's expected shape and counts that
   fails loudly on drift — `adversaryCanon`, `tierListCanon`, `cardCanon`, `scenarioCanon`,
   `startingCardsCanon`, `innateCanon`, `valenceCanon`, and the guarded `archiveIntegrity` test. A
   tripwire protects against *drift, not fabrication*: it cannot know a scraper misheard a letter.
   That is what the judgment markers and human verification are for.

**Ambiguity escalates to the owner; it is never resolved by guessing.** When a source is genuinely
unclear the agent stops and asks. Recorded precedents: `normalizeExpansion()` escalated the
`Promo2` spelling rather than picking a box (owner call: `Promo2 → Feather & Flame`); the default
configurations list stayed the owner's board rather than guess which cited list a bare URL meant
(ADR 0002).

## Consequences

- Coverage that looks incomplete is correct, not a bug to tune away. The 3MBG list's 32 empty
  cells, and any future sourcing gap, are information about the source.
- A new dataset's checklist is fixed and nameable: absent-over-estimated, a provenance marker
  wherever the value is judgment, and a canon tripwire. Reviewers can hold new data to it.

## Left open, deliberately

**Nothing structural.** This ADR records existing discipline; it introduces no new mechanism. If a
future dataset needs a provenance state the current markers cannot express, extend the markers —
do not drop the rule.
