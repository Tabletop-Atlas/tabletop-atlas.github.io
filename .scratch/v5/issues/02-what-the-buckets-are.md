# 02 — What the fear / event / blight buckets are

Status: done
Type: wayfinder:grilling (HITL)
Parent: [v5 map](../MAP.md)

## Blocked by

_(nothing)_

## Question

**What are the sub-types, per card type?** Not *how* they're derived — that's settled (keyword rules
over real card text, see the map's Notes). What the buckets themselves *are*.

The owner's raw instinct, verbatim (2026-07-12):

> Some are defensive, some are about removal. Maybe we can identify a few of the keywords so it's a
> bit easier to cluster the fear. And also the event cards, right? Some are focusing on having the
> healthy island, blighted island, some have the terror level. I would like that to be the type. Same
> for blight, which ones are more aggressive and which are less.

That's three different *kinds* of taxonomy, and they may not all be answerable the same way:

- **Fear** — an *effect* taxonomy (defensive / removal / no-build / …). Derivable from what the card's
  text tells the Invaders to do.
- **Events** — the owner named *healthy vs. blighted island* and *terror level*, which are **not
  effects, they're card structure**. The source already knows this for free: v4 #01 found events are
  five distinct classes — `ChoiceEventCard` (18), `StageEventCard` (9), `TerrorLevelEventCard` (12),
  `HealthyBlightedLandEventCard` (25), `AdversaryEvent` (1). Those five classes *are* the buckets the
  owner described, and they need **no keyword rules at all** — just carry the class through the
  extraction script. Confirm this is what he meant; it makes the event half nearly free.
- **Blight** — "more aggressive / less aggressive" is an **evaluative** judgment, not a descriptive
  one. This is exactly the axis the map rules out of scope for cards ("rating or tiering cards would
  be this repo inventing data"). Grill hard here. Is there a *descriptive* axis that gets him what he
  wants — what the blight card *does* (adds blight / punishes on blight / restricts an action /
  changes a rule) — rather than how bad it is? If the honest answer is "there's no non-judgment way to
  say a blight card is aggressive", say so and either drop blight's sub-type or mark the field as
  judgment data the way `shiftsToward` is.

## What to settle

1. The bucket list per type. Closed sets, named.
2. **Can a card have more than one?** (A fear card that both defends and removes.) One tag or many
   changes the filter control from a dropdown to a multi-select, and changes what "unclassified" means.
3. **What happens to a card no rule matches?** An "Other" bucket, or no tag (and the filter shows it
   only when unfiltered)? There will be cards that fit nothing — the honest outcome is a card with no
   sub-type, not a card forced into the nearest bucket.
4. Whether the blight axis survives at all (see above).

## Notes for whoever picks this up

Read the real text before grilling — don't design the taxonomy from memory of the game. The 50 fear
cards' `level1`/`level2`/`level3` strings and the 24 blight cards' text are all fetchable in one shot
with the same sandboxed-`vm` trick `scripts/extract-other-cards.mjs` already uses. Bring actual
phrases to the conversation. A taxonomy proposed without looking at the corpus is how this repo
invents data.

Use `/grilling` and `/domain-modeling`. The output is a spec [#03](03-the-card-sub-type-classifier.md)
implements verbatim.

## Comments

**Resolved 2026-07-12, via `/grilling` against the real corpus** (all 50 fear cards'
`level1`/`level2`/`level3` text and all 24 blight cards' full text, fetched live from
`sick.oberien.de/cards.js`). #03 implements this verbatim.

### Events — free, structural, single-tag

Sub-type = the 5 upstream classes, carried through as-is, no keyword rules:
`ChoiceEventCard` → **Choice**, `StageEventCard` → **Stage**, `TerrorLevelEventCard` → **Terror
Level**, `HealthyBlightedLandEventCard` → **Healthy/Blighted Land**, `AdversaryEvent` →
**Adversary**. This is exactly what the owner meant by "healthy vs. blighted island" and "terror
level" — the source already draws these lines.

### Fear — keyword-derived, multi-tag

Five buckets, a card may carry more than one (the level-scaled text often crosses buckets — e.g.
*Belief Takes Root* is Defensive at L1/L2, Removal at L3):

- **Removal** — destroys/removes an Explorer/Town/City (~20+ cards, the largest bucket)
- **Defensive** — "Defend N" (~9-10 cards)
- **Weaken** — adds Strife, or "-1 Health per Strife" (~9 cards)
- **Disruption** — Isolate a land, or skip a normal Explore/Build action (~6-7 cards)
- **Displacement** — Push/Gather Invaders without removing them (~5-6 cards)

Derived deterministically from `level1`/`level2`/`level3` text — every tag traces to a matched
phrase, not a single-level read (the classifier scans all three levels' text for each card).

**Unmatched card:** no forced bucket — ships with an empty tag list, filterable as an explicit
**"Unclassified"** option (same shape as the tier board's "Unrated" row: absent, not fabricated).

### Blight — keyword-derived, multi-tag, judgment-marked

Four buckets, multi-tag, same unclassified handling as fear (empty tags, explicit "Unclassified"
filter option):

- **Presence loss** — destroys a Spirit's Presence (the majority of cards)
- **Board change** — adds Town/City/Dahan/Blight to the board
- **Damage bonus** — Invaders deal +damage during Ravage
- **Resource swing** — Energy/card-play/card-draw effects (can help or hurt Spirits)

**Marked as judgment data** (like `shiftsToward`/`ratingsSource`): the bucket boundaries are a
coarser read of the text than fear's more clear-cut categories, so provenance says so honestly.

**The "aggressive vs. less aggressive" axis is dropped entirely** — no honest descriptive
equivalent exists; severity depends on game state (Blight-per-player, player count, turn), and
tagging it would be rating cards, out of scope per the map.

**The free `Blighted Island` / `Still-Healthy Island (for now)` structural field on blight cards
is *not* shipped as a sub-type** (owner's call) — noted here since it was found "for free" the same
way the event classes were, in case it's revisited later.
