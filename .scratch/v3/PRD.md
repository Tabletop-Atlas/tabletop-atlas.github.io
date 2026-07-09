# PRD: Spirit Island Recommender v3 — tier lists as cited documents

Status: ready-for-agent

## Problem Statement

The app has exactly one tier list, and it never says whose it is or what it measures.

`tiers.json` is a flat map of 68 configuration ids to letters. Its `_note` calls it "Owner's own
tier list, transcribed from their TierMaker board". Nothing in the app surfaces that. A visitor sees
seven lettered rows and no author, no date, no methodology, and no way to tell a strength read from
a taste read. There is only one opinion, and it is anonymous.

Three things follow from that, and each is a problem the owner has actually hit:

**Other people's tier lists have nowhere to go.** There are good published rankings — YouTube
reviewers, community consensus threads — and the owner has built a scraper that turns a video into
structured rankings. There is nowhere in the data model to put the result. A second list cannot be
added without overwriting the first.

**Player count does nothing.** The recommender takes a player count and feeds it to exactly one
consumer: `isRelevantToPlayerCount`, which decides whether a spirit's free-text note gets
highlighted. It does not touch ranking. The owner's complaint — "it is not doing anything" — is
very nearly literally true. Meanwhile the thing that *should* vary with player count is the tier
itself: a spirit that is strong at four players may be a trap solo, and published lists say so
explicitly. The 3MBG list the owner scraped is a **solo** ranking. That fact currently has nowhere
to live.

**A partial list would silently invent 32 opinions.** `groupByTier` fills any missing key with
`FALLBACK_TIER = 'B'`. Today a data-integrity test keeps that branch unreachable, because the one
shipped list happens to cover all 68 keys. The first imported list breaks that. The scraped 3MBG
list covers 36 of 37 base spirits (it never mentions Fathomless Mud of the Swamp) and **none** of
the 31 aspects. Loaded as-is, the app would render 32 confident **B** tiers that the source never
stated, attributed to a named author, on a public site.

That last one is not a rendering bug. It is this repo's documented failure mode — shipping a
plausible guess where a source could not answer — relocated from the dataset into the view layer.
The repo has already shipped invented OCFDU ratings, wrong elements on seven of nine spirits
checked, and five aspects that do not exist. Adding a scraper that reads tiers off a video
transcript industrialises exactly that hazard. The data model has to make absence
representable, or the guesses come back.

## Solution

**A tier list becomes an entity: a cited document with an author, a type, a player count, its own
tier vocabulary, and a partial set of ratings.**

The owner's board is one such document — typed `strength`, origin `personal`, the only list that
covers all 68 configurations. The scraped 3MBG list is a second — typed `strength`, `players: 1`,
origin `cited`, covering 36 keys and honest about the other 32. The owner expects around ten.

From that one modelling move, each problem dissolves:

- **Other lists have a home.** A `tier-lists/` directory, one file per list, each pinned by a canon
  tripwire test in the tradition of `aspectCanon.test.ts`. The scraper writes to a published
  contract (`tier-list-schema.md`).

- **Player count becomes load-bearing without anyone inventing a number.** A list declares the
  player count it was made for. Choosing 1 player filters the picker to solo lists. Nobody derives
  a solo tier from a 4-player tier; if no list exists for a count, the app says so. Player count is
  *metadata you select on*, never a delta anyone authors.

- **Absence becomes visible.** `Tier` becomes `Tier | undefined`. `FALLBACK_TIER` is deleted. The
  board grows an **Unrated** bucket below F that names what this source did not cover. A list
  rating 36 of 68 configurations is a *correct* list; the 32 holes are information about the
  source, and filling them destroys that information.

Two supporting decisions make the entity model work.

**Each list keeps its own tier vocabulary.** The owner's board runs `X S A B C D F`; the 3MBG list
runs `S A B C D F`. Normalising one onto the other means deciding whether X and S mean the same
thing — a judgment, made invisibly, by whichever component happened to touch the data first.
Instead each list declares `tierLabels`, strongest first, and rank is the label's **position** in
that array. Position is mechanical. `recommend` receives normalised ranks and stops knowing what a
tier letter is.

**Cited lists are read-only.** Editing 3MBG's list makes it no longer 3MBG's list. Only `personal`
lists take user edits, and `tierStore`'s override machinery keys those by list id.

Separately, and much smaller: **the Browse tab gets clickable spirit detail.** It shows the spirit's
panel front and back — on which growth options, presence tracks and innate powers are all already
printed — its four starting power cards, and the data the app already has.

