# Deck Dashboard follow-up spec: valence views + element-gap odds

Status: ready-for-agent
Parent: MAP.md (decisions: issues/02, 04, 05; research: issues/01 + innate-thresholds-research.md)
Predecessor: PRD.md (shipped — this spec extends the Dashboard it built)

## Problem Statement

The Dashboard tells me what's *in* each deck, but not what the decks *mean for my game*. The
Fear and Event segments list tags and classes without answering my driving question — "how
likely is a bad event? a strong fear card?" — and nothing connects the power decks to my
spirit's innate powers, so "which elements should I draft toward, and what are my odds of
getting them?" still means counting cards by hand.

## Solution

Two additions to the existing Dashboard tab, both static and full-pool like everything else
on it:

1. **Valence views** (owner-picked prototype variant D) for the Fear and Event segments:
   headline stat tiles answering the driving question, a stacked composition bar, and the
   tag/class facet as mini stacked bars — with every tile and bar segment click-to-drill into
   the exact cards behind it, and every card chip opening the real card image. Fear is rated
   on a 3-level **Impact** axis, events on a 3-level **Valence** axis, both owner-ratified
   judgment data.
2. **Element-gap odds** on the Minor and Major segments: "odds the next N draws give you at
   least k of element X", with the picked spirit's transcribed **innate thresholds** annotating
   the element rows so the player sees which gaps matter for their spirit.

## User Stories

1. As a player opening the Event segment, I want headline tiles for harmful / mixed /
   beneficial, so that I see at a glance how likely a bad event is.
2. As a player opening the Fear segment, I want headline tiles for the three impact levels,
   so that I know how strong the fear pool is for my side.
3. As a player reading any headline tile, I want percent first with the count in brackets
   ("32% (16)"), so that I never divide by 74 in my head.
4. As a player, I want next-draw odds framed as pool share with the full-pool assumption
   stated, so that I never mistake the Dashboard for a live card counter.
5. As a player, I want one stacked bar of the whole pool's rating composition with direct
   labels, so that the distribution is readable without a legend hunt.
6. As a player, I want the fear-tag facet rendered as mini stacked bars (impact within tag),
   so that I see both how big a tag is and how strong its cards are.
7. As a player, I want the event-class facet rendered the same way (valence within class),
   so that both segments share one visual language.
8. As a player, I want every facet row's total shown as count and percent together
   ("19 (38%)"), so that row weights are comparable at a glance.
9. As a player, I want to click a headline tile and see the chip list of exactly those cards,
   so that an aggregate is always one click from its evidence.
10. As a player, I want to click a single bar segment (e.g. major × Removal) and see exactly
    that intersection's cards inline under the row, so that I can answer "which are the major
    removal cards?" directly.
11. As a player, I want a clear affordance (and click-again-to-collapse) on the drill, so
    that I can dismiss the chip list without hunting.
12. As a player, I want to hover a card chip and see the actual card image, so that I can
    read the card without leaving the Dashboard.
13. As a player on a touch device, I want tapping a chip to open the full-screen card viewer,
    so that the hover-less path still reaches the card.
14. As a player, I want each chip's rating shown by its colored edge and its tooltip, so that
    identity survives in the drilled list.
15. As a colorblind player, I want harmful/beneficial as warm-orange/cool-blue poles (never
    red/green) and direct labels on segments, so that the valence axis is readable to me.
16. As a player, I want fear impact colored as a single-hue light→dark ramp, so that "more"
    reads as magnitude, not as a different category.
