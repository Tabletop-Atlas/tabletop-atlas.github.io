# PRD — Legibility pass: subtypes, expansion colour, tier visibility, tier-page cleanup

Status: ready-for-agent
Assembled: 2026-07-14 (synthesised from the wayfinder charting session; see [MAP.md](MAP.md))

This spec is the contract the seven tickets build against. The **map is the work plan** (which
ticket, in what order, what's blocked); this PRD is the **what and why**. Read alongside `CLAUDE.md`
and `.scratch/v2/README.md`.

---

## Problem Statement

The card surfaces don't read at a glance, and they don't look like one website.

- In the **Archive rows view**, every card already carries a subtype in the data — blight cards have
  a tag family, fear cards have a tag family, events have a class — but none of it is shown. Blight
  rows instead show the word "blight" on every single card, which tells the reader nothing (they're
  all blight). The one distinguishing fact each card has is invisible.
- **Expansion** is colour-coded on the Browse spirit tiles but nowhere else. In the Archive grids and
  rows it's plain grey text, or missing entirely — so the same expansion is a colour in one place and
  invisible in another, and the Archive doesn't feel part of the same site.
- A spirit's **tier ranking** only appears after you open its detail modal. On the Browse page — the
  first thing you see when you click Browse — there's no sign of how strong a spirit is.
- The **tier-list page** buries its board under a long block of source/attribution/explanatory text
  that pushes the actual rankings down the page, and its "create a personal list" control is styled
  as the dimmest possible grey text, so it reads as a footnote rather than an action — the owner "took
  a while to even spot it."
- Two card types can't fully participate: **scenarios** have no expansion recorded at all, and the
  owner believes **adversaries** have a subtype that in fact isn't in the data.

## Solution

A legibility pass across the card surfaces — presentation and the small amount of data sourcing
needed to support it, tuned for the current dark theme. From the player's perspective:

- The Archive rows show each card's **subtype**, colour-coded; blight's useless uniform "blight"
  label is replaced by the subtype tags that actually distinguish one blight card from another.
- **Expansion is coloured the same way everywhere it appears** — Browse tiles, Archive grids, Archive
  rows — drawn from one colour source, so an expansion is one recognisable colour across the whole
  site. Powers gains an expansion column so its expansion is visible too.
- Browse tiles carry the **active tier list's rank** for each spirit, so strength is visible the
  moment you open Browse — while aspect-level detail stays where it belongs, inside the spirit modal.
- The tier-list page leads with its board; the credit is preserved but condensed out of the way, and
  "create a personal list" becomes an obvious button.
- Scenario expansions are **sourced from canon** (with a tripwire), and the adversary-subtype premise
  is checked against canon — filled if real, left honestly absent if not. Nothing is estimated.

**Explicitly not in this pass:** the floral/vibrant retheme. The app stays on its "command deck" dark
look; the retheme is a separate future effort (see Out of Scope).

## User Stories

**Subtypes in the Archive rows**

1. As a player scanning blight cards in the rows view, I want each card's subtype (its tag family)
   shown instead of the word "blight" repeated on every row, so that I can tell the cards apart.
2. As a player, I want fear cards in the rows view to show their tag subtype
   (removal/defensive/weaken/disruption/displacement), so that I can see at a glance what a fear card does.
3. As a player, I want event cards in the rows view to show their class
   (choice/stage/terrorLevel/healthyBlightedLand/adversary), so that I understand what kind of event it is.
4. As a player, I want each subtype colour-coded, so that I can group and compare cards visually, not
   just by reading text.
5. As a player looking at a blight or fear card with several tags, I want all its tags shown cleanly,
   so that multi-tag cards aren't truncated or crowded.
6. As a careful reader, I want blight's judgment-sourced tags to be presented honestly (not dressed as
   canon), so that I know which classifications are the maintainer's interpretation.

**Expansion colour across the surfaces**

7. As a player, I want a card's expansion coloured in the Archive grid views, so that I can see which
   set a card comes from without reading small text.
8. As a player, I want that expansion colour to match the colour the same expansion has on the Browse
   spirit tiles, so that the site feels consistent and I learn one colour per expansion.
9. As a player in the Archive rows view, I want expansion coloured there too, so that grids and rows
   agree.
10. As a player browsing power cards, I want an expansion column added to the Powers rows, so that I
    can see (and later filter by) which set a power belongs to.
11. As a player, I want expansion colour driven by a single source of truth, so that an expansion is
    never two different colours in two different places.
12. As a player, I want cards whose data uses odd expansion spellings (Basegame, Promo2, "Branch and
    Claw") to still get the right colour, so that no card is left grey by a naming mismatch.

**Tier rank on the Browse tiles**

13. As a player, I want a spirit's tier ranking visible on its Browse tile, so that I can judge
    strength the moment I open Browse, without opening each spirit.
14. As a player who switches the active tier list, I want the Browse tiles to reflect whichever list
    is active, so that the badges always match the list I'm looking at.
15. As a player, I want a spirit that's unrated in the active list to show honest absence (an
    "unrated" marker, no colour-guessed tier), so that I'm never shown a fabricated ranking.