Both are shown as **images**. Nothing is transcribed, because nothing computes on a growth track or
a card's rules text. The one exception is the four starting card *names* per spirit, which the
images need for their alt text; those are names, not rules, and a tripwire test pins them.

## User Stories

**Reading tier lists**

1. As a visitor, I want to see who authored the tier list I am looking at, so that I can judge how
   much to trust it.
2. As a visitor, I want to see a link to the tier list's source, so that I can go watch or read the
   original.
3. As a visitor, I want to see whether a tier list ranks strength or fun, so that I do not mistake
   someone's taste for a power ranking.
4. As a visitor, I want to see the player count a tier list was made for, so that I do not apply a
   solo ranking to a four-player table.
5. As a visitor, I want to read the list's methodology note in the author's own framing, so that I
   understand what it covers and what it excludes.
6. As a visitor, I want to see the date a list was published, so that I can discount rankings made
   before an expansion changed the meta.
7. As a visitor, I want each list rendered in its own tier vocabulary, so that a six-band list is
   not stretched onto seven bands it never had.
8. As a visitor, I want to see an explicit Unrated bucket, so that I can tell "this source rated it
   badly" from "this source never rated it".
9. As a visitor, I want the Unrated bucket to explain itself in words, so that an empty-looking row
   does not read as a bug.
10. As a visitor, I want to see a list's coverage at a glance (rated N of 68), so that I know how
    complete it is before I lean on it.
11. As a visitor, I want to see when a list has not been verified against its source, so that I
    treat machine-scraped rankings with appropriate suspicion.

**Choosing between tier lists**

12. As a user, I want to pick which tier list I am viewing, so that I can compare opinions.
13. As a user, I want my chosen list to persist across page loads, so that I do not reselect it
    every visit.
14. As a user, I want the list picker to show only lists matching my chosen player count, so that
    the count I set actually changes what I see.
15. As a user, I want to be told when no list exists for my player count, so that I understand why
    the picker is empty rather than assuming the app is broken.
16. As a user, I want to filter lists by type, so that I can look at fun rankings and strength
    rankings separately.
17. As a user, I want my own board to be the default selected list, so that the app opens on the
    opinion I trust most.

**The recommender**

18. As a user, I want the recommender to score against whichever list I have selected, so that my
    recommendations reflect the ranking I chose to trust.
19. As a user, I want a configuration the active list never rated to be neither promoted nor buried,
    so that an unrated spirit competes on its fit rather than on an invented tier.
20. As a user, I want my player count to change which tier prior the recommender uses, so that the
    control does something.
21. As a user, I want the recommender to tell me which list it scored against, so that I can trace
    why a spirit ranked where it did.

**Editing**

22. As the owner, I want to edit my own tier lists, so that I can keep my board current.
23. As the owner, I want cited lists to be read-only, so that I cannot accidentally corrupt a
    citation and misattribute my own opinion to someone else.
24. As the owner, I want the UI to explain why a cited list cannot be edited, so that a disabled
    control does not read as a bug.
25. As the owner, I want my edits to one list to leave my other lists untouched, so that fixing my
    strength board does not disturb my fun board.
26. As the owner, I want to create a personal Fun list, so that I can record what I enjoy playing
    separately from what is strong.
27. As the owner, I want a new personal list to start fully unrated rather than pre-filled, so that
    I can see honestly how much of it I have actually rated.
28. As the owner, I want to reset a single personal list to its shipped seed, so that I can undo a
    session of bad edits without losing my other lists.

**Data safety**

29. As the owner, I want my existing tier edits to survive the upgrade to the entity model, so that
    v3 does not silently discard the work v2 warned me about losing.
30. As the owner, I want to be told if any edits were discarded by the migration, so that a silent
    loss cannot happen (the v2 `wasDiscarded` guarantee, preserved).
31. As the owner, I want to export a backup containing my edits to every personal list, so that
    nothing is left behind.
32. As the owner, I want to import a v1-schema backup, so that a backup taken before v3 still
    restores.
33. As the owner, I want an import that references a list id I no longer have to report that, so
    that stale keys surface rather than vanish (the existing `unresolved` behaviour, extended to
    list ids).

**Importing scraped lists**

34. As the owner, I want a published schema contract for my out-of-repo scraper, so that its output
    drops into the repo without reshaping.
35. As the owner, I want the scraper to resolve spirit names against the canonical id list, so that
    it can never invent a configuration id.
