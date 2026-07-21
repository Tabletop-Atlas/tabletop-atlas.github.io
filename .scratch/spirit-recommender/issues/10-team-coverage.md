# 10 — Team coverage panel + gap-nudge

Status: done

## Parent

`.scratch/spirit-recommender/PRD.md`

## What to build

Multiplayer support: factual team coverage and a deterministic nudge toward filling gaps.

- **`analyzeTeam(chosenSpirits)` pure module (Seam 3)** — returns `{ elementCoverage,
  roleGaps }` from pure arithmetic over teammates' OCFDU vectors and element tags. Role gaps
  are dimensions the team is collectively weak/absent in (e.g. "no Defense", "zero Fear
  generation"). **No synergy/combo reasoning** — that's v2.
- **Teammates input** — a way to enter the spirits teammates have already picked.
- **Coverage panel** — displays element spread and role gaps at a glance.
- **"Tune toward the gaps"** — a one-click action that nudges the user's preference weights
  toward the missing roles (a Defense gap bumps the Defense weight), then re-ranks. Fully
  deterministic — same OCFDU machinery, no invented synergy logic.

## Acceptance criteria

- [ ] `analyzeTeam` is pure and tested: three offense spirits report a Defense gap + zero Fear generation; element coverage is the union of teammates' elements
- [ ] Teammates' chosen spirits can be entered in the UI
- [ ] Coverage panel shows element spread and role gaps
- [ ] "Tune toward the gaps" bumps the relevant weights and re-ranks the board
- [ ] No synergy/combo logic is introduced

## Blocked by

- #04 (weights + board to nudge and re-rank)
