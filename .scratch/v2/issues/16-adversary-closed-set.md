# 16 — Record the adversary from a closed set, not free text

Status: ready-for-agent

## Parent

`.scratch/v2/PRD.md`

## What to build

The game log records the adversary as a free-text `<input>`. Adversaries are a closed,
published set. Free text means "England", "england" and "Engalnd" become three distinct keys
in the *win rate by adversary* statistic, which quietly answers story 26 wrong.

The PRD's rationale for storing the adversary at all is that it "lets the log answer *how do I
do against England?* later". A typo-fragmented column cannot answer that.

Make it a `<select>`, exactly like the configuration picker directly above it in the same
form. The adversary's level range is likewise published, not arbitrary.

**Provenance rule — this issue's real risk.** This project has shipped fabricated Horizons
ratings, fabricated elements, and five fabricated aspects. Do not type the adversary list from
memory. Transcribe it from a citable source, add it to the dataset as data with a tripwire
test pinning the list (as `aspectCanon.test.ts` does), and record where it came from. **If you
cannot source the list, leave the field as free text and say so in a comment on this issue.**
A guessed list is worse than the typo problem it fixes.

Existing log entries hold whatever free text was typed. Do not migrate or rewrite them; an
unrecognised adversary string should still display and still count in the statistics.

## Acceptance criteria

- [ ] The adversary list lives in the dataset with its source recorded, not inline in the component
- [ ] A tripwire test pins the adversary list and their level ranges
- [ ] Recording a game picks the adversary from a select, and its level is constrained to that adversary's published range
- [ ] `byAdversary` statistics no longer fragment on case or typo for newly recorded games
- [ ] Previously logged free-text adversaries still render and still count
- [ ] If the list could not be sourced, the field stays free text and the issue is commented rather than guessed at

## Blocked by

- None — can start immediately

## Comments

Resolved, and sourced (not from memory): fetched each adversary's page individually from the
Spirit Island Wiki (spiritislandwiki.com) via WebFetch on 2026-07-09 — the base-game three
(Brandenburg-Prussia, England, Sweden), France (Branch and Claw), Habsburg Monarchy and Russia
(Jagged Earth), Scotland (Promo Pack 2/Feather and Flame), and Habsburg Mining Expedition
(Nature Incarnate). Every adversary's own page independently confirmed the same 0-6 level
range — not assumed from one and applied to the rest. Recorded in
`src/data/adversaries.json` with the fetch trail in its `_note`, loaded via
`src/domain/adversaries.ts`, and pinned by `adversaryCanon.test.ts`. `GameLog.tsx`'s adversary
input is now a `<select>` over this set; the level input clamps to the selected adversary's
`minLevel`/`maxLevel` on both adversary change and level entry (typed or spun). Existing
free-text log entries are untouched and still render/count.
