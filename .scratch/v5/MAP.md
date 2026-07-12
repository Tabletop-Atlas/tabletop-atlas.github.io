# v5 — the controls tell the truth — wayfinder map

Labels: wayfinder:map

## Destination

**Every control in the app does something true, and the browser covers the whole game.**

Three things are wrong with the app today and one thing is missing:

1. **Four controls lie.** The tier list's player-count dropdown can only ever filter *out* (every
   sourced list is solo or unstated). The player-count input claims 1–6 and accepts 0 or 47. The
   Fear/Events/Blight filter panel offers a "Type" control that the segmented switch above it has
   already answered. The tier board's "Unrated" label is squashed into the panel edge.
2. **The app assumes you own everything.** Every expansion's spirits are always offered, whether or
   not you can play them.
3. **Cards can only be filtered by what they *are*, not what they *do*.** 139 fear/event/blight
   cards, sorted alphabetically, undifferentiated.
4. **The archive's adversaries and scenarios aren't browsable** — 8 adversary panels, 31 scenario
   faces, sitting in `images/manifest.json`, reachable from nowhere.

Reaching the destination means: no control in the app is dead or dishonest; the app knows what you
own; fear/event/blight cards carry a sub-type derived from their real rules text; and adversaries and
scenarios browse alongside the cards.

## Notes

- **The spec is [PRD.md](PRD.md)** — the destination written out in full. This map is the route to
  it. Where the two disagree, a ticket's `## Comments` win: they record what was actually decided
  while walking it. Note the PRD deliberately leaves #02, #04, #06 and #08's questions **open** — it
  states their constraints, not their answers.
- **This map carries execution**, like v4 and `asset-archive` before it. The destination is shipped
  code, not a spec. `task` tickets do the work; `grilling`/`prototype` tickets decide what the work
  is. A build ticket re-decides nothing — it implements its blocker's answer.
