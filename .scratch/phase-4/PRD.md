# Phase 4 — restructure, interconnect, honest recommender

Status: done
Date: 2026-07-13

The locked Phase 4 spec, assembled from the [wayfinder map](MAP.md)'s eight pre-charting owner
calls and eight ticket resolutions. Every decision here traces to a ticket's resolution comment
(linked throughout) — this document decides nothing new. Vocabulary follows
[CONTEXT.md](../../CONTEXT.md); the tier-list model obeys ADR 0001 (cited documents) and, once
built, the subject axis is recorded as ADR 0002.

## Problem Statement

The app has grown into five strong surfaces with weak connective tissue. A first-time visitor —
possibly someone who has never played Spirit Island — lands unexplained inside a recommender
wizard. The tier list and the browser describe the same spirits but don't speak to each other:
clicking a tier tile does nothing, and the browser barely acknowledges tiers. Settings-like
controls (backup, collection, complexity overrides) hide inside a tab named "Customise tiers".
The tier-list model can only rank spirits, though card tier lists from other creators exist. The
recommender asks for a player count it never uses. And the app's default tier list is someone
else's published work without visible credit.

## Solution

Give the app a front door and honest structure: a homepage that orients both gamers and
non-gamers and routes by intent; a real Settings tab; a tier-list model that can rank power cards
as well as spirit configurations; a two-way interconnect between the tier board and the spirit
detail; a profile block everyone can read (labelled bars, not an unlabelled radar); an Archive
whose Powers segment can be arranged by cost, elements, and speed; a recommender with no dead
controls; and visible attribution for the credited default list — all within the app's current
styling, with the floral/island theming overhaul deliberately deferred.

## User Stories

