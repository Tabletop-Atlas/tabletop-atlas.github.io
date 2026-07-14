# 06 — Tier rank on the Browse tiles

Status: ready-for-human
Label: wayfinder:prototype (HITL — owner picks the look)
Parent: [Legibility-pass map](../MAP.md)

## Blocked by

_(nothing — independent of the colouring/subtype work)_

## Question

The owner wants a spirit's **tier-list ranking visible directly on the Browse grid**, not only after
opening the detail modal. Today `SpiritTile` (`src/components/SpiritTile.tsx`) shows expansion,
complexity, tags, and an aspects toggle — but **no tier rank**; tier appears only inside the modal
via `TierChip` reading `tierStore.getActiveList()` (`SpiritDetail.tsx:28-37`).

Owner decisions locked at charting:
- The badge is driven by the **active tier list** (updates when the user switches lists).
- **Aspects stay in the modal** — the tile shows the base spirit's tier rank only, not per-aspect
  configurations. (The active list ranks *configurations*; a base spirit maps to its base-config
  entry — confirm that lookup and handle a spirit that's **unrated** in the active list honestly:
  show nothing / an "unrated" marker, never a fabricated tier.)

**What does the badge look like and where does it sit** on the tile — a corner tier letter/label
chip reusing `tierColors.ts`, a ribbon, a coloured border? It must not collide visually with the
expansion stripe/chip already on the tile. Run a `?variant=` round; the **owner picks**; ship the
winner.

## Acceptance criteria

- [ ] Each Browse tile shows its base spirit's rank from the **active** tier list; switching the
      active list updates the tiles
- [ ] Unrated spirits show honest absence (no invented tier)
- [ ] Reuses the existing `tierColors.ts` palette; no collision with the tile's expansion colour
- [ ] Aspects remain modal-only (no tile change there)
- [ ] `?variant=` round run, owner pick recorded, scaffolding deleted, screenshots kept
- [ ] Legible on dark theme at 375px + desktop; test suite green
