# 02 — Avatar chip component

Status: done
Parent: ../PRD.md

## What to build

One reusable chip component: a circular (center-cropped) avatar plus a visible name, used
identically for spirits, adversaries and scenarios.

- Spirit art resolves as `SpiritArt` does (`spirits/<image ?? id>.webp`) and reuses its
  `PlaceholderArt` fallback.
- Adversary/scenario art resolves via `slugify(name)` → `public/adversaries|scenarios/<slug>.webp`,
  with an equivalent graceful fallback when the file is missing.
- Accepts the 480×218 landscape art being center-cropped to a circle.
- The name is always visible beside the avatar (not hover-only), so a chip is scannable on touch and
  by skim.

Standalone component in this ticket — its consumer (the history table) is ticket 03.

## Acceptance criteria

- [ ] A single component renders a circular avatar + name for a spirit, an adversary, and a scenario.
- [ ] A missing image degrades to the placeholder fallback instead of a broken image.
- [ ] The name is always rendered (not hidden behind hover).
- [ ] `appSmoke.test.tsx` renders the chip in each of the three entity modes without crashing.

## Blocked by

- None — can start immediately (parallel to 01).