Homepage & navigation ([#01](issues/01-the-homepage.md)):

1. As a first-time visitor who has never played Spirit Island, I want the homepage to tell me in
   one line what the game is (with a link to the official site), so that the app makes sense
   without prior knowledge.
2. As a first-time visitor, I want the homepage to tell me this is an unofficial fan-made
   companion, so that I don't mistake it for an official product.
3. As a visitor unsure what to play, I want an intent-phrased door ("Not sure what to play?")
   leading to the recommender, so that I'm routed by my goal, not by feature names.
4. As a visitor who wants to explore, I want an "Explore every spirit" door into Browse — the
   first door, with Browse also first in nav — so that the richest surface leads.
5. As a rankings-curious visitor, I want a "How do they rank?" door into the tier list, so that
   the third primary intent has a home.
6. As a returning user, I want every visit to boot to the homepage with one click to any surface,
   so that boot behaviour is predictable and unhidden.
7. As any user, I want the Spirit Island logo to be clickable and take me home, so that the
   universal web convention works here too.
8. As a user on the homepage, I want the door tiles backed by spirit art the app already hosts,
   so that the front door carries the game's flavour without new aesthetic commitments.
9. As a reader of the homepage footer, I want a disclaimer line stating the app is unofficial,
   fan-made, and non-commercial, so that the app visibly satisfies the community-FAQ fan-content
   terms ([#05](issues/05-official-assets-and-licensing.md)).

Settings ([#02](issues/02-the-settings-tab.md)):

10. As a user, I want a Settings tab (last in nav) holding Backup, My collection, and Complexity
    overrides, so that configuration lives where every app puts it.
11. As a tier-list curator, I want tier editing to live on the Tier list tab as an edit mode on
    my own board, so that editing happens where boards live and "Customise tiers" stops being a
    separate tab.
12. As a user filtering by ownership, I want the durable collection edited in Settings while each
    surface keeps its session-only "hide unowned" checkbox beside the results, so that hiding
    stays a visible, deliberate act (the v5 split).
13. As a future ticket's author, I want new durable app-wide preferences to default into Settings
    unless argued otherwise, so that knob placement stops being re-litigated.

Multi-subject tier lists ([#06](issues/06-multi-tier-list-architecture.md)):

14. As a player who follows card-ranking videos, I want the app to carry minor-power and
    major-power tier lists alongside spirit lists, so that one tier surface serves all of them.
15. As a data consumer, I want every tier list to declare its subject (configurations /
    minor-powers / major-powers) defining its key namespace, so that a list can never be read
    against the wrong entity kind.
16. As a tier-list reader, I want one active list per subject, with the browser and the tier
    board always reading the same active configurations-list, so that the two surfaces never
    disagree about "the" tier.
17. As a user with a preferred list, I want a default-list pick in Settings, seeded to the
    credited default list, so that boot behaviour is mine to change.
18. As a curator, I want to create personal lists for any subject while cited lists stay
    immutable with mandatory citations, so that ADR 0001's provenance rules survive the new axis.
19. As a maintainer, I want canon tripwire tests pinning every shipped list's subject and keys,
    so that a card list with a bad key can't ship.

Tier board ↔ browser interconnect ([#07](issues/07-tier-list-browser-interconnect.md)):

20. As a tier-list reader, I want clicking a spirit tile to open the same detail modal Browse
    uses, without leaving the tier list, so that detail is one click from anywhere.
21. As a tier-list reader clicking an aspect tile, I want the modal to open scrolled to that
    aspect with the row highlighted, so that the thing I clicked is never buried.
22. As a browser user, I want the detail's head to show a coloured tier chip (from the active
    configurations-list) and each aspect row its own tier chip, so that tiers are visible where
    each configuration is described.
23. As an honest-data reader, I want unrated configurations shown as an outlined "unrated" chip,
    so that absence is displayed, never defaulted.
24. As a curator in edit mode, I want clicks to edit rather than open modals, so that the two
    interactions never fight.

Spirit profile ([#03](issues/03-the-radar-chart-fix-or-replace.md)):

25. As a non-gamer reading a spirit's detail, I want the OCFDU profile as five full-word labelled
    bars with value figures, so that I don't need to decode "O C F D U" or an unlabelled radar.
26. As a detail reader, I want the spirit's elements shown as chips, so that sourced data stops
    being invisible.
27. As a recommender user, I want result rows without the unreadable 80px radar thumbnail, so
    that rows carry only what can actually be read (the full profile is one click away).

Archive ([#04](issues/04-the-archives-structure.md)):

28. As a deck-builder, I want Minor/Major power cards sortable and groupable by cost, elements,
    and speed inside the Powers segment, so that I can arrange the deck the way I think.
29. As a card reader, I want Fear and similar cards to stay alphabetical/by-type, so that
    ordering claims nothing the data can't support.
30. As a scenario browser, I want a difficulty indicator on scenario tiles, so that the grid
    answers the first question anyone asks of a scenario.
31. As a grid reader, I want Major/Unique/Minor tag colours visibly distinct and Fast = red /
    Slow = blue, so that card kind and speed read at a glance.
32. As any user, I want expansion colours consistent across Browse, the tier list, and every
    other view, so that an expansion is one colour everywhere.

Recommender ([#08](issues/08-the-recommenders-short-term-shape.md)):

33. As a recommender user, I want the player-count input gone from wizard and sidebar, so that no
    control claims an effect it doesn't have.
34. As a non-gamer, I want every questionnaire prompt and option answerable without having played
    the game, so that the wizard serves the whole audience (copy pass over the existing 10
    questions).

Attribution & typography ([#05](issues/05-official-assets-and-licensing.md)):

35. As a viewer of the default tier list, I want its creator visibly credited (author, title,
    link — the schema already carries the citation), so that published work is never shown as
    ours.
36. As a reader, I want spirit names set in an OFL display font with Reem Kufi for body text,
    self-hosted, so that typography evokes the game without licensing exposure.

## Implementation Decisions

Traced to resolutions; modules named by role, per the no-file-paths rule.

- **Nav becomes**: Browse, Recommend, Archive, Tier list, Log, Settings — Browse first, Settings
  last, middle order as listed. The app boots to the homepage (not a nav tab); the logo is the
  only route home; no nav item shows active on the homepage.
- **The homepage** is a static orientation-plus-router view: one line on the game (outbound
  official link), one line on the app, three intent doors (Browse, Recommend, Tier list) as
  art-backed tiles using already-hosted spirit art, and a footer disclaimer ("unofficial,
  fan-made, non-commercial companion; not affiliated with the Spirit Island rights holders").
  Nothing on it may go stale — no live/dashboard content.
- **The Customise-tiers tab dissolves.** Its Backup, My collection, and Complexity overrides
  sections move to the new Settings tab verbatim; tier editing becomes an edit mode on the Tier
  list tab, available only on personal-origin lists. Edit mode gates tile clicks (edit vs open
  detail).
- **The tier-list entity gains a required `subject`** — `configurations`, `minor-powers`,
  `major-powers` — defining the id namespace of its tier keys. The three shipped lists get
  `subject: configurations` in a data migration. The tier store tracks one **active list per
  subject**; a durable **default list** preference (Settings) seeds boot, initially the credited
  cited list. The cited-document rules extend unchanged: cited = immutable + citation required;
  personal = editable, any subject. No `game` field. Record as ADR 0002 when built.
- **The Tier list tab serves all subjects**: list picker grouped by subject, board renders
  subject-appropriate tiles (spirit tiles vs card tiles). Card-subject tiles are inert this
  phase (no card detail view exists).
- **The interconnect**: tier tiles (view mode) open the same spirit-detail modal Browse uses;
  aspect tiles open it scrolled to the aspect with the row highlighted (one scroll call, one CSS
  class). The detail head's tier text line becomes a coloured tier chip; each aspect row gains a
  small tier chip; colours come from tier-position in the active configurations-list's own
  vocabulary; unrated renders as an outlined chip, never a default.
- **The profile block** (from the [#03 prototype](issues/03-the-radar-chart-fix-or-replace.md),
  screenshot in `screenshots-03/`): five rows — full-word axis label, thin accent bar against a
  track scaled to max 5, value figure — plus an elements chip row; the ratings-estimate note
  stays. The radar component is deleted outright; recommender result rows lose the profile
  thumbnail with no replacement.
- **The recommender**: both player-count inputs and the note-relevance badge logic are deleted;
  the wizard opens on its first real question. The 10-question wizard is retained unchanged in
  structure; a copy pass makes every prompt/option non-gamer-answerable. Standing constraint:
  player count must not influence ranking until sourced per-player-count data exists.
- **The Archive**: 6-segment switch retained; no URL routing anywhere this phase. The Powers
  segment gains sort/group controls (cost, elements, speed); other segments' ordering unchanged.
  Scenario tiles gain a difficulty indicator — **scenario difficulty is not currently sourced**
  (the dataset carries only name and image), so this item includes sourcing it from a verifiable
  reference with a tripwire test; if it cannot be sourced, the indicator returns to the owner
  rather than shipping estimates.
- **Colour & type**: one expansion→colour mapping shared app-wide; Major/Unique/Minor tag
  colours distinct; Fast = red, Slow = blue (no icon assets — the only available icons are
  ~80px contested-provenance PNGs, declined). Typography: Reem Kufi (OFL) for body, an OFL
  display font for spirit names, both self-hosted; the commercial title font was declined.
- **Attribution**: the tier-list surface displays the active cited list's author/title/URL from
  its existing citation fields; the default list is 3 Minute Board Games' published ranking.

## Testing Decisions

A good test asserts external behaviour at an existing seam — what a user or caller observes —
never implementation internals. Three seams, all pre-existing (owner-confirmed; no new seams):

- **Domain modules**: stores tested with injected key-value storage; pure functions tested
  directly. Covers the subject axis, active/default-list rules, edit-mode gating on origin, and
  the recommender's unchanged ranking after the player-count removal. Prior art: the tier store
  and collection store test suites; the collection-ranking regression test that pins byte-level
  ranking equivalence is the model for "removal changed nothing" assertions.
- **Dataset canon tripwires**: the tier-list canon test extends to pin every shipped list's
  subject and to resolve card-list keys against the power-card dataset. Every dataset change
  ships with its tripwire, per CLAUDE.md. Prior art: the aspect, card, adversary, and
  starting-cards canon tests.
- **App smoke**: boot-to-homepage, logo-click-home, nav order/content, the Settings tab's three
  sections, and the Customise-tiers tab's absence assert at the existing app-level smoke test.
- **Browser verification** (convention, not suite): Playwright against the production build at
  375px and desktop per v5 practice — the segmented switch and homepage doors must survive 375px.

## Out of Scope

- The AI composition-based recommender (owner's ruling; different destination).
- URL routing and deep-linking anywhere ([#04](issues/04-the-archives-structure.md): a future,
  feature-justified decision).
- Free-text search (standing v5 ruling); a phone-first rewrite (standing v5 ruling).
- Card detail views and rules-text transcription; interactive card-subject tiles.
- Rating/tiering cards *by this repo* — only cited imports, per
  [#06](issues/06-multi-tier-list-architecture.md)'s provenance rules.
- Gamer/non-gamer questionnaire branching; any recommendation prefs in Settings (none exist).
- Player count influencing ranking (standing constraint until sourced data exists).
- The floral/island global theming overhaul and the multi-game platform vision (map fog — future
  efforts).
- Buying the commercial title font; using wiki PNG icons (both declined at spec assembly).

## Further Notes

**Build order — five staged clusters, each independently demoable** (owner-approved). Later
clusters depend on earlier ones only where stated:

1. **Honest fixes** — strip the player-count input; bars replace the radar; recommender rows
   drop the thumbnail. No dependencies.
2. **Tier data layer** — subject axis, shipped-list migration, canon test extension, ADR 0002.
   Pure domain change.
3. **App restructure** — homepage (with disclaimer footer), Settings tab, Customise-tiers
   dissolution (edit mode lands here), nav reorder, logo click, boot change. One coherent slice;
   everything touches nav.
4. **Tier UX** — subject-grouped picker, the interconnect (modal, aspect highlight, tier chips),
   attribution display, default-list pick (the one item needing cluster 3's Settings).
5. **Archive & theming touches** — Powers sort/group, scenario difficulty, tag/speed/expansion
   colours, OFL fonts.

**Standing cautions for implementers:** this repo fabricates when a source can't answer
(CLAUDE.md) — absence is displayed, never estimated; the Spirit Island rights situation is in
active flux with entirely new official art coming
([research](official-assets-research.md)), so favour approximation over pixel-matching; and the
non-gamer half of the audience is a constraint on every string this spec ships.
