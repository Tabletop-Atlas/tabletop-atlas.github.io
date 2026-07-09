# v3 — tier lists as cited documents

Twelve issues, from `.scratch/v3/PRD.md`. A tier list becomes an entity: a cited document with an
author, a type, a player count, its own tier vocabulary, and a **partial** set of ratings.

Work the **frontier** — any issue whose blockers are all `done`. Clear context between issues.

**Status (2026-07-09): #01–#07, #09, #10 done.** The entity model, unrated bucket, rank-based
scoring, list picker, citation panel, player-count filtering, backup v2, personal lists, and the
existing-data spirit detail view all shipped in one session — see each issue's `## Comments`.
`typecheck`, `oxlint` and the full vitest suite (209 tests) are clean.

**#08, #11, #12 deliberately not attempted this session.** #08 needs the owner's real 3MBG
scraper output — no such file exists in the repo, and fabricating tier rankings from a video
nobody watched is exactly this repo's documented failure mode. #11 needs real panel/card images
sourced one spirit at a time (WebFetch + read, the way v2's aspect transcriptions were done) for
37 spirits — a large, slow retrieval job better run as its own pass. #12 is blocked on #11's
`startingCards` data. All three remain `ready-for-agent`.

```
01 entity ─┬─ 02 unrated ─┬─ 03 rank ──────────┐
           │              │                    ├─ 06 player count ─┐
           │              ├─ 04 picker ────────┴─ 05 citation ─────┴─ 08 3MBG list
           │              │        ├─ 07 backup v2
           │              │        └─ 09 fun list
           │              └─ 10 detail view ─┐
                                             ├─ 12 panel + card images
                               11 cards ─────┘
```

## Two things that are not tickets

- **The logo swap and centering the questionnaire.** An afternoon each. No design questions, no
  spec. Just do them.
- **Whether an unverified list may feed `recommend()` at all, or only display.** A one-line policy
  decision, deliberately left open. It is the owner's to make once real scraped lists exist and
  their quality is visible. #01's ADR records it as open.

## One decision the owner has already made

**Image rights: proceed, risk accepted (2026-07-09).** #11 takes the repo from 37 hosted images to
roughly 259. Personal project, no monetisation, worst realistic case is a takedown. The owner will
deal with consequences if they arrive; no ticket blocks on this.

This is an accepted risk, **not a finding that it is permitted**. GTG's community-content policy has
never been read. Attribution is not a licence. If anyone needs the real answer later, research it —
do not reconstruct it from memory, which is how this repo shipped five aspects that do not exist.

## Two things that are out of scope and should stay that way

- **Blending tier lists into a consensus ranking.** Averaging sources with different methodologies
  and coverage produces a number no source ever stated.
- **Authoring player-count deltas.** Deriving a solo tier from a four-player tier is the owner
  inventing data. Player count is metadata you select on.

## The hazard this release exists to contain

An LLM reading tiers off a YouTube transcript is [this repo's documented failure
mode](../v2/README.md#-this-repo-has-a-documented-failure-mode-agents-invent-data) — a plausible
guess where the source could not answer — with a loop around it. Three structural defences:

1. `verified` is `false` on every scraper output. The scraper cannot set it `true`.
2. `uncertain` and `unresolved` give the scraper somewhere to put doubt.
3. **An absent key is a legal, expected, common state.** The model never has to fill a cell.

#02 exists to make the third one true. `groupByTier`'s `?? FALLBACK_TIER` is the single line between
a partial list and 32 fabricated tiers, rendered under a named author on a public site. It is
deleted before any partial list is loadable.

Coverage will look bad — the 3MBG list leaves 32 of 68 unrated. That is the feature.
