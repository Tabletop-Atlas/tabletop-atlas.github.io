# 20 — Scenario difficulty: source it, then show it 🎨

Status: needs-info
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

- [x] A difficulty value with recorded provenance exists for every scenario that a verifiable
      source covers; unverifiable ones are absent and named, never estimated *(all 16 sourced —
      none unverifiable, see the fetch trail below)*
- [x] A tripwire test pins every sourced value (model: the adversary/aspect canon tests)
- [ ] Scenario tiles display the indicator; scenarios with absent difficulty show nothing (no
      placeholder value) *(ships with the winning variant — pick pending)*
- [ ] Variant round run and recorded (screenshots kept, scaffolding deleted) *(round run,
      screenshots in `../screenshots-20/`; scaffolding stays until the pick)*
- [ ] Browser-verified at 375px + desktop *(baseline + all three variants verified; the shipped
      winner re-verifies on close)*

## Comments

**Round prepared (2026-07-13) — OWNER PICK NEEDED, see the question at the end.**

**Sourcing (the ticket's step 1) is done, nothing estimated.** Every one of the 16 scenarios'
printed difficulty was transcribed verbatim from the Spirit Island Wiki on 2026-07-13:

- List page: `https://spiritislandwiki.com/index.php?title=List_of_Scenarios` (raw wikitext
  fetched via `&action=raw`) — gives all difficulties in one sortable table.
- Ambiguous entries cross-checked against their own pages' infobox `|difficulty=` line, same
  raw-wikitext method: `Second_Wave` (`+/- 1`), `Powers_Long_Forgotten` (`1*`),
  `Elemental_Invocation` (`1*`), `Destiny_Unfolds` (`-1*`), `Surges_of_Colonization` (`+2/+7`),
  `Varied_Terrains` (`2`).
- Values are stored as **verbatim strings** (`"1*"`, `"-1*"`, `"+/- 1"`), not parsed numbers —
  the wiki's qualifiers mean "varies"; collapsing them would be estimation (CLAUDE.md).
- One derived reading, recorded here and in the tripwire header: the wiki prints a single
  `+2/+7` for Surges of Colonization; our dataset's two rows split it — Normal Surges `+2`,
  Larger Surges `+7` — per the scenario page's own "LARGER SURGES (HIGHER DIFFICULTY)" rules
  text.

Shipped now: `difficulty` on `scenarios.json` (provenance in its `_note`, pointing here),
`Scenario.difficulty: string`, and `scenarioCanon.test.ts` pinning all 16 values plus
count/uniqueness (373/373 passing). Note for a future unverifiable scenario: the field is
typed required today because all 16 are sourced; the canon test's length-16 pin forces a
conscious revisit if a 17th arrives.

**The variant round (step 2) is live and awaiting the pick.** On the Archive's Scenarios grid,
production build, gated on `?variant=` — nothing changes without the param (verified
byte-identical baseline):

- **`?variant=A` — Corner badge:** the verbatim value in a dark pill on the tile's top-right.
- **`?variant=B` — Caption strip:** a text line under each tile — name + "Difficulty N".
- **`?variant=C` — Banded frame:** tile edge tinted by difficulty band (green ≤0, yellow 1–2,
  orange 3–4, red 5+), verbatim value in a corner tab. *Caveat for this one: a colour is
  necessarily a numeric reading of qualified values — `+/- 1` bands by its figure 1, `-1*` by
  -1. The printed text stays verbatim in all variants.*

Floating switcher bottom-right (A/B/C/off). Screenshots at 375px + 1280px for baseline and all
three variants: `../screenshots-20/`. Verified in Playwright against the production build: all
16 values render per variant (including `+/- 1`, `+7`, `-1*`), switcher round-trips, no
horizontal overflow at 375px. Code review (two-axis): two hard findings fixed pre-commit — the
dataset `_note` pointed at a fetch trail not yet written (this comment is it), and
`difficultyBand` misparsed `+/- 1` as -1 (banding Second Wave easiest); the parse now takes
the first signed figure.

**Question for the owner: which treatment ships — A (corner badge), B (caption strip), or C
(banded frame)?** Open the Archive → Scenarios → Grid with `?variant=A|B|C` appended to the
URL, or use the floating switcher. On your pick: the winner is rewritten properly (shared tile
code, no inline styles), the scaffolding file is deleted, the rows view stays untouched, and
this ticket closes.
