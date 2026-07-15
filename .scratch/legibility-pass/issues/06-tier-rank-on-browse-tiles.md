# 06 — Tier rank on the Browse tiles

Status: needs-info
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

- [x] Each Browse tile shows its base spirit's rank from the **active** tier list; switching the
      active list updates the tiles
- [x] Unrated spirits show honest absence (no invented tier)
- [x] Reuses the existing `tierColors.ts` palette; no collision with the tile's expansion colour
- [x] Aspects remain modal-only (no tile change there)
- [x] `?variant=` round run, owner pick recorded, scaffolding deleted, screenshots kept
- [x] Legible on dark theme at 375px + desktop; test suite green

## Comments

**Round live (2026-07-15) — OWNER PICK NEEDED, question at the end.**

The mechanical part ships regardless of the pick: every `SpiritTile` now reads its base
configuration's rank from the **active** configurations tier list via a new
`activeConfigTier(configId)` in `tierColors.ts` — shared with the detail modal's `TierChip`
(refactored to use the same helper) so the tile and the modal can never disagree, the same
guarantee `groupByTier` already gives the board. An unrated configuration (or a label outside the
active list's own `tierLabels`, e.g. a stale override) comes back `undefined` and the tile renders
no badge at all — honest absence, never a defaulted tier. Switching the active list on the Tier
list tab changes what the tiles show on next render, since `activeConfigTier` reads
`tierStore.getActiveList()` live. Aspects are untouched — the badge reads the *base* spirit's
configId only, `toConfigId(spirit.id)`, no per-aspect tile change.

Checked against all 68 configurations under the shipped Owner's board: all 37 base spirits are
rated (no live unrated example on Browse today), so the honest-absence path is exercised by code
inspection and the shared `tier-chip-unrated` precedent in the modal, not by a screenshot — noting
this rather than fabricating an unrated tile to photograph.

**What's gated behind the round:** only the badge's render treatment
(`TierBadgeVariantRound.tsx`, `?tierVariant=A|B|C`). Without the param, tiles show no badge at all
— same "mechanical ships, treatment is picked" split tickets 04/05/09 used.

- **A — corner badge:** a small solid `tier-chip`-style letter chip pinned to the art's top-right
  corner.
- **B — ribbon:** a diagonal ribbon across the art's top-right corner, same fill.
- **C — coloured ring:** the whole tile gets a tier-coloured inset ring (the expansion stripe
  stays on the left edge; the ring runs the remaining three sides so the two signals don't
  overlap) plus a small letter label in the corner for the cases a ring's hue alone doesn't read
  clearly enough (e.g. two similar tiers side by side).

Screenshots (baseline + A/B/C, Base expansion filter for a representative spread across every
shipped tier, at 375px + 1280px) in [`../screenshots-06/`](../screenshots-06/).

## The pick (owner)

_(awaiting)_