- **This repo fabricates when a source can't answer** (CLAUDE.md — it shipped five aspects that do
  not exist). The card sub-typing in [#02](issues/02-what-the-buckets-are.md) /
  [#03](issues/03-the-card-sub-type-classifier.md) is the highest-risk work on this map: it is one
  step away from "have a model look at the cards and guess". It is not that. The owner's call
  (2026-07-12) is **deterministic keyword rules over the card's real rules text**, in a committed,
  re-runnable script, where every card's tag traces back to a matched phrase. The *rule set* is
  judgment and gets marked as such, the way `shiftsToward` and `ratingsSource` already are.
- **The card text is real and machine-readable.** v4 #01's source (`sick.oberien.de/cards.js`, from
  `oberien/spirit-island-card-katalog`) carries `FearCard.level1/level2/level3`,
  `PowerCard.description`, and text on every event and blight class. See
  [v4/card-data-source.md](../v4/card-data-source.md) §2 for the full field inventory. Nothing on
  this map needs to read a card *image*.
- **Every new dataset arrives with a tripwire test** (`aspectCanon.test.ts`, `cardCanon.test.ts`).
- **The fixes ship first** (owner's call). [#01](issues/01-the-four-broken-controls.md) is unblocked
  and blocks nothing — burn it down before the features.
- Tracker mechanics: tickets are `issues/NN-slug.md`. Claim by adding an `Assignee:` line **before**
  working. Frontier = open, unassigned, every ticket in its `## Blocked by` closed (`Status: done`).

## Decisions so far

<!-- one line per closed ticket -->

- **[#01](issues/01-the-four-broken-controls.md) done** (2026-07-12): player-count clamp
  centralized in `src/domain/playerCount.ts`; tier list's player-count control/filter removed;
  Fear/Events/Blight's redundant "Type" row and `OtherCardFilterState.kinds` deleted; "Unrated"
  label rotated vertical instead of squashed.
- **[#02](issues/02-what-the-buckets-are.md) done** (2026-07-12), via `/grilling` against the real
  card corpus: events carry their 5 upstream classes verbatim (free, structural, single-tag); fear
  gets 5 keyword-derived multi-tag buckets (Removal/Defensive/Weaken/Disruption/Displacement);
  blight gets 4 keyword-derived multi-tag buckets (Presence loss/Board change/Damage bonus/Resource
  swing), marked as judgment data, with the "aggressive" axis dropped as unratable. Both fear and
  blight's unmatched cards get an explicit filterable "Unclassified" state, never a forced bucket.
  #03 unblocked.
- **[#03](issues/03-the-card-sub-type-classifier.md) done** (2026-07-12): `otherCardClassifier.ts`
  implements #02's rules verbatim; `other-cards.json` and its new source-text fixture regenerated;
  `OtherCard` is a discriminated union with `tagsSource: 'judgment'` on blight; Cards tab's sub-type
  filter ships per segment. Full-corpus tripwire test added (re-classifies every fear/blight card
  from committed source text, not a sample) after a code-review pass caught the original tripwire
  only covering an 11-card sample.
- **[#06](issues/06-what-i-own.md) done** (2026-07-12), via `/grilling`: expansion-level collection,
  one canonical name per expansion with a per-dataset raw-string mapping (spirits/power-cards/
  other-cards don't agree on raw strings, and Feather & Flame has zero cards). Annotate-by-default
  with an opt-in hard-filter toggle; Browse/Recommender/Tier-list respect it, Cards tab never does.
  Tier list keeps an unowned spirit in its rated row (dimmed), no separate grouping. Aspects are
  gated independently of their spirit - required sourcing `expansion` onto all 31 aspects, verified
  live against the wiki (not the asset archive's filename suffixes, which would have mis-tagged 2).
  Collection store mirrors `complexityStore`: absence = owns everything, backup stores only the
  turned-off deltas. #07a unblocked.
- **[#07a](issues/07a-the-collection-store.md) done** (2026-07-12): `collectionStore.ts` built,
  `Aspect.expansion` populated on all 31 aspects, `backup.ts` bumped to schema v3. Tier board dims
  an unowned configuration in its rated row (small corner marker, not a second text line - a
  116px tile has no room) and gained a session-only hard-filter toggle. A code-review pass caught
  the hard-filter path shipped with no UI consumer; fixed by wiring the toggle in rather than
  leaving it dead. Recommender/Browse/Cards untouched, as scoped - #07b/#07c next.

Two calls were made while charting, ahead of any ticket:

- **Card sub-typing is keyword rules over real card text**, not an LLM pass and not manual curation.
  Rationale in Notes above. [#02](issues/02-what-the-buckets-are.md) decides the buckets;
  [#03](issues/03-the-card-sub-type-classifier.md) writes the rules.
- **The collection is app-wide, not tier-list-only.** The owner asked for an expansion filter on the
  tier list; the same control would be re-invented on Browse, the Recommender and Cards within a
  month. It's one concept — [#06](issues/06-what-i-own.md) decides its shape.

## Not yet specified

- **Whether power cards also get a playstyle sub-type.** They carry `description` text too, so the
  same classifier could run over them. The owner only asked for fear/event/blight; judged after
  [#03](issues/03-the-card-sub-type-classifier.md) ships and the rule-writing cost is known.
- **Whether browsing an adversary cross-links to the Recommender's adversary picker** (and back).
  Real question, unanswerable before the adversary browse surface exists
  ([#05a](issues/05a-adversaries-browse.md)).
- **What happens to a tier list's ratings for spirits you don't own.** Hidden, greyed, or a
  separate "not in your collection" row? Depends on [#06](issues/06-what-i-own.md)'s hard-filter vs.
  annotate call.
- Carried from v4's fog, still open: **the Cards tab's shape beyond filtering** (sort order, empty
  state, deep-linking a single card, sharing a filtered set as a URL); **cross-links between spirits
  and cards**; **element-threshold matching** ("I have Sun+Fire, what can I play?").

## Out of scope

- **The LLM-based recommender** — teaching a model the game and having it suggest spirit *combos*
  against specific adversaries. The owner's stated next direction (2026-07-12), and a different
  destination entirely: a new recommendation engine, not a fix or a browse feature. It needs its own
  map, starting with "is this even viable on a static Pages site with no backend". Recorded here so
  it isn't lost; **not** worked on this map.
- **Rating or tiering cards.** Carried from v4: the tier machinery is spirit-shaped and the sources
  are spirit-shaped. Ranking 471 cards would be this repo inventing data. Note this is *distinct*
  from [#02](issues/02-what-the-buckets-are.md)'s sub-typing, which is descriptive (what the card
  does, from its text) rather than evaluative (how good it is).
- **Free-text search.** Owner declined it in v4; dropdowns and multi-selects only.
- **A phone-first rewrite.** v4 picked "responsive: nothing breaks" over a native-feeling shell.

```
fix                      decide                      build

01 four broken controls
   (unblocked, no deps)

                         02 what the buckets are ─── 03 the classifier

                         04 the tab's new name ───┬─ 05a adversaries browse ─┐
                                                  └──────────────────────────┴─ 05b scenarios
                                                                                 + the rename

                         06 what "I own" means ───── 07a collection store ──┬─ 07b the recommender
                                                        + the tier list     └─ 07c browse + cards
                                                                                 (may be closed
                                                                                  as out of scope)

                         08 the tag colour scheme ── 09 coloured tags everywhere
```

Frontier: **#01, #02, #04, #06, #08.** Five takeable now — one AFK task (#01), three grillings and
one prototype (all HITL).

**On the re-cut (2026-07-12):** the original #05 and #07 were each too big for one context window and
were split into tracer-bullet slices, each demoable alone. #05 split because adversaries and scenarios
are *different jobs*: adversaries have a canon-tested dataset already and the work is a join;
scenarios have **no dataset and no upstream source**, so the work is deriving one from the manifest and
finding out which fields honestly can't be sourced. #07 split because the store-plus-tier-list is
demoable without the Recommender, and the Recommender carries a real open question (does the collection
filter apply before or after ranking — the two give different answers). **#07c is provisional:** whether
the *Cards* tab should hide cards from expansions you don't own is genuinely doubtful — browsing an
expansion is partly how you decide to buy it — and #06 may close it rather than build it.
