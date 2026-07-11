# 08 — Land the 3MBG solo list

Status: done

## Parent

`.scratch/v3/PRD.md`

## What to build

The first cited list arrives: 3 Minute Board Games' solo ranking, scraped from a video transcript by
the owner's out-of-repo scraper against the contract in `.scratch/v3/tier-list-schema.md`.

- The list lands as one file under `src/data/tier-lists/`: `type: 'strength'`, `players: 1`,
  `origin: 'cited'`, six labels (`S A B C D F`), `verified: false`, with its `source` block.
- It covers **36 of 37 base spirits** — it never mentions Fathomless Mud of the Swamp — and **none**
  of the 31 aspects. Those 32 keys are **absent**. Not `null`, not `B`, not inherited.
- `tierListCanon.test.ts` extends to pin it: every `configId` resolves, every label is in
  `tierLabels`, the source has a URL.
- `uncertain` and `unresolved` come through from the scraper and are preserved in the file.

**Nothing in this ticket fills a hole.** The moment this list loads, the Unrated bucket holds 32 of
68 configurations. That is not a defect to be tuned away — it is the app finally telling the truth
about what the source did and did not say. Coverage will read "rated 36 of 68", and the unverified
badge will be showing.

A tripwire protects against **drift, not fabrication**. This test cannot tell you the scraper
misheard a letter. That is what `verified: false`, `uncertain` and `unresolved` are for, and
verification remains a human job.

## Acceptance criteria

- [ ] The 3MBG list ships as a file under `src/data/tier-lists/`, matching the published schema
- [ ] `tiers` has exactly the keys the source rated; no aspect key appears; no
      `fathomless-mud-of-the-swamp` key appears
- [ ] `verified` is `false`
- [ ] `tierListCanon.test.ts` covers it and fails if a `configId` is unknown to `spirits.json`
- [ ] `tierListCanon.test.ts` fails if a label appears in `tiers` that is not in `tierLabels`
- [ ] Selecting the list at 1 player shows six bands and an Unrated bucket holding 32 configurations
- [ ] The recommender scoring against it does not promote or bury the 32 unrated configurations
- [ ] Any name the scraper could not resolve appears in `unresolved` in the file, not dropped

## Blocked by

- #02 (a partial list must not be loadable before `FALLBACK_TIER` is gone)
- #05 (a cited list must show its citation the moment it is visible)
- #06 (a solo list is unreachable until player count selects lists)

## Comments

Owner pasted the scraped tiers (36 base spirits, no aspects) directly as JSON, same as
`sia-favorites-fun-solo-2026.json`'s "owner-provided transcript" path. No `uncertain` or
`unresolved` entries were supplied. Landed as `src/data/tier-lists/3mbg-strength-solo-2025.json`
and registered in `tierStore.ts`'s `SHIPPED_LISTS`. `tierListCanon.test.ts` extended with a
duplication tripwire (36 expected keys), an aspect-exclusion check, and a Fathomless-Mud-absence
check. 232 tests pass, `tsc -b` and `oxlint` clean.
