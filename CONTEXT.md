# Spirit Island Recommender

A local-first web app for browsing and recommending Spirit Island content. One context: the
domain language below is used across data, stores, and UI.

## Language

**Configuration**:
The unit of browsing and recommendation — a base spirit, or that spirit with exactly one aspect
applied.
_Avoid_: spirit variant, combo

**OCFDU**:
A spirit's five printed rating axes — Offense, Control, Fear, Defense, Utility. It is the
`ratings` object on every spirit and the shape the questionnaire's weights score against (a
weighted dot product, so surplus capability is a bonus, never a penalty — ADR 0007). Values come
off the printed reference sheet; `ratingsSource: "estimate"` marks a spirit whose numbers nobody
has verified. Fabricated OCFDU is one of this repo's documented failure modes (ADR 0003).
_Avoid_: stats, attributes; the radar (that is one rendering of OCFDU, not the data).

**Complexity**:
A spirit's printed rules load — `Low` | `Moderate` | `High` | `Very High`. Keep it distinct from
two other things "difficulty" reaches for: the **personal complexity override** (the user's own
read of how heavy a spirit feels, held in `complexityStore`) and Spirit Island **difficulty** (a
setup's adversary + level, which this app does not model). A configuration's *effective*
complexity is the base spirit's printed complexity shifted by its aspect's `complexityDelta`
arrow (up/same/down), clamped at Very High; the printed value is never mutated. The newcomer
ceiling always reads printed complexity; the enjoyment preference reads the override (ADR 0007).
_Avoid_: difficulty (for rules load), hardness.

**Tempo / board-control**:
Two playstyle preference axes the recommender scores *in addition to* OCFDU, because OCFDU cannot
express them: **tempo** is strong-from-turn-one vs. slow-snowball; **board-control** is appetite
for fiddly positioning puzzles. Both are fed by spirit tag boosts, not printed numbers (ADR 0007).
Every other entry in a spirit's `tags` is display / team-gap only, never scored.
_Avoid_: pace, speed (that means a power card's Fast/Slow).

**Wildcard**:
The one deliberately off-profile pick in a recommendation shortlist — a configuration chosen to
sit outside the user's stated preferences (or above their complexity ceiling), so the result set
nudges past the questionnaire's comfort zone. Distinct from the top-3 fitted picks; the *soft*
complexity penalty (never a hard cut) is what lets it reach past (ADR 0007).
_Avoid_: random pick (that is the separate random-chooser mode), spicy.

**Tier list**:
A cited document ranking one subject: an author, a methodology, its own tier vocabulary, and a
partial set of ratings. An entity absent from the list is unrated — never defaulted, never
inherited.
_Avoid_: rankings, tiers.json

**Subject**:
The kind of thing a tier list ranks — `configurations`, `minor-powers`, or `major-powers`. The
subject defines the id namespace of the list's tier keys, and is the seam where a future game
would plug in. UI may label subjects in human words ("Spirits").
_Avoid_: entity kind, category, list type (that means strength/fun)

**Origin**:
Where a tier list's authority comes from: `cited` (published elsewhere; immutable in-app; source
citation required) or `personal` (the user's own; editable).
_Avoid_: official/unofficial

**Type (tier list)**:
What a tier list measures — `strength` (how powerful) or `fun` (how enjoyable). A closed set
(`LIST_TYPES`), recorded per list so a taste ranking is never mistaken for a power ranking. Peer
of `subject` and `origin`.
_Avoid_: kind, category (that means subject).

**Active list**:
The one tier list per subject the app is currently reading. Session state: the tier board shows
it and Browse's tier display reads it, so the two surfaces always agree.
_Avoid_: selected list, current list

**Default list**:
The durable, user-changeable pick (in Settings) of which list boots as active for a subject.
Intended seed: the app's credited default list, not the user's own board. (Seed escalated, not
flipped: #18 verified the owner's named source URL against the shipped citations and none
matches — the owner's board holds until the owner says which list they meant; see ADR 0002's
"Left open".)
_Avoid_: primary list

**Impact (fear)**:
How strongly a fear card helps the players — a three-level ordinal (1 weak / 2 solid / 3
strong; labels chosen so they don't collide with minor/major power cards), judged per card
overall across its terror levels. Judgment data: rated from the card image against a written
rubric, owner-ratified, marked `impactSource: "judgment"`. Not a good/bad axis — every fear card
is good for the players.
_Avoid_: fear valence, strength (that means tier-list strength)

**Valence (event)**:
Whether an event card is good or bad for the players — `harmful`, `mixed`, or `beneficial`.
"Mixed" is the honest rating for condition-dependent and choice cards, not a fallback. Same
judgment provenance as fear impact (`valenceSource: "judgment"`). Distinct axis from fear
impact; the two are never compared on one scale.
_Avoid_: event impact, severity

**Card sub-type**:
The descriptive bucket(s) a fear, event or blight card falls into — what a card *does*, never how
good it is (cards are described, never rated or tiered — ADR 0004). Fear cards carry any of five
keyword-derived `FEAR_TAGS` (`removal`, `defensive`, `weaken`, `disruption`, `displacement`),
multi-tag because an effect can cross buckets as terror level rises. Blight cards carry four
coarser `BLIGHT_TAGS` (`presenceLoss`, `boardChange`, `damageBonus`, `resourceSwing`), marked
`tagsSource: "judgment"` because the read is judgment (like `shiftsToward`). Events carry one of
five upstream `EVENT_CLASSES` (`choice`, `stage`, `terrorLevel`, `healthyBlightedLand`,
`adversary`) — source data, not judgment. An empty tag set is "Unclassified" (no keyword
matched), never a forced nearest bucket.
_Avoid_: category; class (except the event `eventClass` field itself).

**Innate threshold**:
An element requirement that unlocks a step of a spirit's innate power — e.g. 2 Sun, 3 Water. A
spirit's `InnatePower` carries its thresholds in order, each a partial map of element → count;
only element counts are recorded (effect text, range and target are deliberately omitted —
omitting is safer than paraphrasing), sourced from wiki `{{Threshold}}` wikitext cross-checked
against the TTS mod's element strings (`source: "wiki+tts"`). The demand half of **element demand /
supply**.
_Avoid_: innate requirement; element cost (that means a power card's `cost`).

**Element demand / supply**:
The Dashboard's subject, and a deliberate pair. **Demand** is what the picked spirit's innate
thresholds ask for — the *first* rung's count is the number (what gets the innate online at all),
the highest rung its ceiling. **Supply** is how many cards in the segment carry that element, and
the odds of drawing demand-many in the next N draws. Neither half means anything alone: supply is
uniform across all eight elements by design (38–39 of 101 minors each, 29–31 of 78 majors), so only
the *gap* between demand and supply carries information (ADR 0013). 29 of 37 spirits demand an
element they have no affinity for — that gap is the point.
_Avoid_: element coverage, element odds (each names one half as if it were the whole); affinity
(that means a spirit's printed `elements`, which is not demand).

**Glossary term**:
A user-facing plain-language definition of a domain word (e.g. `removal`, `weak`, a `Stage`
event), surfaced inline wherever the word appears via a dotted-underline term that reveals a
popover. Held in one central keyed map; every entry carries a `source` (`context` — restates an
owner-ratified `CONTEXT.md` definition; `owner` — authored by the owner; `wiki`), and a tripwire
test fails on any entry missing text or source, because rules prose is a fabrication risk (the
same discipline as `aspectCanon`). A term with no in-repo source ships absent (a visible owner
TODO), never invented.
_Avoid_: tooltip, help text, definition (that names the mechanism, not the sourced datum).

**Collection**:
The expansions the user owns, at expansion granularity. Surfaces annotate unowned content by
default; hiding is an explicit, session-only choice.
_Avoid_: library, owned set

**Archive**:
The browsing surface for the game's content beyond spirits — a segmented switch over Powers,
Fear, Events, Blight, Adversaries and Scenarios, each a filtered gallery. Renamed from "Cards"
(v5) once adversaries and scenarios joined. Card sub-type and collection annotations surface here,
but the Archive never *hard-filters* by collection — browsing an unowned expansion is partly how
you decide to buy it (ADR 0009).
_Avoid_: Cards (the old name), gallery; browser (that means the Browse spirit grid).
