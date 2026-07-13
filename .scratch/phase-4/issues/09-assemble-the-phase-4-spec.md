# 09 — Assemble the Phase 4 spec

Status: needs-triage
Assignee: Adam (spec-assembly session, 2026-07-13 — waiting on #05's research to land)
Type: wayfinder:task (AFK)
Parent: [phase-4 map](../MAP.md)

## Blocked by

- [#01 the homepage](01-the-homepage.md)
- [#02 the Settings tab](02-the-settings-tab.md)
- [#03 the radar chart: fix or replace](03-the-radar-chart-fix-or-replace.md)
- [#04 the Archive's structure](04-the-archives-structure.md)
- [#05 official assets and licensing](05-official-assets-and-licensing.md)
- [#06 multi-tier-list architecture](06-multi-tier-list-architecture.md)
- [#07 tier list ↔ browser interconnect](07-tier-list-browser-interconnect.md)
- [#08 the recommender's short-term shape](08-the-recommenders-short-term-shape.md)

## Question

Nothing to decide — consolidate. Fold the eight locked owner calls
([docs/phase-4-notes.md](../../docs/phase-4-notes.md), mirrored on the map) and the eight ticket
resolutions into `.scratch/phase-4/PRD.md`: the locked Phase 4 spec, ready to hand to
/to-spec → /to-tickets → /implement.

Rules:

- **Decide nothing new.** Every statement in the PRD traces to a locked call or a ticket's
  resolution comment; where tickets recorded contingencies on each other (#01↔#02↔#08,
  #03↔#07's shared detail view, the font call ↔ #05), reconcile them explicitly — and if two
  resolutions genuinely conflict, stop and surface it to the owner rather than smoothing it over.
- Carry the map's scope fences into the PRD (AI recommender out, free-text search out,
  theming overhaul is future fog) so downstream ticketing doesn't wander.
- Close this ticket with a pointer to the PRD; that closes the map.

## Comments
