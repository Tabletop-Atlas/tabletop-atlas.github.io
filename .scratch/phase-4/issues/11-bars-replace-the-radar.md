# 11 — Bars replace the radar

Status: ready-for-agent
Parent: [Phase 4 PRD](../PRD.md) · cluster 1 (honest fixes)

## Blocked by

None — can start immediately.

## What to build

The spirit detail's OCFDU block becomes the labelled-bars profile that won the
[#03 prototype](03-the-radar-chart-fix-or-replace.md) (decision screenshot:
`../screenshots-03/winner-B-labelled-bars.png` — this is a settled decision, no new variant
round): five rows — full-word axis label (Offense, Control, Fear, Defense, Utility), a thin
accent bar against a track **scaled to max 5**, the value figure at the right — followed by an
Elements chip row (sourced data the detail never showed). The ratings-estimate note stays.

The radar component is deleted outright, which also removes the recommender result rows' 80px
thumbnail — dropped with no replacement (owner's call: the full profile is one click away).

## Acceptance criteria

- [ ] Every spirit's detail shows the five labelled bars with value figures; a 5-rated axis
      reaches the full track
- [ ] Elements render as chips in the profile block; the estimate note behaviour is unchanged
- [ ] The radar component no longer exists anywhere in the codebase
- [ ] Recommender result rows carry no profile thumbnail
- [ ] Browser-verified (production build, 375px + desktop) per repo convention
