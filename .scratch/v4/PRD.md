# v4 — the knowledge base

Status: done

The spec behind [`.scratch/v4/MAP.md`](MAP.md). The map is the route; this is the destination
written out in full. Where the two disagree, the map's ticket Comments win — they record what was
actually decided while walking it.

## Problem Statement

The app answers exactly one question: *which spirit should I play?* It does it well — 68
configurations, cited tier lists, a questionnaire, a game log — but a Spirit Island player spends far
more of their evening looking at **cards** than at spirits, and for that they leave and go to SICK
(`sick.oberien.de`). SICK works but is plain, and it is not where the rest of their Spirit Island
knowledge lives.

Three things stop this app from being the place they'd go instead:

1. **There is no way to look at a card.** The repo now holds 471 card images — 101 minor, 78 major,
   153 unique, 65 event, 50 fear, 24 blight — sitting in a git-ignored archive directory, reachable
   by no one. A player who wants "every major with Fire that costs 3 or less" cannot ask.
2. **It does not work on a phone.** The owner wants to hand the URL to a friend across the table
   mid-game. The layout is a desktop command deck: a persistent sidebar beside a dense main pane.
   Nobody has ever driven it at 375px, so nobody knows what breaks.
3. **It presents as a personal project.** The brand is the string `SPIRIT ISLAND` in a `<div>`, and
   the URL is `adamkubovic.github.io/spirit-island/` — the owner's name is in the address bar of a
   site he wants to share.

## Solution

The app becomes a **Spirit Island knowledge base**: the recommender it already is, plus a **Cards**
tab that browses all 471 cards behind dropdown and multi-select filters — elements, cost, speed,
type, expansion — with the card art one tap away. It works at phone width, it carries the real
Spirit Island logo, and it lives at a URL with no personal name in it.

The single hard constraint is this repo's documented failure mode: **a card's elements, cost and
speed are never read off a card image by a model.** They come from a machine-readable source or the
field is absent, and a tripwire test pins them the way `aspectCanon.test.ts` pins the 31 aspects.
Coverage that looks incomplete is correct; fabricated completeness is the bug this repo has already
shipped three times.

## User Stories

**Browsing cards**

1. As a player, I want a Cards tab alongside the spirit surfaces, so that card lookup lives in the
   same place as everything else I know about Spirit Island.
2. As a player, I want to browse all 471 power, fear, event and blight cards, so that I never have
   to leave for SICK.
3. As a player, I want to filter power cards by element, so that I can find what my spirit can
   actually pay for.
4. As a player, I want to select several elements at once, so that I can search on the combination
   my spirit generates rather than one element at a time.
5. As a player, I want to know unambiguously whether selecting Fire and Sun means *Fire or Sun* or
   *Fire and Sun*, so that I can trust a result count I didn't expect.
6. As a player, I want to filter by cost, so that I can see only cards I can afford this turn.
7. As a player, I want to filter by speed (Fast/Slow), so that I can find something that resolves
   before the invaders act.
8. As a player, I want to filter by card type (minor, major, unique), so that I can browse the deck
   I'm actually drafting from.
9. As a player, I want to filter by expansion, so that I only see cards in the box I own.
10. As a player, I want to filter fear, event and blight cards by the fields *they* have, so that the
    tab is useful for the decks that have no elements or cost.
11. As a player, I want filters to be dropdowns and multi-selects rather than a text box, so that I
    can only ever ask a question the data can answer.
12. As a player, I want to combine filters, so that "majors, Fire, cost ≤ 3, Branch & Claw" is one
    query and not four passes.
13. As a player, I want to see how many cards matched, so that I know whether to narrow further.
14. As a player, I want to clear my filters in one action, so that starting a new search is cheap.
15. As a player, I want to tap a card and see its full art at readable size, so that I can actually
    read its text and rules.
16. As a player, I want the card art to come from the real card, so that what I read is what's
    printed.
17. As a player, I want to know which spirit a unique power belongs to, so that a unique in the
    results isn't context-free.
18. As a player on a metered connection, I want card images to load only as I reach them, so that
    opening the tab doesn't pull megabytes I never look at.
19. As a curious player, I want to see where the card data came from, so that I can judge whether to
    trust it — the same way the tier lists already show their citation.

**On a phone**

20. As a player at the table, I want to open the site on my phone, so that I can look something up
    without a laptop.
21. As a player, I want to hand my phone to a friend, so that they can use the recommender without
    installing anything.
22. As a phone user, I want no horizontal scrolling on any surface, so that the page doesn't slide
    around under my thumb.
23. As a phone user, I want tap targets big enough to hit, so that I don't mis-tap the filter next to
    the one I wanted.
