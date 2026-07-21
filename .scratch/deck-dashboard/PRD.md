# Deck Dashboard — spec

Status: done
Date: 2026-07-19
Map: MAP.md (wayfinder — tickets 01–05 remain open for the deferred threads; see Out of Scope)

## Problem Statement

During a game of Spirit Island, the player keeps needing answers the physical table cannot
give: "if I draft a minor power now — drawing 4 — how likely am I to see the elements my
spirit wants?", "what does the major deck actually contain with the expansions we're playing
tonight?", "what kinds of fear cards and events are even in this game's pool?". The app
already knows every card, but only as a browsable catalog — there is nowhere that turns the
catalog into the composition and odds of the decks on the table.

## Solution

A new **Dashboard** tab, read-only and static: no game state, no tracking of what has been
drawn. It has one segment per draw deck — **Minor**, **Major**, **Fear**, **Event**. An
expansion picker (defaulting to the user's Collection) defines what is in the decks; every
number and plot recomputes from the checked set. The Minor and Major segments show
per-element composition with exact draw odds ("chance of at least one Fire among the next 4
draws") and an element-combination view; an optional spirit pick highlights that spirit's
elements. The Fear and Event segments show pool composition by the existing sourced facets
(fear tags, event classes, expansion). All figures are pool-level facts about a full,
untouched deck — the honest static answer, clearly labelled as such.

## User Stories

1. As a player mid-game, I want a Dashboard tab in the app's navigation, so that deck odds
   are one tap away at the table.
2. As a player, I want the Dashboard split into Minor / Major / Fear / Event segments, so
   that each deck answers its own question without the others crowding it.
3. As a player, I want an expansion picker on the Dashboard, so that the decks reflect the
   expansions actually shuffled into tonight's game, not everything I own.
4. As a player, I want the expansion picker pre-set to my Collection, so that the common
   case costs zero clicks.
5. As a player playing a subset (e.g. base game only), I want to uncheck expansions and see
   every count, plot, and probability recompute immediately, so that the odds are true for
   my table.
6. As a collector, I want expansions I don't own annotated in the picker (not hidden), so
   that I can still explore hypothetical pools, consistent with how the app treats unowned
   content elsewhere.
7. As a player, I want my picker choices to be session-only, so that the app always boots
   into the truthful default (my Collection) rather than a stale game's setup.
8. As a player on the Minor segment, I want the deck's total card count for my expansion
   set, so that I know the denominator behind every probability.
9. As a player on the Minor segment, I want a per-element bar view — for each of the 8
   elements, how many cards carry it — so that I can see the element balance of the deck at
   a glance.
10. As a player drafting a minor power, I want each element's "chance of at least one in
    the next N draws" shown next to its bar, so that I know the odds of seeing the element
    I need before I commit to drafting.
11. As a player, I want the draw count N to default to 4, so that the standard "draw 4,
    keep 1" draft is the out-of-the-box answer.
12. As a player using a non-standard draw (power progression, aspect or event effects), I
    want to adjust N with a stepper, so that the odds match my actual draw.
13. As a player on the Minor segment, I want an element-combination view (which element
    pairings/triples actually occur, and how often), so that I can judge the chance of a
    card that advances two of my thresholds at once.
14. As a player, I want cards with no elements (they exist among minors) grouped visibly as
    "No element", so that the combination view accounts for every card rather than silently
    dropping some.
15. As a player, I want elements with zero cards in my set still listed at zero, so that an
    absence reads as a fact rather than a missing row.
16. As a player, I want the Major segment to offer the same views as the Minor segment
    (composition, draw odds, combinations), so that one visual language covers both power
    decks.
17. As a player on a power-deck segment, I want the fast/slow split and the cost
    distribution shown as secondary facets, so that I can weigh tempo and affordability,
    not just elements.
18. As a spirit player, I want to optionally pick my spirit on the Dashboard, so that the
    element views highlight the elements my spirit cares about.
19. As a spirit player, I want the highlight driven by the spirit's recorded elements
    (existing sourced data), so that the feature ships without inventing any new data.
20. As a player, I want the spirit pick to be optional with a clear "no spirit" state, so
    that the Dashboard works for the whole table, not just me.
21. As a player on the Fear segment, I want the fear pool's size and its composition by
    fear tag (removal, defensive, weaken, disruption, displacement), so that I can gauge
    what kind of help earned fear is likely to bring.
22. As a player, I want fear cards carrying several tags counted under each tag they carry
    (like elements), so that tag bars answer "how much of the pool does X" honestly.
23. As a player on the Event segment, I want the event pool's size and its composition by
    event class, so that I know what shapes of event this game can throw at us.
24. As a player on the Fear and Event segments, I want an expansion breakdown, so that I
    can see how each box changed the pool's character.
25. As a player, I want the Fear segment to state that the in-play fear deck is a hidden
    subset of this pool (built at setup), so that I read the numbers as pool odds — the
    honest static answer — not as a card counter.
26. As a base-game-only player, I want the Event segment to state plainly that my set
    contains no event cards, so that an empty view reads as a rule of the game, not a bug.
27. As a player, I want every probability labelled with its assumption ("full deck,
    nothing drawn"), so that the static dashboard never masquerades as live tracking.
28. As a player switching segments or pickers repeatedly during a game, I want the
    Dashboard to hold no game state whatsoever, so that nothing needs resetting between
    games.
29. As the owner, I want all composition and probability math in one pure, framework-free
    domain module, so that the feature is testable at a single seam like the rest of the
    domain.
30. As the owner, I want this feature to add zero new datasets and zero new storage keys,
    so that the repo's data-provenance rules aren't even in play.
31. As a returning user, I want the rest of the app (Cards browser, Recommender, Game log)
    untouched, so that the Dashboard is purely additive.

## Implementation Decisions

- **New top-level tab.** A `dashboard` tab id joins the nav; the tab component owns an
  internal segmented control (Minor / Major / Fear / Event), modeled on the Cards tab's
  segment pattern. UI is boring glue per repo principles.
- **One new domain seam: a pure deck-composition module.** Framework-free TS. Inputs: the
  card catalogs, the checked expansion set, a draw count N, and optionally a spirit's
  element list. Outputs (all derived, nothing stored):
  - deck size per power kind for the expansion set;
  - per-element stats: count, share of deck, and P(at least one card with that element
    among N draws) — exact hypergeometric without replacement, computed as
    `1 − C(deck−k, N)/C(deck, N)` with k = cards carrying the element; probability is 1
    when N ≥ deck−k+... (i.e. when a miss is impossible) and 0 when k = 0; N is clamped to
    [1, deck size];
  - element-combination groups (each card's exact element set, including the empty "No
    element" set), with counts, sorted by frequency;
  - fear-pool stats by tag (a multi-tag card counts in every tag it carries) and event-pool
    stats by event class, each with expansion breakdowns.
- **Existing seams reused, not duplicated.** Expansion filtering and element/tag grouping
  semantics follow the established power-card and other-card arrange/filter modules; the
  Collection store supplies the picker default. The module must not re-implement grouping
  rules those seams already define — where it needs them, it composes them.
- **Picker state is session-only.** Component state; a reload reverts to Collection default
  and no spirit. No new storage key. (Matches the Collection glossary rule that hiding-type
  choices are session-only.)
- **Spirit picker is by spirit, not Configuration.** Element data exists at spirit level
  only; aspects record no element changes. The picker lists the 37 spirits; the glossary's
  Configuration unit is deliberately not used here and the spec notes why, so the choice
  reads as intent rather than oversight.
- **Unowned expansions are annotated, never hidden**, in the picker — consistent with
  Collection behaviour across the app.
- **Charts are hand-rolled SVG/CSS** in the style of the existing rating-bars component. No
  charting dependency. Baseline forms: horizontal per-element bars (count + odds label,
  spirit-element rows visually highlighted), and the combination view as a dot-matrix list
  (rows = element sets marked by dots on the 8-element columns, sorted by count) — an
  UpSet-style presentation without the library. The wayfinder map's open prototype tickets
  may refine these forms later; refinements change the components only, never the domain
  seam or its outputs.
- **Draw-odds honesty is part of the contract.** Every probability the module returns is a
  full-deck figure; the UI labels carry the assumption. No API for "cards seen" exists in
  this spec — that absence is deliberate, so the future live-tracking effort arrives as a
  new decision, not a dormant half-feature.
- **No data file changes.** No new datasets, no edits to hand-maintained data, therefore no
  new tripwire tests required by the data-provenance rules.

## Testing Decisions

- Tests assert **external behaviour of the new domain module only** — inputs to outputs on
  small synthetic fixtures (a handful of invented cards), never the real 332-card catalog,
  never localStorage, never the React tree. Prior art: the arrange/filter module tests and
  the game-log tests.
- **Exact probability assertions on tiny decks** where the hypergeometric answer is
  hand-checkable (e.g. 5-card deck, 2 carrying Fire, draw 2 → 0.7).
- **Edge cases pinned:** element with zero cards → probability 0 and a zero-count row;
  N ≥ deck size → certainty when the element exists at all; empty expansion set and
  no-event expansion sets → empty compositions, no throws; the "No element" combination
  group present exactly when such cards are in the set; multi-tag fear cards counted once
  per tag but once only in pool size; N clamping at both ends.
- **The one-UI-test rule stands:** the existing server-rendered smoke check gains the
  Dashboard tab; no other UI tests.
- No tripwire tests: this feature introduces no data. A test asserting the module produces
  rows only for the 8 canonical elements guards against invention at the code level.

## Out of Scope

- **The good/bad valence axis for fear and event cards.** It is judgment data requiring the
  owner's taxonomy; the wayfinder map's ticket *Fear/event valence taxonomy* (with the
  dependent *Fear/event view prototype*) remains open, and valence arrives via a follow-up
  spec once grilled — as marked-judgment data with a tripwire test.
- **Innate-threshold odds** ("chance of reaching 2 Fire 1 Air"). Pending the map's research
  ticket *Can innate power thresholds be sourced?* and the dependent scope decision.
- **Live in-game tracking / conditional probabilities** from user input. Explicitly a
  future effort (see the map's Out of scope).
- **Blight cards** — no draw-odds question worth a view.
- **Unique powers** — not a draw deck; they stay in the Cards browser.
- **Multi-spirit highlighting** for the whole table; the picker takes one spirit.
- **Persisting picker state** across reloads.
- **A charting library.**

## Further Notes

- The wayfinder map (`MAP.md`) charted this effort; the owner redirected the route on
  2026-07-19 to spec the decided core immediately rather than resolve all tickets first.
  Map tickets 01–05 stay open: the two prototype tickets may refine chart forms
  (component-level changes only), and the valence/innates threads feed follow-up specs.
- The deck-composition seam is deliberately the single place any future "cards seen"
  parameter would land (the hypergeometric inputs are already deck-size-and-count shaped),
  but adding it is a future decision, not a hook to build now.
- Fear-deck framing matters: in play, the fear deck is a small hidden subset built at
  setup, so pool-level composition is the *only* honest static statistic. The UI copy
  carries this framing (user story 25).
