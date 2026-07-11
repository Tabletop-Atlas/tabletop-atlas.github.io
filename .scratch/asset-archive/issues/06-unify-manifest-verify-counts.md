# 06 — Unify the manifest and build the guarded archive test

Status: done
Labels: wayfinder:task
Assignee: agent

## Parent

`.scratch/asset-archive/MAP.md` and [PRD.md](../PRD.md) — read the map's Notes and
[REFERENCE.md](../REFERENCE.md) first.

## Question

Merge the per-source manifest rows (#02, #03, #04, #05) into one committed manifest, and make the
verification permanent: the PRD's **guarded archive test** is the verifier — do not write a
throwaway checking script and a test.

- One committed file, `images/manifest.json`: new filename → source URL → asset type → associated
  spirit (where applicable) → source (SICK / wiki / TTS mod).
- Git contract: `.gitignore` rules so `images/` is untracked **except** the manifest. (Owner's
  policy, 2026-07-11.)
- TTS rows need the mod's citation (Workshop URL/name). If #01 didn't find it inside the JSON,
  ask the owner — one line, HITL — rather than leaving the field blank or inventing it.
- **The guarded test** lives alongside the other data-integrity tests (prior art: the aspect and
  adversary canon tripwires). When the archive directory is absent it skips itself; when present
  it asserts:
  - every manifest row's file exists, and every archive file has a manifest row
  - sanity counts: aspects 31, adversaries 8, scenarios 15, panel fronts 37, lore backs 37,
    events ≈ 64 — reporting mismatches, tolerating only gaps explicitly flagged by #04/#05
  - power/fear/blight counts derived from cards.js data captured in the manifest, not hard-coded
- Cleanup: delete the old URL-mangled directories once their contents are confirmed renamed and
  manifested.

## Acceptance criteria

- [ ] One committed manifest; the rest of the archive directory git-ignored
- [ ] The guarded test passes with the archive present and skips (suite stays green) without it
- [ ] Manifest ↔ disk is bidirectionally complete under the test
- [ ] All sanity counts enforced by the test, none hard-coded where cards.js can supply them
- [ ] TTS rows carry a real citation, sourced or asked for — never invented
- [ ] Raw URL-mangled directories removed, every former file accounted for in the scheme
- [ ] Resolution records the final counts table and every remaining gap

## Blocked by

- #02
- #03
- #04
- #05

## Comments

**Merged 616 rows** from #02/#03/#04/#05's per-source manifests into one committed
`images/manifest.json` (file, source_url, asset_type, spirit, name, source_site; TTS rows also
carry `mod_name`/`mod_workshop_url`). Verified bidirectionally complete before and after cleanup
(every row's file exists on disk, every on-disk file has a row) — case-insensitively, since
`images/Scenarios` and `images/scenarios` are the same directory on this filesystem.

**Git contract**: `.gitignore` gained `images/*` + `!images/manifest.json` — verified with
`git check-ignore` that the manifest is tracked and everything else under `images/` (spirit art,
cards, panels, the raw TTS JSON) is ignored.

**TTS citation**: #01 confirmed no Workshop URL string exists anywhere in the mod JSON. Rather
than invent one, every TTS-sourced row carries the mod's own `SaveName` ("Spirit Island - [By MJ
& iakona]") as `mod_name` — a real citation pulled from the source file — and an explicit
`mod_workshop_url: null`. **This is the one open HITL ask this whole effort produced**: the owner
knows which Steam Workshop listing they subscribed to; nothing else in the archive found it.

**Guarded test**: `src/domain/__tests__/assetArchive.test.ts`, alongside the aspect/adversary
canon tests. Skips (via `describe.skip`, not a runtime `if`) when `images/` is absent or empty —
verified both ways: 8/8 pass with the archive present, 8/8 skip cleanly with `images/` moved
aside. One subtlety caught by testing the skip path directly: `describe.skip`'s factory function
still runs eagerly in vitest, so an eager `readFileSync(manifest.json)` at describe-body scope
threw even when skipped — fixed by loading the manifest lazily inside each `it`.

Pinned as literals (matching aspectCanon/adversaryCanon's precedent, since these are printed
game-box counts, not inferred): 31 aspects, 8 adversaries, 37 panel fronts, 37 lore backs, 15
distinct scenarios (Surges of Colonization's two setup variants collapse to one scenario, same
reconciliation #05 documented), events in [60, 70] for the PRD's "~64". **Power/minor/major/fear/
blight are deliberately not pinned to a magic number** — REFERENCE.md gives no single printed
count for these (they vary by which expansions are owned), so the test instead asserts the
manifest's own per-type counts (populated from cards.js by #02) match what's actually on disk,
making cards.js the source of truth rather than a hard-coded literal in test source.

**Cleanup — done, with explicit sign-off** (deletion of pre-existing files needs owner
confirmation regardless of ticket text; asked before running `rm`): `images/Spirit Panels/` (74
files) and `images/Adversary/` (8 files) removed entirely; the 32 raw `https...`-named files
inside the shared `images/Scenarios`/`images/scenarios` directory removed, leaving only the 32
newly-named scenario files. Re-ran the bidirectional manifest check after deletion — still 0
missing.

**Final counts table:**

| asset type            | count |
|------------------------|------:|
| unique_power           |   153 |
| minor_power             |   101 |
| major_power             |    78 |
| event                   |    65 |
| fear                    |    50 |
| blight                  |    24 |
| aspect_card             |    31 |
| panel_front             |    37 |
| panel_back_lore         |    37 |
| adversary_panel         |     8 |
| scenario_front          |    16 (15 scenarios + Varied Terrains' orphan single file) |
| scenario_back           |    15 |
| scenario_shared_component |   1 (Scenario Pieces — not one of the 15) |
| **total**               | **616** |

No unflagged gaps remain. The only open item is the TTS Workshop URL HITL ask above.