24. As a phone user, I want the questionnaire usable at 375px, so that the recommender works where I
    actually am.
25. As a phone user, I want the tier board readable at 375px, so that a wide grid of tiles doesn't
    become unusable.
26. As a phone user, I want modals — spirit detail, card art — to fit on screen and be dismissible,
    so that I don't get trapped in one.
27. As a phone user, I want to reach every tab, so that the sidebar nav doesn't strand half the app
    off-screen.
28. As the owner, I want the desktop layout I already like to be unchanged, so that making it work on
    a phone doesn't cost me the command deck.

**Identity**

29. As a visitor, I want the header to show the real Spirit Island logo, so that the site looks like
    it's about the game and not like a placeholder.
30. As the owner, I want the logo to survive a phone header without overflowing, so that the fix for
    one problem doesn't cause another.
31. As the owner, I want to share a URL that doesn't contain my name, so that the site reads as a
    community resource.
32. As the owner, I want the site named for what it now is — a knowledge base, not a recommender — so
    that the title matches the content.
33. As the owner, I want the old URL to keep working, so that any link I've already shared doesn't
    break.

**Data honesty**

34. As the owner, I want a tripwire test on the card dataset, so that a future agent cannot quietly
    edit a card's elements.
35. As the owner, I want an unsourceable field to be absent rather than estimated, so that this repo
    stops shipping data no source ever stated.
36. As the owner, I want the card dataset built by a committed script rather than by a model reading
    images, so that it can be re-derived and audited.
37. As the owner, I want every card in the dataset to resolve to an image that exists, so that the
    Cards tab has no broken tiles.

## Implementation Decisions

**Scope of the browse set.** Powers (minor, major, unique) + fear + event + blight — 471 cards.
Adversaries, scenarios, aspect cards and spirit panels are in the archive but out of the tab.

**Card data source.** `sick.oberien.de/cards.js` — a compiled-TypeScript bundle defining
`PowerCard`, `FearCard`, `ChoiceEventCard`, `StageEventCard`, `TerrorLevelEventCard`,
`HealthyBlightedLandEventCard` and `AdversaryEvent` and constructing the catalogue from them. SICK is
the same source the 471 images were mirrored from — 471 of the 616 manifest rows carry
`source_site: sick.oberien.de` — so card names already join to `images/manifest.json` by name. The
field inventory per card type is established by map ticket #01 before anything is built on it; a
filter whose field turns out not to exist **does not ship**.

**A new domain entity: the card.** It joins `Spirit`, `TierList` and `Adversary` in
`src/domain/types.ts`, and its dataset joins `spirits.json` / `adversaries.json` / `tier-lists/` in
`src/data/`. It follows the conventions those already set:

- **An absent key means the source never said.** Never null, never a default, never inferred — the
  same contract `TierList.tiers` and `TierList.players` already carry.
- **Provenance is recorded on the data**, as `ratingsSource` and `SourceCitation` already do.
- Card types with disjoint fields (a fear card has no elements or cost) are modelled as a
  discriminated union on card type, not as one wide interface full of optionals.

**One new seam: filtering is a pure function.** A single function in `src/domain/` takes the card
dataset and a filter state and returns the matching cards. It is a pure data transform, testable with
no React, exactly as `recommend()`, `configurations` and `logStats` already are. The Cards component
renders and nothing else — it holds filter state and calls the function. This is the *only* new seam
the feature adds.

**Element multi-select semantics are a real decision, not a default.** Selecting Fire and Sun can
mean *has Fire or Sun* (wide) or *has both* (narrow); these are different products and produce wildly
different result counts. Decided in map ticket #03 with the owner, then encoded once in the filter
function. The chosen semantics must be legible in the UI, not buried.

**Card type: filter or segmented switch.** Fear/event/blight share almost no fields with powers. A
single filter bar that greys out half its controls is a different product from a segmented
`Powers | Fear | Events | Blight` switch that swaps the control set. Also #03.

**No free-text search.** The owner's call: dropdowns and multi-selects are "more stable and robust
than just the text." Every control is closed-vocabulary and derived from the dataset's actual values,
so no control can offer a filter the data cannot honour.

**Result shape is decided by prototype, not by argument.** The owner declined to pick between an
image grid and compact data rows from a description. Map ticket #04 builds both rough (via
`/prototype`), on real data and real images, and they are judged at 375px and at desktop width.
Whether thumbnail derivatives are needed falls out of that, and is not pre-generated on spec.