36. As the owner, I want a name the scraper could not resolve to be reported rather than dropped, so
    that a mis-transcription is visible instead of invisible.
37. As the owner, I want the scraper to flag tiers it was unsure of, so that I know where to spend
    my verification effort.
38. As the owner, I want the scraper to be structurally unable to mark its own output verified, so
    that only a human comparing list to source can confer that status.
39. As the owner, I want every imported list pinned by a canon tripwire test, so that a later edit
    to the data fails a test rather than drifting silently.
40. As the owner, I want a list whose tiers reference an unknown configuration id to fail a test, so
    that a scraper bug cannot ship.
41. As the owner, I want a list using a label outside its own declared vocabulary to fail a test, so
    that the vocabulary means something.

**Spirit detail**

42. As a visitor, I want to click a spirit in Browse, so that I can see more than a tile shows.
43. As a visitor, I want to see the spirit's panel front, so that I can read its growth options and
    presence tracks without leaving the app.
44. As a visitor, I want to see the spirit's panel back, so that I can read its innate powers and
    setup.
45. As a visitor, I want to see the spirit's four starting power cards as images, so that I can read
    exactly what I open the game holding.
46. As a visitor, I want each card image labelled with its card name, so that the detail view is
    usable with a screen reader and I can search for a card by name.
47. As a visitor, I want to enlarge a card image, so that I can read its rules text on a phone.
48. As a visitor, I want a spirit whose panel or card images are missing to render without breaking,
    so that a partially-assetted spirit degrades rather than crashes.
49. As a visitor, I want to see the spirit's OCFDU radar in the detail view, so that I can read its
    shape at a glance.
50. As a visitor, I want to see the spirit's tier under the active list, so that detail and board
    agree.
51. As a visitor, I want to see the spirit's aspects and what each one changes, so that I can weigh
    a configuration rather than a bare spirit.
52. As a visitor, I want to see when a spirit's OCFDU ratings are an estimate rather than printed,
    so that I know which numbers to trust (the existing `ratingsSource` marker, surfaced).
53. As a visitor, I want to close the detail view and return to my filtered list, so that browsing
    is not a dead end.

## Implementation Decisions

**`TierList` becomes the unit of tier data.** Its shape is settled and published at
`.scratch/v3/tier-list-schema.md`, which doubles as the contract for the owner's out-of-repo
scraping agent. The decision-carrying fields:

```ts
interface TierList {
  id: string                     // stable slug; keys persistence and selection. Never renamed.
  name: string
  type: 'strength' | 'fun'       // closed set
  players?: number               // the count the source ranked FOR. Absent = source never said.
  origin: 'cited' | 'personal'   // cited => immutable; personal => editable
  tierLabels: string[]           // this list's own vocabulary, strongest first
  methodology: string
  source?: SourceCitation        // required when origin is 'cited'
  verified: boolean              // false until a human checks list against source
  tiers: Record<string, string>  // configId -> label. ABSENT KEY = NOT RATED.
  uncertain?: string[]           // scraper assigned it but was unsure
  unresolved?: { heard: string; at?: string }[]
}
```

**Absence is the load-bearing invariant.** A configuration the source did not rate has **no key**
in `tiers`. Not `null`, not a default, not the middle band, not inherited from another list. This is
the same rule that governs `shiftsToward` and `ratingsSource`, applied to a dataset that will be
machine-generated from video transcripts — the highest-fabrication-risk input this repo has ever
taken.

**Rank is a position, not a letter.** `rank = index / (tierLabels.length - 1)`, giving `0` for the
strongest band and `1` for the weakest, computed against the list's own vocabulary. No component
ever decides whether one list's `S` equals another's `X`. A single-band list (`length === 1`) ranks
everything `0`; the tripwire test covers it.

**No new seams.** The change lands entirely on modules that already exist:

- **`tierStore`** absorbs the entity model. It gains a notion of the *active list*, exposes the
  shipped lists and their metadata, resolves `configId -> Tier | undefined` against the active
  list, and emits normalised ranks for the recommender. Overrides key by `listId` and are refused
  for `origin: 'cited'` lists. The existing seed-fingerprint discard guarantee — including
  `wasDiscarded` — is preserved per list.
- **`recommend`** takes `tierPrior?: Record<string, number>` (normalised rank) instead of
  `Record<string, Tier>`. `TIER_VALUE` is **deleted**; `recommend` no longer imports `Tier`.
  `NEUTRAL_TIER_VALUE` stays: a missing entry is scored mid-scale, which is an explicit refusal to
  move the score rather than an invented tier. Unrated is a *display* concern.