16. As a player, I want the tier badge not to fight visually with the expansion colour already on the
    tile, so that both signals stay readable.
17. As a player, I want aspect-level tier detail to stay inside the spirit modal (not on the tile), so
    that the Browse grid stays a clean per-spirit overview.

**Tier-list page cleanup**

18. As a player opening the tier-list page, I want the rankings near the top, so that the board isn't
    pushed down by a wall of source text.
19. As a player, I want the list's attribution/credit condensed but still available, so that the
    source is honoured (it isn't the owner's own ranking) without dominating the page.
20. As a player using a personal list, I want it to still show its own origin with no fake citation,
    so that credit is never misattributed.
21. As a player, I want "create a personal list" to look like a real, obvious button, so that I can
    find and use it without hunting.

**Sourcing the gaps (honestly)**

22. As a player, I want scenarios to show which expansion they come from, so that scenarios are as
    informative as the other card types.
23. As a maintainer, I want scenario expansions sourced from canon with a tripwire test, so that the
    data can't silently drift or be fabricated.
24. As a maintainer, I want the "adversaries have a subtype" premise checked against canon before
    anything is built, so that we never invent an adversary classification that doesn't exist.
25. As a maintainer, I want any field that canon can't answer left absent rather than estimated, so
    that the app's documented fabrication failure mode doesn't recur.

## Implementation Decisions

**Owner decisions locked at charting (2026-07-14):**

- The floral/vibrant retheme is a **separate future wayfinder effort**, not this pass. This pass tunes
  colour/legibility for the current dark theme and accepts that the retheme will later re-tune it.
- Missing data is **sourced from canon**, not dropped, with tripwire tests.
- The Browse tile tier badge is driven by the **active tier list** (the list `TierBoard` shows).
- Aspects stay in the spirit detail modal; tiles show base-spirit tier rank only.

**Colour is single-source.** All categorical palettes live in `tagColors.ts` and are pinned pairwise
distinct by `cardChipColors.test.ts`. `EXPANSION_COLOR` (7 canonical `ExpansionName` keys) is the one
expansion→colour map. Every surface that colours expansion consumes it — no surface keeps its own copy.

**Expansion normalisation (foundational).** The Archive datasets use raw expansion strings that are
not `EXPANSION_COLOR` keys (`Basegame`, `Promo2`, `Horizons of Spirit Island`, `Branch and Claw`,
`Promo Pack 2 / Feather and Flame`). A normalisation from raw string → canonical `ExpansionName` is
added beside `EXPANSION_COLOR` (recommended: a display-time `normalizeExpansion()` so transcribed JSON
provenance is untouched — implementer confirms). Where a raw string is genuinely ambiguous rather than
a cosmetic rename (`Promo2` / `Promo Pack 2 / Feather and Flame` could be Promo *or* Feather & Flame
content), the ambiguity is **escalated to the owner, not guessed**. This work blocks the expansion
colour rollout.

**Subtype palette.** A new subtype colour palette (blight tags, fear tags, event classes) is added to
`tagColors.ts` and pinned distinct from every existing palette (expansion, tag, kind/speed,
scenario-band, panel, tier). The rows treatment (filled pill / tinted text / tag) is chosen by an
owner-picked `?variant=` round. The subtype display handles 0, 1, or several tags per card. Blight's
uniform `kind` label is replaced by its subtype tags; blight tags carry their `tagsSource: 'judgment'`
provenance in the presentation (as the filter already does), not dressed as canon.

**Expansion colour rollout.** The owner-picked treatment ("underlying character" — background tint /
left stripe / chip, decided in the round) is applied to the Archive grid views
(Powers/Fear/Events/Blight/Adversaries) and the rows views, and a coloured **expansion column** is
added to the Powers rows. Whether expansion colour also extends to the **tier board** (which already
colours tiles by tier position, so it may conflict) is an owner sub-decision surfaced during the round.

**Tier rank on tiles.** The Browse `SpiritTile` reuses the existing `TierChip` idiom verbatim:
`tierStore.getTier(configId)` for the label, `tierStore.getActiveList().tierLabels.indexOf(label)` for
the colour position (`tierColors.ts`), and the ADR 0001 rule — an absent/out-of-vocabulary label
renders an "unrated" marker, never a defaulted tier. The badge maps a base spirit to its base
configuration id; its placement must not collide with the tile's expansion stripe/chip. No new tier
logic or seam is introduced.

**Tier-list page cleanup.** The tier board leads with its rows; the `TierListCitation` block
(`TierListControls`) and the explanatory paragraph (`TierBoard`) are collapsed/condensed so they stop
pushing the board down. The credit is preserved and correct — a cited list still shows author/title/
link; a personal list still shows its own origin with no fake citation (the ADR 0002 / attribution
rule stands). "Create a personal list" is promoted from a `--deck-dim` `<details>/<summary>` to a
visible button. The tidied header + create action are chosen by an owner-picked `?variant=` round.

