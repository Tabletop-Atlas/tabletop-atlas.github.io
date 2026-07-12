# v5 — the controls tell the truth

Status: ready-for-agent

The spec behind [`.scratch/v5/MAP.md`](MAP.md). The map is the route; this is the destination written
out in full. Where the two disagree, the map's ticket Comments win — they record what was actually
decided while walking it.

**Read this first:** four of this map's nine tickets are **deliberately undecided** — the fear/blight
taxonomy ([#02](issues/02-what-the-buckets-are.md)), the tab's new name and adversary tile shape
([#04](issues/04-the-tabs-new-name.md)), what a collection filters ([#06](issues/06-what-i-own.md)),
and the tag colour scheme ([#08](issues/08-the-tag-colour-scheme.md)). This spec states them **as open
questions with their constraints**, and does not answer them. A spec that invented those answers would
be this repo doing the exact thing CLAUDE.md warns about. The build tickets implement their blocker's
answer, not this document's guess.

## Problem Statement

v4 made the app a knowledge base: 471 cards, filterable, responsive, deployed at a real URL. It works.
But using it turns up four things that are *wrong*, not merely missing — and three of them are the app
telling the user something untrue.

1. **Four controls lie.**
   - The tier tab has a **player-count dropdown**. Every tier list in the app is solo or unstated
     (`3mbg-strength-solo-2025` → 1 player, `sia-favorites-fun-solo-2026` → 1 player, the owner's own
     board → unstated). So the control can only ever *remove* lists: set it to 3 and the tab reports
     "No tier list exists for 3 players." It is a filter over an axis the data does not vary on, and
     the owner is not aware of a multiplayer spirit tier list existing anywhere, in this app or in the
     wild.
   - The **player-count input** advertises 1–6 and accepts anything. `min`/`max` on a number input are
     advisory — they gate the spinner, not the keyboard. Type `0` and the app takes it; clear the field
     and `Number('')` is `0`; and once it's empty, backspace has nothing left to delete, so the only
     way back to a valid state is the spinner arrows.
   - The **Fear/Events/Blight filter panel offers a "Type" control** — `fear | event | blight` toggle
     buttons — directly beneath a segmented switch that has *already* picked exactly one of those three.
     Two contradictory controls over one axis: you can sit on the Fear segment with `blight` pressed.
   - The tier board's **"Unrated" label** is squashed into the panel edge. The label column is sized for
     single letters (`S`, `A`, `B`) and "Unrated" is seven characters.

2. **The app assumes you own every expansion.** Every spirit from every box is always offered, ranked,
   and recommended, whether or not the user can put it on the table. A player who owns only the base
   game gets told to play a Jagged Earth spirit.

3. **139 cards can be filtered by what they *are*, but not by what they *do*.** Fear, event and blight
   cards sort alphabetically and differentiate by nothing else. A player looking for "a fear card that
   removes Invaders" has to read all fifty.

4. **The archive's adversaries and scenarios are unreachable.** 8 adversary panels, 16 scenario fronts,
   15 backs, 1 shared component — all in `images/manifest.json`, linked from nowhere in the app. The
   adversary data is *worse* than unreachable: `adversaries.json` already exists, already has all 8
   with their 0–6 level ranges, and already drives the Recommender — but a user cannot look at one.

## Solution

**Every control in the app does something true, and the browser covers the whole game.**

- The four dishonest controls are fixed or deleted. The player count clamps to 1–6 at its source; the
  tier list's player filter is removed (its `players` metadata stays, as *provenance* — "this list is a
  solo list" is a true and useful thing to display, it just isn't a filter); the redundant Type control
  is deleted; the Unrated label is made legible.
- The app learns **what you own**. One app-wide collection setting, defaulting to "everything", that
  narrows what the app offers you.
- Fear, event and blight cards gain a **sub-type derived from their real rules text**, and a filter
  control over it.
- **Adversaries and scenarios** join the card browser as new segments, and the tab is renamed to
  something that honestly covers what's in it.

The hard constraint is unchanged from v4, and this map's card-typing work is the closest this repo has
come to violating it: **no field is ever a model's guess.** The sub-types are not "have an LLM look at
the cards and tell me which are aggressive." They are **deterministic keyword rules matched against the
card's real, machine-readable rules text**, in a committed script, where every tag traces back to a
phrase that literally appears on the card. The *rule set* is a human judgment and is marked as such in
the data, exactly as `shiftsToward` and `ratingsSource` already are. A card that no rule matches gets
**no tag** — it is never forced into the nearest bucket.

## User Stories

**The broken controls**

1. As a player setting up a 4-player game, I want to type `4` into the player count, so that I don't
   have to click the spinner arrow four times.
2. As a player who mistyped, I want to clear the player-count field and type a new number, so that I'm
   not trapped in a `0` state I can only escape with the spinner.
3. As a player, I want the player count to refuse `0`, `-3` and `47`, so that the app never ranks
   spirits for a table that cannot exist.
4. As a player, I want the app to clamp my input rather than silently accept it, so that I never see a
   recommendation computed for an impossible game.
5. As a player on the tier tab, I don't want a player-count dropdown, so that I'm not offered a filter
   whose only possible effect is to hide every list.
6. As a player reading a tier list's citation, I still want to see that it's a solo list, so that I know
   what the ratings are ratings *of*.
7. As a player browsing fear cards, I don't want a control that lets me also select "blight", so that
   the app doesn't contradict the segment I just clicked.
8. As a player looking at a tier board, I want to read the word "Unrated", so that I understand the last
   row is "this source didn't rate these" and not "this source rated these badly".

**The collection**

9. As a player who owns only the base game, I want to tell the app that, so that it stops recommending
   spirits I can't play.
10. As a player, I want my collection to persist across visits, so that I set it once and not every time.
11. As a **first-time visitor** to the public site, I want to see the whole app without filling in a
    form, so that the knowledge base is useful to me before I've configured anything.
12. As a player, I want my collection to be part of my backup export, so that it moves with the rest of
    my state.
13. As a player with a partial collection, I want the tier board to handle spirits I don't own in a way
    that doesn't silently corrupt the list's meaning, so that I still understand what the source rated.
14. As a player considering buying an expansion, I want to still be able to *browse* what's in it, so
    that the collection setting helps me play and doesn't stop me shopping.
15. As a player, I want to know when the app's answer was narrowed by my collection, so that "your best
    spirit is one you don't own" is something I can find out rather than something hidden from me.
16. As a player who owns a spirit but not the expansion its aspect came in, I want the app to know the
    difference, so that it doesn't offer me a configuration I can't build.

**The card sub-types**

17. As a player, I want to filter fear cards by what they do, so that I can find the removal cards
    without reading all fifty.
18. As a player, I want to filter event cards by their structure — terror-level, healthy/blighted land,
    choice, stage — so that I can find the ones that interact with the island's state.
19. As a player, I want a card no rule could classify to still appear in the browser, so that the filter
    doesn't quietly hide a third of the deck.
20. As a player, I want to trust that a card's sub-type came from its actual text, so that I'm not
    filtering on a model's impression of a picture.
21. As the repo's maintainer, I want every tag traceable to the phrase that produced it, so that I can
    spot-check the classifier rather than believe it.
22. As the repo's maintainer, I want the sub-type rules to be re-runnable in one command, so that a
    source update reproduces the tags instead of requiring a re-transcription.
23. As the repo's maintainer, I want a tripwire test that fails when the committed tags and the
    classifier's output diverge, so that an accidental rule edit breaks the build rather than shipping.
24. As the repo's maintainer, I want the judgment-derived tags marked as judgment in the data, so that
    nobody reading `other-cards.json` in a year mistakes them for source facts.
25. As a player, I want the sub-type filter to compose by AND with the expansion filter, so that filters
    behave the same way everywhere in the app.

**Adversaries and scenarios**

26. As a player, I want to look at an adversary's panel, so that I can read what I'm about to play
    against without finding the physical card.
27. As a player, I want to see an adversary's difficulty levels, so that I can pick a level before I set
    up.
28. As a player, I want to browse the scenarios, so that I can decide which one to play.
29. As a player, I want to enlarge an adversary or scenario the same way I enlarge a card, so that the
    browser behaves consistently.
30. As a player, I want the tab's name to describe what's in it, so that I know where to look for a
    scenario.
31. As the repo's maintainer, I want the adversary browser to read the `adversaries.json` that already
    exists, so that there is one adversary record and not two that can drift apart.

**The tags**

32. As a player scanning the Browse tab, I want a spirit's tags to be visually distinct, so that I can
    spot an aggressive spirit without reading every line.
33. As a player, I want to see a spirit's playstyle tags — aggressive, fast-tempo, blight-positive —
    under its name, so that I get the same at-a-glance read I currently get for expansion and complexity.
34. As a colour-blind player, I want a tag's meaning to survive greyscale, so that the colour scheme is
    decoration and not the only channel carrying information.
35. As a player on a phone, I want a spirit with a long name and five tags to still render correctly, so
    that the tile doesn't break at 375px.
36. As the repo's maintainer, I want a tag nobody has assigned a colour to still render legibly, so that
    adding a new tag to `spirits.json` doesn't require touching the colour scheme.

## Implementation Decisions

### Settled while charting

- **Card sub-typing is deterministic keyword rules over real card text.** Not an LLM pass, not manual
  curation. The card text is machine-readable and already sourced (v4 #01): `FearCard` carries
  `level1`/`level2`/`level3`, `PowerCard` carries `description`, every event and blight class carries
  text. **Nothing on this map reads a card image.**
- **The classifier is build-time, not runtime.** The rules live in the extraction script; the tags are
  a committed field on `other-cards.json`; the app reads a field. There is deliberately **no
  `classifyCard()` module in the domain layer** — the rules don't run on page load, and the output is
  inspectable in the committed JSON rather than only observable by running the app.
- **Events probably need no rules at all.** v4 #01 found the source already models events as five
  distinct classes — `ChoiceEventCard`, `StageEventCard`, `TerrorLevelEventCard`,
  `HealthyBlightedLandEventCard`, `AdversaryEvent`. Those *are* the healthy/blighted and terror-level
  buckets the owner described. Where a sub-type can be carried through from the source's own class, it
  is **source data** and must be typed and marked differently from the keyword-derived tags. #02
  confirms; if it holds, the event half of the taxonomy costs nothing.
- **The collection is app-wide, not tier-list-local.** The owner asked for a tier-list expansion filter;
  the same control would be reinvented on Browse, the Recommender and Cards within a month. One concept,
  one store.
- **The collection's default is "owns everything."** A first-time visitor to a public knowledge base has
  not filled in a form and must not meet a crippled app. This is the one bug that would silently break
  the site for every user who isn't the owner.
- **Adversaries and scenarios are new segments on the existing tab**, not a new tab. The tab is renamed.
- **`playerCount` stays in the Recommender.** Only the *tier list's* use of it goes. `noteRelevance`
  uses it to decide whether a spirit's note ("shines in solo") applies — that's a live, correct use.

### Modules

- **`otherCardFilter`** (existing) — gains the sub-type axis. Its current narrowness is *deliberate*:
  v4 #13 made `OtherCardFilterState` structurally incapable of requesting a field these cards lack, so
  that "no dead control is ever offered" is type-enforced rather than checked at runtime. **That
  property must survive.** If #02's three taxonomies are disjoint (a fear bucket is not a blight
  bucket), the type system should say so rather than sharing one loose `string[]`.
- **The extraction scripts** (existing, `extract-other-cards.mjs`) — gain the rule table. Re-runnable in
  one command, no network dependency beyond the `cards.js` they already fetch. The script can print,
  for any card, the phrase that triggered its tag.
- **`collectionStore`** (new) — mirrors `complexityStore`: same `KeyValueStorage` injection, same
  create-function-plus-default-instance shape, same participation in `backup.ts`'s schema. Adding it to
  the backup blob is a schema change; follow the existing versioning.
- **The collection filter** (new) — a **pure function in the domain layer** taking the collection and a
  list of spirits/configurations/cards and returning what's in it. Components hold no filtering logic.
  This is how `recommend()`, `configurations`, `filterPowerCards()` and `filterOtherCards()` are already
  built, and it's what makes it testable without React. It composes by **AND** with every existing
  filter (v4 #03's rule, app-wide).
- **`clampPlayers()`** (new, tiny) — the root-cause fix. The recommender's `setPlayerCount` routes
  through it, so the clamp exists in **one** place and the next player-count input added is correct by
  construction rather than by remembering. Bounds 1–6.
- **The card browser components** — the tab is renamed; the segmented switch grows two segments; the
  sub-type control replaces the deleted Type control. `CardViewer` (lifted out standalone by v4 #10 for
  exactly this) is reused for adversary and scenario enlargement.
- **`SpiritTile`** — today renders `{expansion} · {complexity}` as bare text and drops `spirit.tags`
  entirely. It gains coloured tag chips. The chip component's colour map is a **lookup with a neutral
  default**, not an exhaustive map: `spirits.json`'s `tags` is an open set and an unknown tag must
  render legibly, not crash.

### The Recommender's ordering question

`recommend()` ranks configurations. A collection filter can apply **before** ranking (an unowned spirit
never competes) or **after** (it competes, then is dropped, leaving the others' order untouched). These
produce different results. [#06](issues/06-what-i-own.md) must decide which; the build ticket must not
pick one by default.

### Open — decided by ticket, not here

- **The fear and blight bucket sets**, whether a card can hold more than one tag, and what happens to an
  unmatched card — [#02](issues/02-what-the-buckets-are.md). **The blight axis is at risk**: "more
  aggressive vs. less aggressive" is an *evaluative* judgment, which is the axis this repo has ruled out
  of scope for cards. #02 is instructed to push toward a *descriptive* alternative (what the blight card
  does) and, failing that, to drop blight's sub-type rather than fabricate a rating.
- **The tab's new name**; whether a scenario's front and back are one flipping tile or two; whether an
  adversary tile shows just the panel or the panel plus the data that already exists —
  [#04](issues/04-the-tabs-new-name.md).
- **The collection's granularity** (are Promo and Promo 2 even checkboxes?), **hard filter vs.
  annotation**, which surfaces respect it, how the tier board treats unowned spirits, and whether aspects
  are gated independently of their spirit — [#06](issues/06-what-i-own.md).
- **The tag colour scheme** — [#08](issues/08-the-tag-colour-scheme.md). It's a prototype, not a spec:
  three axes are in play (expansion is categorical, complexity is *ordinal* and wants a ramp, playstyle
  tags are categorical and open) and a scheme that treats them identically reads as noise. One thing #08
  must surface rather than discover in the build: the owner wants coloured tags "visible in the dropdown"
  — a native `<select>` option cannot hold a styled span, so if that's the real ask, the dropdown has to
  stop being a native select, and that's a cost worth knowing about now.

## Testing Decisions

A good test here asserts **external behaviour** — what a function returns, what the user sees — and
never reaches into how it got there. The domain layer is a set of pure functions and injectable stores
precisely so this is possible without React, and every seam below is chosen so the test can be written
against a function rather than a rendered component.

**Reused seams (preferred — no new ones needed):**

- **`filterOtherCards()`** — the sub-type filter is tested here, extending
  `src/domain/__tests__/otherCardFilter.test.ts`. Prior art: `powerCardFilter.test.ts`, which pins v4
  #12's AND semantics. Assert composition (sub-type AND expansion), not the internals.
- **The canon-test pattern** — the classifier's tripwire is one more of these. Prior art:
  `cardCanon.test.ts`, `aspectCanon.test.ts` (which exists because this repo shipped five aspects that
  do not exist), `adversaryCanon.test.ts`, `startingCardsCanon.test.ts`. The test re-runs the rules over
  the committed text and fails if the output and the committed tags diverge. **This is the single most
  important test on this map** — it is what makes the judgment-derived data safe.
- **`adversaryCanon.test.ts`** — must still pass, unmodified, after #05a. It is the proof that the
  adversary browser read the existing dataset rather than forking a second one.
- **`dataIntegrity.test.ts` / `assetArchive.test.ts`** — the new adversary and scenario datasets assert
  their counts against `images/manifest.json` (8 adversaries, 16 scenario fronts), so a missing image
  fails the build rather than rendering a hole in the grid. Note **16 fronts, 15 backs** — one scenario
  has no back, and the test should encode that as a known fact rather than a tolerance.

**New seams (two, both mirroring existing prior art):**

- **`collectionStore`** — tested exactly as `complexityStore.test.ts` tests its twin: inject a fake
  `KeyValueStorage`, assert persistence, assert the export/backup filter. Plus the one test that matters
  most: **an untouched collection narrows nothing, anywhere.**
- **`clampPlayers()`** — a unit test proving `0 → 1`, `9 → 6`, `-3 → 1`, and that the empty string
  doesn't crash. This is the reason the clamp is a function rather than three lines in an `onChange`:
  the bug is testable without rendering React.

**Not unit-tested, verified in a real browser instead:** the tag colour scheme, the Unrated label, the
renamed tab, and every layout question. `playwright` has been a dev dependency since v4 #14 for exactly
this. Screenshot at 375px and desktop against a **production build**, as #11, #12, #13 and #14 all did.
Contrast and greyscale-survival for the tag chips are checked by eye, not asserted.

## Out of Scope

- **The LLM-based combo recommender** — teaching a model the game and having it suggest spirit *combos*
  against specific adversaries. The owner's stated next direction (2026-07-12) and a genuinely different
  destination: a new recommendation engine, not a fix or a browse feature. It needs its own map, and the
  first question that map has to answer is whether it is viable at all on a static GitHub Pages site with
  no backend. Recorded so it isn't lost; **not built here**.
- **Rating or tiering cards.** Carried from v4: the tier machinery is spirit-shaped and the sources are
  spirit-shaped; ranking 471 cards would be this repo inventing data. This is *distinct* from #02's
  sub-typing, which is **descriptive** (what a card does, from its text) rather than **evaluative** (how
  good it is) — and the boundary between the two is exactly what makes blight's "aggressive" axis the
  riskiest item on this map.
- **Sub-typing power cards.** They carry `description` text, so the same classifier could run over them.
  The owner asked only for fear/event/blight. Judged after #03 ships and the cost of writing rules is
  known, not before.
- **Free-text search.** The owner declined it in v4: dropdowns and multi-selects only, because a closed
  vocabulary can only ask questions the data can answer.
- **A phone-first rewrite.** v4 chose "responsive: nothing breaks" over a native-feeling shell.
- **Making tags clickable filters on Browse.** #08 may make this look obvious. The owner did not ask for
  it. Surface it, don't build it.

## Further Notes

The fixes ([#01](issues/01-the-four-broken-controls.md)) are one ticket, not four, and they ship first
(owner's call). They decide nothing and block nothing — four small diffs, one session, one verification
pass. Do not let them wait behind the grillings.

The four fixes are merged for a reason worth stating: parallelising four one-line changes across four
agent sessions costs more in context than it saves in wall-clock.

**The build tickets were re-cut into tracer-bullet slices on 2026-07-12**, each demoable alone:
adversaries ([#05a](issues/05a-adversaries-browse.md)) and scenarios
([#05b](issues/05b-scenarios-and-the-rename.md)) split because they are different jobs — one is a join to
a dataset that already exists and is canon-tested, the other is deriving a dataset from a source that
mostly cannot answer. The collection split three ways
([#07a](issues/07a-the-collection-store.md) / [#07b](issues/07b-the-recommender-respects-the-collection.md)
/ [#07c](issues/07c-browse-and-cards-respect-the-collection.md)) because the store plus the tier list is
demoable without the Recommender, and the Recommender carries the pre-filter-vs-post-filter question that
nothing else does. **#07c is provisional and may be closed rather than built** — see its own body.

The riskiest thing on this map is not technical. It is that "cluster the fear cards by what they do" and
"have a model guess which blight cards are aggressive" *sound like the same request*, and this repo has
already shipped fabricated OCFDU ratings, wrong elements, and five aspects that do not exist. The
mechanism decision (keyword rules over real text, build-time, traceable, tripwired, marked as judgment)
exists to keep those two apart. Anyone tempted to relax it should read CLAUDE.md first.
