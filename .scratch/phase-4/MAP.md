# Phase 4 — restructure, interconnect, honest recommender — wayfinder map

Labels: wayfinder:map

## Destination

**A locked set of Phase 4 decisions, assembled into a spec ready to hand to /to-spec → /to-tickets
→ /implement.** The spec covers: the app restructure (homepage, Settings tab, nav), the
Browse/Archive/Grid UX fixes, the tier-list ↔ browser interconnection, and a scoped-down
recommender. This map decides; it does not build.

## Notes

- **The charting input is [docs/phase-4-notes.md](../../docs/phase-4-notes.md)** — the owner's
  Phase 4 feedback, pre-structured into decided items, open decisions, fog, and out-of-scope. The
  "Already decided" items are **locked**: no grilling session re-opens them; they flow into the
  spec via [#09](issues/09-assemble-the-phase-4-spec.md). One carries a flag (see Decisions so far).
- **This map is planning-only** — unlike v4/v5, which carried execution. Every ticket resolves a
  decision; the one `task` ticket ([#09](issues/09-assemble-the-phase-4-spec.md)) assembles the
  spec, which is the destination itself. Build work happens downstream of the handoff, not here.
- **The agent is the planner, not the coder** (owner, 2026-07-13). No session on this map writes
  production code. The two `prototype` tickets produce throwaway reaction-fodder only — mockups,
  or scratch code that is deleted once the decision lands (as v5's tag-colour prototype was);
  nothing from them ships. All real coding happens downstream of #09's handoff.
- **Charting (2026-07-13) grilled nothing** — the owner's notes stood in for it. Every HITL
  ticket's grilling is still to happen, live, one ticket per session; the notes are input, not
  answers.
- **The owner wants counsel on backend/architecture questions, not just execution of their ideas**
  (their words). Grilling sessions on [#04](issues/04-the-archives-structure.md) and
  [#06](issues/06-multi-tier-list-architecture.md) especially: bring codebase facts to the
  conversation, and push back where the code disagrees with the idea.
- **Theme fidelity to Spirit Island matters throughout**, and the audience is broad — gamers and
  non-gamers. Both are standing constraints on every UX decision.
- **This repo fabricates when a source can't answer** (CLAUDE.md). On this map the exposed ticket
  is [#05](issues/05-official-assets-and-licensing.md)'s licensing research: findings cite sources
  or say "unknown" — never a confident guess about what a publisher permits.
- Tracker mechanics: tickets are `issues/NN-slug.md`. Claim by adding an `Assignee:` line
  **before** working. Frontier = open, unassigned, every ticket in its `## Blocked by` closed
  (`Status: done`).

## Decisions so far

<!-- one line per closed ticket -->

- **[#01 the homepage](issues/01-the-homepage.md) done** (2026-07-13), via `/grilling`:
  orientation + router, never a dashboard. Every visit boots to it; the logo is the only route
  home (no Home nav button). Three intent-phrased doors (Browse / Recommend / Tier list;
  Archive/Log/Settings nav-only), **Browse takes the lead in both doors and nav**. One framing
  line each for game and app + a footer disclaimer slot pending #05; art-backed door tiles in
  current styling, theming overhaul stays fog.
- **[#02 the Settings tab](issues/02-the-settings-tab.md) done** (2026-07-13), via `/grilling`:
  "Customise tiers" **dissolves** — tier editing becomes an edit mode on the Tier list tab, and a
  new Settings tab (named "Settings", last in nav) takes its three settings sections: Backup, My
  collection, Complexity overrides. Open-door policy: future durable prefs default to Settings.
  The v5 split survives — durable collection in Settings, session-only hide-unowned checkboxes
  stay on each surface.
- **[#06 multi-tier-list architecture](issues/06-multi-tier-list-architecture.md) done**
  (2026-07-13), via `/grilling` + `/domain-modeling`: every tier list gains a **subject**
  (`configurations` / `minor-powers` / `major-powers`) defining its key namespace; one **active
  list per subject** keeps board and browser agreeing, with a durable **default list** pick in
  Settings seeded to the credited list. One Tier list tab serves all subjects. ADR 0001's
  cited-document rules extend unchanged; no `game` field — subject is the multi-game seam.
  Terms recorded in the repo's new `CONTEXT.md`; ADR 0002 drafted at build time. **#07
  unblocked.**

Eight calls were made by the owner ahead of charting, locked in
[docs/phase-4-notes.md](../../docs/phase-4-notes.md) — they are not tickets; #09 folds them into
the spec:

- **Spirit Island font for spirit names in Browse.** Contingent on
  [#05](issues/05-official-assets-and-licensing.md)'s licensing finding — if the font can't be
  used, this returns to the owner rather than being silently dropped.
- **Consistent expansion colours** across Browse, Tier List, and all views.
- **Scenario grid view gets a difficulty indicator.**
- **Grid tags differentiated:** Major/Unique/Minor tag colours distinct; Fast = red, Slow = blue
  (or official icons — [#05](issues/05-official-assets-and-licensing.md) answers whether icons are
  available).
- **Archive sorting:** Minor/Major power cards sortable/groupable by cost, elements, and speed;
  Fear and similar stay alphabetical/by-type.
- **Tier list attribution:** the default list is [3 Minute Board Games'](https://www.youtube.com/watch?v=LoP2T4GO4xo&list=PLN_f1BRMAaFA&index=2),
  not the owner's — it must be credited. The schema already carries `source.author/title/url`
  (`src/data/tier-lists/`); the work is display.
- **The Spirit Island logo becomes clickable → homepage.** The homepage is a priority.
- **"Recommended" loses its pinned top spot in nav** (today it is first *and* the default tab —
  `App.tsx`).

## Not yet specified

- **Left panel / global theming overhaul** toward a floral/island Spirit Island aesthetic. The
  direction is felt but not specifiable; [#05](issues/05-official-assets-and-licensing.md)'s
  findings (what assets exist and may be used) will sharpen it.
- **Multi-game platform vision** — users swapping between games.
  [#06](issues/06-multi-tier-list-architecture.md) must not paint into a corner for it, but does
  not design it.

## Out of scope

- **The full AI composition-based recommender in the backend.** Exists, but explicitly not this
  phase (owner, [docs/phase-4-notes.md](../../docs/phase-4-notes.md)) — the map does not route
  toward it. Constrains [#08](issues/08-the-recommenders-short-term-shape.md): option B stays
  within data the frontend already has.
- Standing rulings carried from the [v5 map](../v5/MAP.md): **free-text search** (owner declined;
  dropdowns and multi-selects only) and **a phone-first rewrite** (responsive, nothing breaks).

```
decide                                            assemble

01 the homepage ─────────────────────────────┐
02 the Settings tab ─────────────────────────┤
03 the radar chart: fix or replace ──────────┤
04 the Archive's structure ──────────────────┤
05 official assets + licensing (research) ───┼─ 09 assemble the Phase 4 spec
06 multi-tier-list architecture ──┐          │
                                  └─ 07 tier list ↔ browser interconnect
08 the recommender's short-term shape ───────┘
```

Frontier (updated 2026-07-13): **#03, #04, #05, #07, #08** — all independent, any order.
#09 waits on everything else. #01, #02 and #06 are done; #06's close unblocked #07.
