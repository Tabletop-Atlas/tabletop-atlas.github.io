# Baseline-aware probability exploration (brainstorm)

Status: needs-triage
Labels: wayfinder:brainstorm
Map: ../MAP.md

## Idea

Spun off from the [#05 scope decision](05-threshold-odds-in-scope.md) (2026-07-21). The
dashboard's gap-odds view deliberately stays deck-only and static. But the owner's real
question mid-game is baseline-aware: "given everything my spirit already shows, what are my
odds of hitting this threshold?" Elements come from more than deck draws:

- **Presence-track uncovering** — some growth tracks carry element slots; as presence lifts,
  the spirit's standing element baseline grows over the game.
- **Unique powers** — a spirit's starting hand has a fixed element profile; "odds my spirit
  itself shows element X" is answerable from unique-card data alone.
- **Card-count focus** — spirits that play many cards per turn reach thresholds differently
  than one-big-card spirits; raw per-draw odds miss this.

A future effort here would explore what a baseline-aware odds tool looks like — possibly with
user-entered board state, which crosses the map's out-of-scope line on live in-game tracking
and therefore belongs to a **future effort, redrawn from scratch** (the map's own words for
that line), not this dashboard.

Data notes: presence-track elements would need a new sourced dataset (not covered by
[../innate-thresholds-research.md](../innate-thresholds-research.md)); unique-card elements
already exist in `power-cards.json`; innate thresholds will exist once the #05 follow-up spec
ships its transcription.

## Comments
