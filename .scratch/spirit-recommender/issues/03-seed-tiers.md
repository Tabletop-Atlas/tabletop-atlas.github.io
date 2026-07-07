# 03 — Seed tiers.json (provisional community-consensus flat list)

Status: ready-for-agent

## Parent

`.scratch/spirit-recommender/PRD.md`

## What to build

Create `tiers.json`, a flat S/A/B/C/D tier assignment for every spirit, seeded from
general community-consensus strength (single-player-leaning, since that's where consensus is
clearest). This is a **provisional placeholder** the owner will refine against their YouTube
tier-list sources later.

- One tier (S/A/B/C/D) per spirit id, covering the full dataset from #02.
- Mark the file clearly as provisional/editable (a top-level comment or `"_note"` field).
- Flat only — **no per-player-count tiers** (that's out of scope for v1).

## Acceptance criteria

- [ ] `tiers.json` assigns a tier to every spirit in `spirits.json`
- [ ] File is flat (no player-count dimension)
- [ ] File is clearly marked provisional/editable
- [ ] Loadable by the tier store (#09) and tier prior (#05) without transformation

## Blocked by

- #01 (spirit ids / schema). Best done after #02 so all spirits are covered.