**Data sourcing.**
- *Scenarios* gain an `expansion` field, sourced per-scenario from a high-trust canon source, using
  raw strings that `normalizeExpansion()` resolves. Any scenario whose expansion can't be sourced
  confidently is left **absent**, and which ones were recorded.
- *Adversary subtype* is a research question first: does canon define an adversary subtype at all? If
  yes → source it for all 8 with URLs, and a display ticket is charted (mirroring the rows subtype
  work). If no → recorded as honest absence; adversary subtype display is dropped to Out of Scope.

**Execution model.** Per the panel-theming / phase-4 precedent, each look ticket runs a `?variant=`
round → owner pick → **ships the winner in the same ticket** (scaffolding deleted, screenshots kept in
`screenshots-NN/`), verified on the production build at 375px + desktop.

## Testing Decisions

A good test here exercises **external behaviour against small fixtures**: the colour a palette maps a
value to, whether every real data record resolves to a colour, the tier a lookup returns for a
fixture list, and whether a surface renders. It never pokes `localStorage`, never asserts on the React
tree, and there is exactly one server-rendered smoke check for rendering. All seams below **already
exist** — no new seam is introduced.

- **`tagColors.ts` via `cardChipColors.test.ts`** (component seam). The distinctness test is extended
  to pin the new **subtype palette** apart from every existing palette (the phase-4 #21 no-two-share-
  a-colour lesson). A new **tripwire** asserts that every expansion string in every dataset
  (`other-cards`, `power-cards`, `adversaries`, `scenarios`) resolves through `normalizeExpansion()`
  to a known `EXPANSION_COLOR` key — so a future record with an unmapped spelling fails loudly instead
  of rendering grey. Prior art: the existing `EXPANSION_COLOR`/`CARD_KIND_COLOR` distinctness assertions.
- **`scenarioCanon.test.ts` and `adversaryCanon.test.ts`** (domain data-tripwire seam). Scenario
  expansions are pinned against the sourced canon values (extends the existing scenario canon test); an
  adversary subtype, *if* one is sourced, is pinned the same way. Prior art: `adversaryCanon.test.ts`
  and `aspectCanon.test.ts` — deliberate dataset duplication that fails on drift. This is the
  anti-fabrication tripwire the repo mandates for any new/changed dataset.
- **`tierStore.test.ts`** (domain seam) already covers the rank lookup (`getTier`, active-list
  resolution, unrated/legacy handling) with injected storage. The Browse tile reuses that store API,
  so no new store behaviour — hence no new store test — is owed; the tile's honest-absence behaviour is
  the store's already-tested rule.
- **`appSmoke.test.tsx`** (the one UI seam). Extended to assert the new surfaces render on the default
  boot state: subtypes present in the Archive rows, expansion colour present, the Browse tier badge
  present, and the tier-list "create" button present. Prior art: the existing smoke asserting the
  boot credit line renders.

## Out of Scope

- **The floral / vibrant Spirit Island retheme.** Moving the app off its intentional black/modern
  "command deck" look (`deck.css :root`, "dark by design") is a separate future wayfinder effort —
  exactly the "spread" that panel-theming's spread-verdict ticket already deferred. Its prior art is
  that effort's `panel-vibe-sheet.md` + `PANEL_COLOR`. This pass deliberately tunes for the current
  dark theme; re-tuning under a retheme is expected and accepted (owner picked "polish first").
- **Aspects on the Browse tiles.** Aspects stay in the spirit detail modal (already the case). Tiles
  show base-spirit tier rank, not aspect configurations.
- **Adversary subtype display**, *if* canon defines no adversary subtype — then nothing is built and
  the premise is recorded as honest absence.
- **URL routing / deep-linking / new Archive structure.** The segmented-switch Archive stays as-is
  (phase-4 #04 settled this); no router this pass.
- **Scenario expansion colouring** is downstream fog, not a scoped-out item: it becomes a trivial
  follow-up once scenarios have an expansion field and the colour treatment is picked.

## Further Notes

- The **map** (`MAP.md`) is the authoritative work plan: 7 tickets. Frontier (takeable now): canonical
  expansion normalisation, source scenario expansions, adversary-subtype canon, subtypes-in-rows,
  tier-rank-on-tiles, tame-tier-attribution. Blocked: expansion-colour-across-Archive (by
  normalisation). Fog: scenario expansion colouring, adversary subtype display, tier-board expansion
  colour.
- **The fabrication failure mode is the load-bearing constraint** of the two sourcing tickets. Read
  `.scratch/v2/README.md`'s failure-mode section before touching scenario or adversary data. Absent >
  estimated, every time; every dataset change ships a tripwire.
- `cardChipColors.test.ts` is a shared chokepoint — the subtype palette and any hue shift on the
  colour rollout both touch it. Expect to re-run and extend it, not fight it.
