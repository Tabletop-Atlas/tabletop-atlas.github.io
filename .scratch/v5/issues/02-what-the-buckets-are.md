# 02 — What the fear / event / blight buckets are

Status: needs-triage
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
