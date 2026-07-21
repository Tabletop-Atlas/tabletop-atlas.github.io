# Fear/event valence taxonomy

Status: done
Labels: wayfinder:grilling
Map: ../MAP.md

## Question

What shape does the good/bad valence axis take for fear cards (50) and event cards (65)?

Settled at charting: the axis *will* exist, as marked-judgment data (precedent: blight
`tagsSource: "judgment"`), pinned by a tripwire test. Open, for a `/grilling` +
`/domain-modeling` session with the owner:

- Binary (good/bad) or a scale (e.g. severity 1–3)? Same shape for fear and events, or
  different axes (fear cards are all "good" for the players in some sense — is the axis
  really *impact strength*? events skew punishing — is theirs *how bad*?)
- Per-card owner judgment, or a rule derived from existing data (fear `tags`, event
  `eventClass`) that the owner ratifies? Existing tags are keyword-derived — are they even
  trustworthy inputs for valence?
- Who classifies the ~115 cards, and how is that work checked? (The classification work
  itself is implementation, not this ticket — this ticket decides the taxonomy and process.)
- What does the tripwire test pin, and how is `Source: judgment` recorded on the data?

Blocks: [Fear/event view prototype](04-fear-event-view-prototype.md).

## Comments

**2026-07-21 — decided via `/grilling` + `/domain-modeling`.** Owner's decisions:

1. **Two deck-specific axes, no shared scale.** Fear cards all help the players, so their axis
   is **impact strength**; events genuinely vary, so theirs is **valence**. The segments never
   share a chart, so cross-deck comparability buys nothing.
2. **Fear shape:** three-level ordinal `impact: 1|2|3` (minor / solid / major), judged per card
   *overall* — not per terror level (that would triple the work and need a terror-level control
   the dashboard doesn't have). Three levels: coarse enough for judgment data to be defensible,
   fine enough for a distribution.
3. **Event shape:** three-level `valence: "harmful"|"mixed"|"beneficial"`. "Mixed" is a real
   category, the honest rating for conditional (`healthyBlightedLand`) and `choice` cards.
4. **Process:** written rubric first; an agent classifies all 115 cards **from the card images**
   — the keyword-derived fear `tags` and mechanical `eventClass` are never inputs, only sanity
   cross-checks — and the owner ratifies the complete table before anything ships. Ratification
   is what makes `judgment` mean *owner's* judgment.
5. **Data + tripwire:** ratings live per card in `other-cards.json` with
   `impactSource`/`valenceSource: "judgment"` (blight `tagsSource` precedent).
   `valenceCanon.test.ts` pins the complete ratified table (name → rating) *and* completeness
   (every fear/event card rated and source-marked); the rubric doc is linked from the test.

Domain terms **Impact (fear)** and **Valence (event)** recorded in `CONTEXT.md`. The
classification work itself is implementation — it lands via the follow-up spec. Unblocks
[#04](04-fear-event-view-prototype.md).