17. As a player, I want the impact levels displayed as **weak / solid / strong**, so that
    "minor/major" never collides with minor/major *powers* on the same screen (display labels
    only — the #02 taxonomy and its 1|2|3 data values are unchanged).
18. As a player with only the base game checked, I want the Event segment's empty state to
    keep reading as a rule of the game, so that the new views don't regress that copy.
19. As a player, I want the expansion picker to keep driving both new views, so that every
    figure reflects the set I actually play with.
20. As a skeptical user, I want every impact/valence figure marked as judgment-sourced, so
    that I know these are the owner's calls, not published data.
21. As the owner, I want a written rubric for what makes a card weak/solid/strong and
    harmful/mixed/beneficial, so that ratings are auditable against a document, not vibes.
22. As the owner, I want the agent's draft classification of all 115 cards presented for my
    review, and nothing merged until I ratify it, so that "judgment" means *my* judgment.
23. As the owner, I want the fear `tags` and event `eventClass` used only as cross-checks on
    the draft (never as rating inputs), so that keyword-derived data can't launder itself
    into judgments.
24. As a maintainer, I want a tripwire test pinning the complete ratified table and its
    completeness, so that silent edits, missing cards, or invented ratings fail the build.
25. As a player on the Minor or Major segment, I want a gap-odds block ("chance the next N
    draws give ≥1 / ≥2 / ≥3 of each element"), so that "will drafting get me there?" has a
    number.
26. As a player, I want the gap-odds N to be the same stepper the segment already has, so
    that one control means one thing everywhere.
27. As a player, I want gap odds computed exactly (hypergeometric, full deck, nothing drawn)
    and labelled with that assumption, so that the numbers are honest deck facts.
28. As a player who picked my spirit, I want its innate-threshold requirements annotated on
    the relevant element rows ("Massive Flooding II wants 3 Water"), so that I know which
    gaps matter for me.
29. As a player who picked no spirit, I want the gap-odds block fully useful without
    annotations, so that the Dashboard serves the whole table.
30. As a player whose spirit's aspects modify its innates, I want a caption saying the shown
    thresholds are the base spirit's, so that I'm never silently shown wrong data for my
    configuration.
31. As a player, I want the gap-odds block to sit inside each power-deck segment under the
    existing views, sharing its expansion filter, N and spirit pick, so that no new
    navigation is needed.
32. As a maintainer, I want the innate-threshold dataset transcribed from the wiki's raw
    wikitext and cross-checked against the on-disk TTS mod JSON, with panel images as
    tiebreaker, so that every row is sourced, never estimated.
33. As a maintainer, I want an innate-canon tripwire pinning every spirit's thresholds, so
    that transcription drift or invention fails loudly.
34. As a maintainer, I want the threshold lookup exposed as one small pure domain module, so
    that gap-odds annotations and the aspect caption share a single seam.
35. As a user, I want all new state (drill selection, nothing else is added) to be
    session-only, so that a reload still reverts the Dashboard to its defaults.

## Implementation Decisions

- **Two datasets, arriving with tripwires, per the repo data rule.**
  - *Impact/valence*: per-card fields on the existing fear/event catalog — fear
    `impact: 1|2|3` + `impactSource: "judgment"`, event
    `valence: "harmful"|"mixed"|"beneficial"` + `valenceSource: "judgment"` (blight
    `tagsSource` precedent). A valence-canon tripwire pins the complete name→rating table and
    asserts completeness. The rubric lives as a markdown doc linked from the test.
  - *Innate thresholds*: a new catalog of spirit innate powers — per power: spirit id, name,
    speed, ordered thresholds as element→count maps (shape from the #01 research, which came
    from a prototype of the extraction). Effect text deliberately omitted — omitting is safer
    than paraphrasing. Spirits only; aspect modifications are a marked future extension. An
    innate-canon tripwire pins the full table. Transcription protocol: wiki raw wikitext
    (`{{Threshold|...}}` templates) as primary, TTS mod JSON element-count strings as machine
    cross-check, local panel images as tiebreaker; any mismatch escalates to the image.
- **Ratification gate:** the classification lands as a draft the owner reviews; the dataset
  and its tripwire merge only after the owner ratifies (or amends) all 115 rows. This is a
  human gate inside an otherwise agent-runnable spec — slice it as its own ticket.
- **Display labels for impact are weak / solid / strong** (data values stay 1|2|3). Resolves
  the #04 naming flag without touching the #02 taxonomy.
- **Fear/Event segment views are rebuilt properly from prototype variant D** (the prototype
  was deleted; its commits are linked from issue 04): headline stat tiles (percent first,
  count bracketed, clickable), one 100%-stacked composition bar with 2px gaps and direct
  labels, tag/class facet as mini stacked bars with clickable segments, drill state as a
  single session-only selection (bucket, or bucket×group), inline chip list with clear
  button. The by-expansion facet is dropped from both segments (owner's call from the
  prototype). Chips: rating-colored edge, hover → floating card-image preview, click → the
  shared card-enlarge viewer (the touch path).
- **Colors (dataviz-validated on the app surface, owner-ratified):** valence poles harmful
  warm-orange `#d97742` / beneficial cool-blue `#4f9ad4` with a neutral mixed — the accent
  green fails CVD separation against the warm pole. Impact is a sequential ramp of the accent
  green (magnitude, not polarity). Direct labels keep identity off color alone.
- **Gap odds extend the existing deck-composition domain seam:** per-element exact
  hypergeometric tail odds P(at least k cards carrying the element among N draws) for
  k = 1, 2, 3; k = 1 is the odds the segment already shows. Full deck, nothing drawn; the N is
  the segment's existing stepper; no joint multi-element probabilities (rejected in #05 — they
  re-import a from-zero assumption the owner judged misleading).
- **One new domain module: innate-threshold lookup** — spirit id → innate powers with
  ordered element requirements, plus "does any aspect of this spirit modify innates" for the
  caption rule. Feeds row annotations in the gap-odds block when a spirit is picked, and the
  base-thresholds caption for aspect-modified spirits.
- **Placement:** the gap-odds block renders inside each power-deck segment beneath the
  existing UpSet/facets, inheriting expansion set, N and spirit pick. No new tab, segment, or
  storage key; all new UI state is session-only.

## Testing Decisions

- Good tests here assert external behavior: given cards and an N, the composition's gap odds
  match hand-computed hypergeometrics; given a spirit id, the lookup returns its transcribed
  thresholds; given the rendered app, the segments show the decided views. No tests of
  internal helpers or render internals.
- **Domain tests** on the deck-composition seam (gap-odds extension) — prior art: the
  existing composition/draw-odds tests from the shipped PRD. Edge cases: k > element count in
  deck (odds 0), N ≥ deck size (certainty where possible), empty deck.
- **Canon tripwires** — prior art: `aspectCanon.test.ts`, `adversaryCanon.test.ts`. The
  valence canon pins all 115 ratings + completeness + source markers; the innate canon pins
  every spirit's thresholds (count and content) so drift fails loudly.
- **App smoke tests** (server-rendered) — prior art: the deck-dashboard #06–#12 smoke tests,
  two of which currently assert "no valence classification" on the Fear/Event segments and
  must be rewritten to assert the new views instead. New assertions: headline tiles with
  percent-first format, drilled chip list appears on selection, gap-odds block present on
  Minor/Major with the shared N, spirit pick adds threshold annotations, aspect-modified
  spirit shows the base-thresholds caption.

## Out of Scope

- Joint multi-element threshold odds ("chance N draws cover 2 Sun + 3 Water entirely") —
  rejected at #05.
- Baseline-aware probability (presence-track elements, unique-card element profiles, user
  -entered board state) — parked as the issue-13 brainstorm, a future effort.
- Aspect modifications to innates beyond the caption (the overlay dataset is a marked
  extension; the picker stays spirit-level).
- Live in-game tracking, blight views, per-terror-level fear ratings, any change to the
  shipped Minor/Major UpSet and facets.

## Further Notes

- The ratification ticket is the one step an agent cannot finish alone; everything else in
  this spec is agent-runnable. Sequence the valence *views* behind the ratified data — the
  views must never ship on stub ratings (the prototype's stubs were deleted with issue 04
  precisely so they can't leak).
- The innate transcription is estimated at one focused session for the 37 spirits (see the
  research note); the ~200–230 threshold rows are a few KB of JSON.
- Domain terms **Impact (fear)** and **Valence (event)** are recorded in the project glossary;
  keep spec and UI copy on those terms.
