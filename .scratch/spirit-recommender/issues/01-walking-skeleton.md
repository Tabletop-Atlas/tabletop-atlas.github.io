# 01 — Walking skeleton: scaffold + seed data + rank-by-axis board

Status: ready-for-agent

## Parent

`.scratch/spirit-recommender/PRD.md`

Read the PRD, `HANDOFF_spirit_island_recommender.md` (authoritative OCFDU table), and
`CLAUDE.md` before starting. This issue is the entry point for the whole build — later
issues reference the structures you establish here.

## What to build

The thinnest end-to-end tracer bullet: a Vite + React + TypeScript app that loads a small
seed dataset, runs a pure scoring function, and renders a ranked list of spirits on screen.
This proves the full data → domain → UI → test path before any real feature lands.

- Scaffold Vite + React + TS (`npm create vite@latest . -- --template react-ts`). Set Vite
  `base: '/spirit-island/'` immediately.
- Define the `Spirit` TypeScript type and create `spirits.json` with **~4 hand-entered seed
  spirits** conforming to the full PRD schema (`name`, `expansion`, `complexity`, `ratings`
  {offense, control, fear, defense, utility}, `elements`, `summary`, `tags`, `aspects`
  [{name, delta, shiftsToward}], `notes`). Use real spirits from the HANDOFF (e.g.
  Lightning, River, Vital Strength, Bringer) so downstream tests have meaningful data.
- Implement the **scoring engine** (Seam 1) as a framework-free pure module:
  `recommend(spirits, weights) → RankedSpirit[]` using a weighted dot product over OCFDU.
  For this slice a single-axis weight (e.g. offense only) is enough — the full weight vector
  arrives in #04.
- Render a bare results list (spirit name + OCFDU numbers, ordered by score). No styling
  beyond default; a hardcoded weight is fine.
- Establish the test harness (Vitest) and write the first scoring test against a fixture
  spirit set: high offense weight ranks the high-offense spirit first.

## Acceptance criteria

- [ ] App scaffolds, runs with `npm run dev`, and builds with `npm run build`
- [ ] `vite.config` sets `base: '/spirit-island/'`
- [ ] `spirits.json` exists with ~4 seed spirits matching the full PRD schema
- [ ] `recommend()` is a pure module importable without React, returning a deterministic ranked list
- [ ] The page renders the seed spirits ranked by score
- [ ] At least one passing scoring test asserts ranking behavior against fixtures
- [ ] The domain layer imports nothing from React (framework-free)

## Blocked by

None - can start immediately.
