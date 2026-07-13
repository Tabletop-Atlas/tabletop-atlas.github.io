# 06 — Multi-tier-list architecture

Status: done
Type: wayfinder:grilling (HITL)
Parent: [phase-4 map](../MAP.md)

## Blocked by

_(nothing)_

## Question

How does the tier-list model generalise to lists that rank things other than spirit
configurations — e.g. Minor/Major power card tier lists from other channels — without painting
the design into a corner for future multi-game support?

Facts to bring (read `src/data/tier-lists/` and the tier types first):

- The app already supports **multiple spirit tier lists** — three ship today (two cited with full
  `source` attribution, one personal). List plumbing exists; the open question is **entity-type
  generality**: every list's `tiers` map is keyed by spirit/configuration id.
- What "the spirit's tier" means once lists multiply is this ticket's to answer — it directly
  feeds [#07](07-tier-list-browser-interconnect.md) (Browse detail shows the spirit's tier: from
  which list?). Default list? Per-list display? Owner's pick?
- v5 ruled "rating or tiering cards" **out of scope** — but that ruling was about *this repo
  inventing* ratings. Importing someone else's published card tier list with citation is the same
  move as the existing spirit lists, not a violation. Don't false-trip on it; do note the
  distinction in the resolution.
- The multi-game platform vision is fog on the map: the shape chosen here shouldn't preclude it
  (e.g. game-scoped entity ids), but this ticket does **not** design multi-game.

Run with `/grilling` + `/domain-modeling` — the resolution should name the concepts (list, entity
kind, default list) precisely enough that the spec can state a schema.

## Comments

**Resolution (2026-07-13, grilled with the owner via `/grilling` + `/domain-modeling` — four
decisions, all owner's calls). New terms recorded in [CONTEXT.md](../../../CONTEXT.md) (created
this session):**

1. **The subject axis.** `TierList` gains a required **`subject`** — `configurations` (today's
   three lists), `minor-powers`, `major-powers`. The subject defines which id namespace the
   list's `tiers` keys live in; UI labels stay human ("Spirits"). Rejected: separate entity
   types per kind (duplicates the whole cited-document machinery), and the friendlier-but-wrong
   value name "spirits" (the lists rank configurations — the owner's board keys all 68).
2. **Tier lookup: one active list per subject** (session state). Browse's "the spirit's tier"
   reads the active configurations-list, so tier board and browser always agree — the coherence
   [#07](07-tier-list-browser-interconnect.md) exists for. A durable **default list** pick lives
   in Settings (per [#02](02-the-settings-tab.md)'s open door), seeded to the credited default
   list (locked attribution call). Whether the detail view *also* shows other lists' tiers is
   #07's presentation call.
3. **Surface: the one Tier list tab serves every subject** — subject-grouped list picker,
   subject-appropriate tiles (spirit tiles vs card tiles), edit mode (from #02) on any personal
   list regardless of subject.
4. **Policy edges: ADR 0001's cited-document model extends unchanged along the axis.** Card
   lists require citations, get canon tests pinning keys against `power-cards.json`, absent key
   = unrated. Importing a published card list is formally distinct from v5's out-of-scope
   "inventing card ratings" — citation is what separates them. Personal lists allowed for any
   subject (custom-list machinery already exists); none shipped. **No `game` field** — the
   subject axis is the multi-game seam, and multi-game stays fog.

For the builder: this amends ADR 0001's shape — draft **ADR 0002 (the tier-list subject axis)**
when the schema change is actually made, per the planner-not-coder rule.
