# 09 — Assemble the Phase 4 spec

Status: done
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

**Resolution (2026-07-13): [PRD.md](../PRD.md) assembled and published, `ready-for-agent`.**

Assembled via `/to-spec` from the eight locked owner calls and eight ticket resolutions; every
statement traces to its ticket. Structure the owner approved before assembly: **one spec, five
staged clusters** (honest fixes → tier data layer → app restructure → tier UX → Archive &
theming), each independently demoable; tests at the **three existing seams** (domain modules,
dataset canon tripwires, app smoke) plus the Playwright production-build convention.

Contingency reconciliation (the "stop if resolutions conflict" rule was never triggered —
nothing conflicted, three contingencies resolved):

- **Nav order** (#01 ↔ #02): Browse / Recommend / Archive / Tier list / Log / Settings.
- **Font call** (locked call ↔ #05's findings): returned to the owner as required — owner chose
  **OFL approximation** (Reem Kufi body + OFL display for names); commercial Fling-a-Ling
  declined.
- **Fast/Slow icons** (locked call's "or official icons" ↔ #05): owner locked **red/blue
  colours**; ~80px contested-provenance PNGs declined.
- **Disclaimer wording** (#01's footer slot ↔ #05): satisfies the community-FAQ terms —
  unofficial, fan-made, non-commercial.

This closes the map: destination reached, ready for /to-tickets → /implement.