- **`backup`** bumps `CURRENT_SCHEMA_VERSION` to `2`. `BackupState.tiers` becomes
  `Record<listId, Record<configId, string>>`. A v1 backup migrates on import by attributing its
  flat override map to the owner's personal strength list. The existing `unresolved` reporting
  extends to unknown list ids.
- **`groupByTier`** returns an additional unrated bucket and **`FALLBACK_TIER` is deleted**.
  Deleting it, rather than leaving it unreachable, is the point: it is the one line standing
  between a partial list and 32 fabricated tiers.

**Migration of existing overrides.** The v2 README records this as a permanent constraint: any
change to `tiers.json` moves its fingerprint and discards the owner's overrides, and since issue
\#15 the app at least *reports* the loss. Restructuring `tiers.json` into an entity necessarily
moves that fingerprint. The migration therefore reads the v2 payload shape explicitly and re-stamps
it against the owner's personal strength list rather than letting the fingerprint guard eat it. A
payload that cannot be migrated is still discarded, and still reported.

**Data layout.** One file per list under `src/data/tier-lists/`. The owner's board moves there
unchanged in content, gaining the entity wrapper and `type: 'strength'`, `origin: 'personal'`,
`tierLabels: ['X','S','A','B','C','D','F']`. `src/data/tiers.json` is deleted.

**Spirit detail is images over existing data.** A route or modal in Browse showing the spirit's
panel front and back, its four starting power cards, and the `spirits.json` fields the app already
holds.

Growth options, presence tracks, innate powers and card rules text are **not** transcribed. Nothing
computes on them, and every hand-typed rules string is a fabrication opportunity this repo has
already paid for three times. They are legible on the images.

**One new field: `startingCards: string[]`** on `Spirit` — the four card *names*, in panel order.
It exists for two reasons and no others: four images on one page need four distinct alt texts, and
an explicit list beats an unverifiable filename convention for mapping spirit to card. Names are
transcribed from the panel front, never recalled from memory, and pinned by a tripwire test. **No
cost, speed, range, target, element or effect field is added.** The moment one is, the fabrication
surface returns.

**Assets.** Panels at `public/panels/<spiritId>-{front,back}.webp`; cards at
`public/cards/<spiritId>-<n>.webp` where `n` is the index into `startingCards`. Both sit alongside
the existing 37 art files in `public/spirits/`. A missing image renders the existing
`PlaceholderArt` rather than breaking the view — 259 assets will not all arrive at once.

**Aspect configurations show their base spirit's panel and cards.** Some aspects alter a spirit's
starting cards or panel; the repo has no data on which, and this spec will not guess. The detail
view shows the base spirit's images and the aspect's transcribed `delta` text. Establishing which
aspects replace which cards is a separate transcription job with its own tripwire.

**Elements, adversaries, complexity, the game log and the questionnaire are untouched.**

## Testing Decisions

A good test here exercises **external behaviour against small fixtures**, never `localStorage`
directly and never the React tree — the standing rule from v1 and v2, and the reason 174 tests run
in a fraction of a second. Tests state a fact about the domain, not a fact about the implementation.

- **`tierStore.test.ts`** (extend). Active-list selection and its persistence. `getTier` returns
  `undefined` for an unrated configuration and never a fallback. Overrides on a `personal` list are
  applied; overrides on a `cited` list are refused. An edit to one list does not leak into another.
  Rank normalisation across differing `tierLabels` lengths, including the single-band edge case.
  The fingerprint discard guarantee, per list. Existing tests use an in-memory `KeyValueStorage`;
  keep doing that.
- **`recommend.test.ts`** (extend). A configuration absent from `tierPrior` scores identically to
  one at the neutral rank. Two lists with different vocabularies but the same *position* for a
  spirit produce the same prior. Prior can never fully override fit — the existing `ALPHA_MAX`
  assertion, retained.
- **`backup.test.ts`** (extend). A v1 backup round-trips into the v2 shape. A v2 backup carrying
  edits to several personal lists restores each. An import naming an unknown list id lands in
  `unresolved` rather than being dropped or applied. Prior art: the existing v1 `unresolved` tests.
- **`groupByTier`** via `tierStore.test.ts`. Unrated configurations land in the unrated bucket; a
  full-coverage list leaves it empty.
