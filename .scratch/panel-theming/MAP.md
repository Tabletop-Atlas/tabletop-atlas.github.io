# Wayfinder map — Panel theming for the spirit detail modal

Label: wayfinder:map
Charted: 2026-07-13 (grilling session with the owner)

## Destination

The spirit detail modal wears an owner-picked, panel-aligned visual treatment — shipped as its
default look, round scaffolding deleted — plus the owner's one-line verdict on whether the
aesthetic spreads to further surfaces. Spreading itself is beyond this map.

## Notes

- **The spec:** [PRD.md](PRD.md) — the assembled contract the tickets build against (published
  via /to-spec after charting; the map remains the work plan).
- **Execution override:** this map carries execution for the modal — the winning treatment
  ships inside the map (ticket [03](issues/03-ship-the-winner.md)), matching how the phase-4
  rounds (#20–#22) were worked. Everything else stays decisions.
- **Locked at charting (owner, 2026-07-13):**
  - Scope: the detail modal only. No other surface changes on this map.
  - The round explores BOTH a light true-parchment treatment and a dark translation — the
    owner reacts to renders rather than deciding light-vs-dark in the abstract.
  - The OCFDU widget's form is re-opened: variants may replace #23's vertical bars with
    panel-style nodes (the presence-track idiom). Keep one conservative bars variant as anchor.
  - **Fidelity: vibe, not replica.** Borrow palette, node idiom, and typographic hierarchy;
    no pixel-matching of panel chrome/borders/layout (trade-dress unknown per
    `.scratch/phase-4/official-assets-research.md`, and the next edition obsoletes the look).
- **HITL rule (standing):** variant rounds are decided by the OWNER's pick, never the agent —
  candidates behind a query param (`?panel=`, namespaced; the #20–#22 pattern), ticket waits at
  `needs-info` until the pick.
- Skills per ticket type: `/prototype` for the round, `/grilling` for the verdict. Verify
  against the production build at 375px + desktop; screenshots to `screenshots-NN/`.
- Data honesty carries over: OCFDU figures render true (a transcribed 6 shows 6), unrated is
  absent — #11's rules survive any restyle.

## Decisions so far

<!-- one line per closed ticket: gist + link -->

- **[01 vibe sheet](issues/01-panel-vibe-sheet.md) (done):** panel palette sampled off six panel
  fronts → [panel-vibe-sheet.md](panel-vibe-sheet.md). Parchment `#e7d19c`, ink `#2e2520`,
  gold/band accents, presence green, innate rust; node idiom + type hierarchy on the shipped
  faces; dark-translations proposed. The round builds from these, not guesses.
- **[02 variant round](issues/02-the-modal-variant-round.md) (owner picked C):** three
  compositions behind `?panel=A|B|C` (A light parchment + nodes, B dark + nodes, C dark + retinted
  bars). Owner's pick: **C**, no reaction notes. Screenshots in `screenshots-02/`.
- **[03 ship the winner](issues/03-ship-the-winner.md) (done):** C is the modal's default —
  `PANEL_COLOR` in `tagColors.ts` injected as `--panel-*` vars, retinted #23 bars, cascade-safe
  `.modal.spirit-detail` rules. Round scaffolding deleted, `?panel=` inert. Collision + smoke
  tests added (384 pass). Pre-existing 375px name-clip fixed in passing.
- **[04 spread verdict](issues/04-the-spread-verdict.md) (done):** owner's verdict — spread is
  wanted but **deferred**; finish this map here. No surface chartered, nothing built. A future
  session (`/handoff`) charts the spread as its own wayfinder effort, consuming this effort's vibe
  sheet + `PANEL_COLOR` as prior art.

## Status: COMPLETE (2026-07-13)

All four tickets closed. The spirit detail modal wears the owner-picked panel treatment (C);
scaffolding deleted; the spread verdict is recorded (yes-in-principle, deferred). Nothing on this
effort is left to decide.

## Not yet specified

- If a light-parchment variant wins: how the modal's dark-tuned chip systems (tier chips, tag
  chips, expansion chip, element chips) adapt to a light surface — their palettes were built
  for the dark theme. Not sharp until the pick lands.

## Out of scope

- Retheming any surface beyond the detail modal (Browse, tier board, Archive, app shell) — the
  spread verdict (ticket 04) may spawn a NEW effort, but the work is past this destination.
- Pixel-faithful panel recreation — ruled out at charting (fidelity: vibe, not replica).
- Fonts/icons sourcing — settled by phase-4 #22 and the official-assets research; this map
  consumes those decisions, it doesn't reopen them.
