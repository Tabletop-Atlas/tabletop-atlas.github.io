# 09 — Tier list tab + store + persistence

Status: ready-for-agent

## Parent

`.scratch/spirit-recommender/PRD.md`

## What to build

The editable tier list (its own tab) plus the persistence layer for it and the last
questionnaire answers.

- **Tier store (Seam 4)** — a module with public API `getTier(id)`, `setTier(id, tier)`,
  `reset()`. Seeds from `tiers.json` (#03), overlays user edits in `localStorage`. Tests go
  through the public API only, never poking `localStorage` directly.
- **Tier list tab** — spirits grouped under S/A/B/C/D headers, each spirit with a per-spirit
  S/A/B/C/D control (segmented control or dropdown) to reassign. **No drag-and-drop**
  (that's v2). A reset-to-default action. Spirit art or placeholder shown per tile.
- **Persistence** — also persist the last questionnaire answers so the recommender restores
  the user's last setup on reload.
- The tier store is the source the tier prior (#05) reads once available (until then #05 uses
  the raw `tiers.json` seed).

## Acceptance criteria

- [ ] Tier store: `setTier` then `getTier` round-trips; `reset` restores the seed; edits survive a simulated reload (tested via public API)
- [ ] Tier tab lists spirits by tier with a per-spirit reassignment control
- [ ] Tier edits persist across page refresh
- [ ] Last questionnaire answers persist and restore on reload
- [ ] Reset returns the tier list to the shipped default

## Blocked by

- #01 (schema). Seeds from #03 (`tiers.json`).