- **`tierListCanon.test.ts`** (new tripwire, modelled directly on `aspectCanon.test.ts`). For every
  shipped list: every `configId` in `tiers` exists in `spirits.json`; every label in `tiers` appears
  in that list's `tierLabels`; `tierLabels` has no duplicates; `origin: 'cited'` implies a `source`
  with a URL; `verified` is a boolean. The owner's list is additionally pinned to full 68-key
  coverage by a deliberate duplication of its expected keys, so drift fails loudly.

Note what a tripwire actually protects against, per the v2 README: **drift, not fabrication.** A
test written alongside scraped data cannot tell you the scraper misheard a letter. That is what
`verified: false`, `uncertain` and `unresolved` are for, and verification remains a human job.

- **`dataIntegrity.test.ts`** (extend). Every spirit has exactly four `startingCards`; every name is
  non-empty and unique within its spirit. This is a shape test, not a truth test — it cannot know
  whether the names are the right ones. Cross-checking them against the panel is a human job, like
  the aspect transcriptions before them.
- **`appSmoke.test.tsx`** (extend). The one UI test, server-rendered: the app boots with a list
  selected, and the spirit detail view renders for a spirit — including for a spirit with no panel
  or card images present, which must fall back to `PlaceholderArt` rather than throw.

## Out of Scope

- **Survey-free team composition.** Its objective function — how to weigh OCFDU against tier
  against fun against playstyle — is a v4 design effort. v3's job is to make sure the data model
  can serve it. It cannot be tested before the data exists.
- **Structured starting card data** — cost, speed, range, target, elements, effect text. The detail
  view shows card *images*; nothing filters or computes on them. Rows get transcribed when something
  reads them, against a source the research ticket has by then identified. Card names are the sole
  exception, and exist only to label the images.
- **Which aspects replace which starting cards.** Unknown, and not guessable. A separate
  transcription job.
- **The minor/major power card gallery.** Blocked on research nobody has done: how many cards exist
  per expansion, whether a citable machine-readable dataset already exists, and what the reuse terms
  are. Guessing any of those three is how this repo shipped five aspects that do not exist. A
  research ticket precedes any transcription.
- **Structured growth options, presence tracks and innate powers.** Displayed via the panel image.
  Transcribed only when something needs to compute on them, which nothing does.
- **Rights and licensing.** The app already ships 37 pieces of copyrighted spirit art on a public
  GitHub Pages deploy, and the requested logo change adds a trademark. This is a live question
  today, not one the gallery creates — but it is a research question, not a code change, and it
  gates the gallery rather than v3. Note that v3 raises the exposure from 37 images to roughly 259
  (37 art + 74 panels + 148 cards), which is a change of degree, not of kind. It is worth settling
  before the Reddit post rather than after.
- **Posting to Reddit.** No decisions in it.
- **The logo swap and centering the questionnaire.** An afternoon each, no design questions, no
  spec needed. Just do them.
- **Blending or averaging tier lists into a consensus ranking.** Averaging sources with different
  methodologies and coverage produces a number no source ever stated.
- **Authoring player-count deltas.** Player count is metadata on a cited list. Deriving a solo tier
  from a four-player tier is the owner inventing data.

## Further Notes

**The scraper is the sharpest hazard in this spec.** An LLM reading tiers off a YouTube transcript
is the repo's documented failure mode — a plausible guess where the source could not answer — with
a loop around it. Three defences, all structural rather than procedural:

1. `verified` is `false` on every scraper output. The scraper cannot set it `true`. Only a human
   comparing the list against the video can.
2. `uncertain` and `unresolved` give the scraper somewhere to put doubt. A model with a channel for
   "I could not hear that" is far less likely to emit a confident wrong letter.
3. An absent key is a *legal, expected, common* state. The model never has to fill a cell.

Whether an unverified list may feed `recommend()` at all — or only display — is deliberately left
open. It is a one-line policy decision, but it is the owner's to make once real scraped lists exist
and their quality is visible.

**Sequencing.** The migration story (user stories 29–33) must land with the data restructure, not
after it. The v2 README's sequencing constraint is explicit that a `tiers.json` fingerprint change
destroys overrides, and it warns that the constraint is "permanent, not spent". v3 moves that
fingerprint by definition. The owner's board is real data.

**Coverage will look bad, and that is the feature.** The moment the 3MBG list loads, the Unrated
bucket will hold 32 of 68 configurations. That is not a defect to be tuned away. It is the app
finally telling the truth about what a source did and did not say.
