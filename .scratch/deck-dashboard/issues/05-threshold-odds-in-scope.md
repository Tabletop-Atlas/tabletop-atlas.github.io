# Do innate-threshold odds join the dashboard?

Status: done
Labels: wayfinder:grilling
Map: ../MAP.md
Blocked-by: 01-innate-thresholds-sourcing.md

## Question

Given the verdict from
[Can innate power thresholds be sourced?](01-innate-thresholds-sourcing.md), do
innate-threshold odds (e.g. "chance the next 4 minors get you to 2 Fire 1 Air") join *this*
dashboard's spec, or become a future effort?

A `/grilling` decision for the owner, weighing: the research ticket's feasibility verdict
and transcription cost, whether the spirit-element highlight (already settled in) covers
enough of the "best elements for my spirit" goal on its own, and how threshold odds would
fit the chart vocabulary chosen in
[Power-deck chart vocabulary](03-power-deck-chart-vocabulary.md). If the answer is "future
effort", record it on the map under Out of scope, not as fog.

## Comments

**2026-07-21 — decided via `/grilling`: in scope, as a follow-up spec — reframed as element-gap
odds.** Owner's decisions, in dependency order:

1. **Scope:** joins this effort as a **follow-up spec** (same lane as valence #02/#04), not the
   shipped PRD, not a future effort.
2. **Level:** spirits only for now. A caption acknowledges that some aspects modify innates —
   never silently show base thresholds as if they applied to a modified configuration. Aspect
   overlays are a later extension.
3. **Reframe (the key turn):** the owner judged from-zero threshold-meeting odds not
   decision-useful — real thresholds are also fed by presence-track elements and unique powers a
   static dashboard can't see. The view is instead **element-gap odds**: "odds the next N draws
   from this deck give ≥k of element X". The player supplies the gap mentally; the dashboard
   supplies the deck math.
4. **Math:** single-element odds only (k = 1, 2, 3), exact hypergeometrics; N reuses the
   adjustable-N control from [#07](07-draw-odds-adjustable-n.md). No joint multi-element
   probabilities (they'd re-import the rejected from-zero assumption).
5. **Dataset:** spirit innate thresholds ARE transcribed this effort (~1 session, shape per
   [../innate-thresholds-research.md](../innate-thresholds-research.md), pinned by an
   `innateCanon.test.ts` tripwire). Role: **annotations** on element rows when a spirit is picked
   (e.g. "Massive Flooding II wants 3 Water"), not a computation engine.
6. **Placement:** a block inside each power-deck segment (Minor and Major), under the UpSet,
   sharing that segment's expansion filter, N control, and spirit pick. Visual form is decided in
   the prototype ticket, per the map's standing rule.
7. **Spun off:** baseline-aware probability exploration (presence-track uncovering, unique-card
   element profiles, "odds my spirit itself shows element X") filed as
   [#13](13-probability-exploration-brainstorm.md) — a future effort, adjacent to the map's
   out-of-scope live-tracking line.