**Images move from the archive into `public/`.** `images/` is git-ignored by owner policy
(2026-07-11: archive untracked, manifest committed) and Pages can only serve `public/`. The
browsable cards are ~13 MB of webp, against a `public/` that is currently 57 MB and a Pages limit of
1 GB — not a constraint. `public/cards/` already holds the 37 spirits' starting cards from v3 #11,
and a starting card *is* a unique power, so the overlap is reconciled rather than duplicated.
Filenames resolve from the dataset by rule, not via a lookup table.

**Responsive, not phone-first.** The owner chose "nothing breaks at 375px" over a native-feeling
mobile shell. Desktop is untouched. The work is a list of real breakages found by driving the built
app in a headless browser at 375×667 and 390×844 (map ticket #07) — evidence first, fixes after. The
nav is the suspected hard part: `AppShell` is a persistent sidebar built for one big surface, and v4
adds a second.

**The URL.** A GitHub Pages *project* site is always `<owner>.github.io/<repo>`; no setting removes
the owner segment. The owner chose the free-organisation route over a paid custom domain: create an
org, transfer the repo, name it `<org>.github.io`, and it serves from the root. **`vite.config.ts`
hard-codes `base: '/spirit-island/'`; a root-served org site needs `base: '/'`.** Missing this breaks
every asset path *in the deployed build only* and never in dev, so it is verified against the real
deployed site. GitHub redirects the old URL, so shared links survive.

**The logo.** Not one of the 616 archived assets is the logo, so this is a retrieval job before it is
a CSS job — TTS mod JSON, wiki, or the publisher's press page, following
`.scratch/asset-archive/REFERENCE.md`'s pacing and user-agent rules. It is committed to `public/`
and added to `images/manifest.json` with its `source_url`, like every other asset here. **A model
does not draw an approximation**; if no real source exists, the text wordmark stays.

**Rights.** Hosting risk was accepted by the owner on 2026-07-09 and is settled. Not reopened.

## Testing Decisions

A good test here asserts **external behaviour**: given this dataset and these filters, these cards
come back. It never reaches into how the filter is implemented, and it never asserts on React
internals. Prior art is `recommend.test.ts` — a pure domain function, exercised through its public
signature.

- **The filter function** (`src/domain/`, the one new seam) is tested directly. Cases: each control
  in isolation; controls combined; the element multi-select's chosen semantics pinned explicitly,
  because it is the one place a plausible-but-wrong implementation would pass a lazy test; a filter
  that matches nothing; a filter on a field a card type doesn't have.
- **`cardCanon.test.ts`** — the tripwire, modelled on `aspectCanon.test.ts` and
  `startingCardsCanon.test.ts`. It pins the count per card type against the archive
  (101/78/153/65/50/24) and spot-pins the fields of a handful of cards that a human checked against
  the printed card. It fails loudly if a count moves. It is a deliberate duplication of the dataset —
  that is the point, and it is this repo's established defence.
- **`dataIntegrity.test.ts`** is *extended*, not duplicated: it already asserts every asset a dataset
  references exists on disk, for panels and starting cards. Cards join that check.
- **The Cards component gets no dedicated test** beyond the existing `appSmoke.test.tsx` — the same
  bet v3 made, and it holds only because the logic is pure and lives behind the domain seam.
- **A real headless-browser pass is required before the tab is called done**, at 375px and desktop
  width. Not a committed test — a verification run. v3's lesson is specific and expensive: the
  tier-list UI shipped functionally correct, fully test-covered, and completely invisible, because
  the CSS was missing and nobody opened it.

## Out of Scope

- **Browsing adversaries, scenarios, aspect cards and spirit panels.** In the archive, not in the tab.
- **Free-text search.** Explicitly declined by the owner.
- **A phone-first rewrite** — bottom tab bar, sheets, full-screen viewer. "Nothing breaks" was chosen
  over "feels native".
- **Buying a custom domain.** The free org route was chosen.
- **Rating, tiering or ranking cards.** The tier machinery is spirit-shaped and so are its sources;
  ranking 471 cards would be this repo inventing data.
- **Element-threshold matching** — *"I have Sun+Fire+Plant on the table, what can I actually play?"*
  Deliberately deferred: judged after the simple filters ship, not before.
- **Cross-links between the Cards tab and spirits** — a spirit's uniques, or minors that suit a
  spirit's elements. Cannot be specified before the tab exists.
- **Re-opening image rights.** Settled.

## Further Notes

The two deferred ideas above are the ones most likely to matter next, and they are recorded in the
map's *Not yet specified* section rather than here. Element-threshold matching in particular is the
thing that would make this genuinely better than SICK rather than a nicer SICK — but it is
strictly more machinery, and the owner asked to keep it simple first.

`.scratch/v2/issues/17-terror-level-range.md` remains open at `ready-for-human`. It is the last
outstanding ticket from v2 and is unrelated to this spec.
