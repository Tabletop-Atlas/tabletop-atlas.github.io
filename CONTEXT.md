# Spirit Island Recommender

A local-first web app for browsing and recommending Spirit Island content. One context: the
domain language below is used across data, stores, and UI.

## Language

**Configuration**:
The unit of browsing and recommendation — a base spirit, or that spirit with exactly one aspect
applied.
_Avoid_: spirit variant, combo

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
How strongly a fear card helps the players — a three-level ordinal (1 minor / 2 solid / 3
major), judged per card overall across its terror levels. Judgment data: rated from the card
image against a written rubric, owner-ratified, marked `impactSource: "judgment"`. Not a
good/bad axis — every fear card is good for the players.
_Avoid_: fear valence, strength (that means tier-list strength)

**Valence (event)**:
Whether an event card is good or bad for the players — `harmful`, `mixed`, or `beneficial`.
"Mixed" is the honest rating for condition-dependent and choice cards, not a fallback. Same
judgment provenance as fear impact (`valenceSource: "judgment"`). Distinct axis from fear
impact; the two are never compared on one scale.
_Avoid_: event impact, severity

**Collection**:
The expansions the user owns, at expansion granularity. Surfaces annotate unowned content by
default; hiding is an explicit, session-only choice.
_Avoid_: library, owned set
