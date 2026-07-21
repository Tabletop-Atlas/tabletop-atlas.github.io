# 02 — Populate full spirits.json dataset

Status: done

## Parent

`.scratch/spirit-recommender/PRD.md`

## What to build

Expand the seed `spirits.json` from #01 into the full dataset for all ~40 spirits, matching
the established schema.

- **Transcribe the 32 spirits in the HANDOFF OCFDU table** — these numbers and complexity
  values are **authoritative (from print)**. Do not alter them.
- **Fetch the 5 Horizons spirits from the Spirit Island wiki** (Devouring Teeth Lurk
  Underfoot, Eyes Watch From the Trees, Fathomless Mud of the Swamp, Rising Heat of Stone
  and Sand, Sun-Bright Whirlwind): printed OCFDU + complexity (all expected Low).
- **Author a 1–2 sentence "how it plays" summary** per spirit, sanity-checking the bracketed
  icon interpretations in the HANDOFF against the wiki. **Flag any summary where the
  interpretation was uncertain** (e.g. a `"reviewNeeded": true` field or a comment list at
  the bottom of this issue) for morning human review.
- Populate `elements`, `tags` (playstyle vocabulary from the PRD), and `aspects`
  [{name, delta, shiftsToward}]. `shiftsToward` is a lightweight axis hint (e.g. `+utility`)
  derived from the wiki's aspect description — not a full OCFDU delta. Populate `notes` with
  player-count / setup quirks where the source mentions them.

## Acceptance criteria

- [ ] All ~40 spirits present in `spirits.json`, schema-valid
- [ ] The 32 HANDOFF spirits carry the exact printed OCFDU + complexity
- [ ] The 5 Horizons spirits added with wiki-sourced OCFDU + complexity
- [ ] Every spirit has a summary; uncertain interpretations are flagged for review
- [ ] Aspects populated with `shiftsToward` hints where aspects exist
- [ ] Existing scoring tests still pass against the enlarged dataset

## Blocked by

- #01 (defines the schema and `Spirit` type)
