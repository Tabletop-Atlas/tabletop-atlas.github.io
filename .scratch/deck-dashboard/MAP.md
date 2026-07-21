# Deck Dashboard map

Labels: wayfinder:map
Created: 2026-07-19

Wayfinder map for the in-game deck dashboard effort. Tickets are child issues in `issues/`;
a ticket is claimed by writing an `Assignee:` line, and `Blocked-by:` lines carry the
dependency edges (this tracker has no native blocking). The frontier = open issues with no
unresolved `Blocked-by:` and no assignee.

## Destination

A fully-decided design for a **static, read-only Dashboard tab** visualizing what's in each
draw deck (minor powers, major powers, fear, events) for the current game's expansion set —
every design question resolved so `/to-spec` can write the PRD without inventing answers,
then `/to-tickets` slices it. Live in-game tracking is out of scope (see below).

## Notes

Settled during the charting session (2026-07-19), with the owner confirming each:

- **New top-level Dashboard tab, per-deck segments** (Minor / Major / Fear / Event), modeled
  on `CardsTab`'s segmented control. Wiring is the standard 3-line `App.tsx` change.
- **Deck contents = an expansion picker on the dashboard, defaulting to the owned collection**
  (`collectionStore`). All compositions and odds recompute from the checked set.
- **Spirit picker highlighting that spirit's elements** in the power-deck plots — uses the
  existing spirit-level `elements` in `spirits.json`, no new data.
- **A good/bad valence axis for fear and event cards will exist**, shipped as marked-judgment
  data (precedent: blight `tagsSource: "judgment"`), pinned by a tripwire test. Its shape is
  ticket [Fear/event valence taxonomy](issues/02-fear-event-valence-taxonomy.md).
- Blight cards get no view.

Standing constraints for every session on this map:

- **Repo data rule (CLAUDE.md):** a field that cannot be sourced is absent, never estimated.
  Any new dataset arrives with a tripwire test; judgment-provenance data is marked as such.
- The repo has **zero chart dependencies**; hand-rolled SVG is the precedent
  (`src/components/OcfduBars.tsx`). Whether to add a chart library is decided inside the
  prototype tickets, not assumed.
- Skills: grilling tickets run `/grilling` + `/domain-modeling`; prototype tickets run
  `/prototype`.
- Key data facts: `power-cards.json` (332 cards; minor 101 / major 78 / unique 153; per-card
  `elements`/`cost`/`speed`/`expansion`), `other-cards.json` (fear 50 with tags, event 65
  with `eventClass`, blight 24). Grouping/filter helpers already exist in
  `src/domain/powerCardArrange.ts` and `powerCardFilter.ts`.
- Pipeline (owner's standing rule): when this map's tickets are all resolved, run `/to-spec`
  then `/to-tickets` in full — never skip them because the map already has tickets.
- **Route redrawn 2026-07-19:** the owner ran `/to-spec` immediately after charting rather
  than resolving tickets first. `PRD.md` (ready-for-agent) specs the decided core — no
  valence, no innates, baseline chart forms. Tickets 01–05 stay open: 02+04 feed a follow-up
  valence spec, 01+05 the innates decision, 03 may refine chart forms (component-level only;
  the domain seam's outputs are fixed by the spec).

## Decisions so far

<!-- one line per closed ticket: gist + link -->

- Innate thresholds ARE sourceable for all 37 spirits (wiki raw wikitext + on-disk TTS JSON
  cross-check + local panel images; aspects via wiki text + aspect card images) — ~1.5 sessions
  of transcription. Unblocks the #05 scope decision.
  [#01](issues/01-innate-thresholds-sourcing.md), findings in
  [innate-thresholds-research.md](innate-thresholds-research.md).
- Power-deck chart vocabulary: UpSet wins, but only with filters (must-include, set-size,
  min-cards, top-N) — shipped as `DeckUpset.tsx` after four owner-feedback rounds; hand-rolled,
  no chart library. [#03](issues/03-power-deck-chart-vocabulary.md).

## Not yet specified

- Cross-deck visual consistency — how the four segment views share one visual language and
  how dense the layout gets; will sharpen once both prototype tickets have artifacts.
- Whether the dashboard pre-wires context from elsewhere in the app (e.g. preselecting your
  spirit from the recommender or the game log's last entry); revisit once the spirit
  highlight exists in prototype form.

## Out of scope

- **Live in-game tracking / conditional probabilities** updated by user input ("two defend
  fear cards are gone — now what?"). Explicitly deferred by the owner at charting; the
  destination is a static dashboard. A future effort, redrawn from scratch if it comes.
- **Blight card visualization** — no draw-odds question worth plotting.
- **Implementation itself** — this map produces the decided design; building it belongs to
  the `/to-spec` → `/to-tickets` pipeline that follows.
