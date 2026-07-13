# 13 — The homepage 🎨

Status: ready-for-agent
Parent: [Phase 4 PRD](../PRD.md) · cluster 3 (app restructure)

## Blocked by

None — can start immediately.

## What to build

The app's front door, per the [homepage resolution](01-the-homepage.md): every visit boots to a
homepage that orients and routes. One line on the game (linking out to the official site), one
line on the app ("an unofficial fan-made companion…"), three intent-phrased doors as art-backed
tiles using already-hosted spirit art — "Explore every spirit → Browse" first, then "Not sure
what to play? → Recommend", then "How do they rank? → Tier list" — and a footer disclaimer:
unofficial, fan-made, non-commercial, not affiliated with the rights holders. The logo becomes
the clickable route home (no Home nav button; no nav item active on the homepage), and nav
reorders to start with Browse. Nothing on the page may go stale.

**Variant round (HITL):** before finalising, present 2–3 *structurally different* homepage
layouts on the live app via the repo's `?variant=` + floating-switcher pattern (see the #03
prototype precedent). The owner picks; the winner ships properly; the switcher and losing
variants are deleted; round screenshots are kept in `../screenshots-13/`.

## Acceptance criteria

- [ ] Every boot lands on the homepage; the logo returns home from any tab; no Home nav button
- [ ] The three doors navigate to their surfaces; Archive/Log/Settings remain nav-only
- [ ] Framing lines and the fan-content disclaimer are present; the game line links out
- [ ] Nav order starts with Browse ("Recommended" demoted per the locked call)
- [ ] App smoke asserts boot view, logo click, and nav order
- [ ] Variant round run and recorded (screenshots kept, scaffolding deleted)
- [ ] Browser-verified at 375px + desktop; door tiles don't overflow
