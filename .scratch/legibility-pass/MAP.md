# Wayfinder map — Legibility pass: subtypes, expansion colour, tier visibility, tier-page cleanup

Label: wayfinder:map
Charted: 2026-07-14 (grilling session with the owner)

## Destination

The card surfaces read at a glance and colour consistently: the Archive's **rows view** shows each
card's **subtype** (colour-coded), **expansion** is coloured the same way *everywhere it appears*
(Browse tiles, Archive grids + rows, Powers gains an expansion column) using the one
`EXPANSION_COLOR` source, Browse spirit tiles carry the **active list's tier rank**, and the tier-list
page's lengthy source/attribution block is tamed while **"create a personal list"** becomes a
visible action. Sourcing gaps (scenario expansions, any adversary subtype) are filled from canon or
left honestly absent — never estimated. The **floral/vibrant retheme is out of scope** — its own
future effort.

## Notes

- **The spec:** [PRD.md](PRD.md) — the assembled contract the tickets build against (published via
  /to-spec after charting, `ready-for-agent`). The map stays the work plan; the PRD is the what/why.
- **Domain:** local-first Vite + React + TS Spirit Island app. Read `CLAUDE.md` and
  `.scratch/v2/README.md` first. Views/components mapped 2026-07-14 — see the ticket bodies for
  exact file paths and line numbers.
- **⚠ Data-fabrication failure mode (CLAUDE.md):** this repo has shipped invented data three times.
  Any field that a source cannot answer is **ABSENT, never estimated**, and any new/changed dataset
  arrives with a **tripwire test** (the `aspectCanon.test.ts` / `adversaryCanon.test.ts` pattern).
  This governs tickets [02](issues/02-source-scenario-expansions.md) and
  [03](issues/03-adversary-subtype-canon.md) directly.
- **Execution override:** this map *carries execution*, matching the panel-theming and phase-4
  precedent — a prototype round → owner pick → **ship the winner in the same ticket**. It does not
  stop at decisions.
- **HITL variant-round convention (standing):** design-look tickets present candidates behind a
  namespaced query param (`?variant=` / `?colors=` / `?panel=` — collision-safe, per the phase-4/
  panel-theming rounds), the **owner picks** (agent never decides the look), the winner ships,
  scaffolding is deleted, screenshots kept in `screenshots-NN/`. Ticket waits at `ready-for-human`
  until the pick.
- **The one colour source:** all categorical palettes live in
  [`tagColors.ts`](../../src/components/tagColors.ts) and are pinned pairwise-distinct by
  `cardChipColors.test.ts`. `EXPANSION_COLOR` is the single expansion→colour map (7 canonical keys);
  today only Browse's `SpiritTile` + the detail modal consume it. Any new palette (subtypes) lands
  here and extends that test.
- **Owner decisions locked at charting (2026-07-14):**
  1. The retheme is a **separate future wayfinder effort** — this map is polish only (see Out of scope).
  2. Missing data is **sourced from canon** (not dropped), with tripwire tests; expansion strings
     are normalised to the canonical set so colour resolves everywhere.
  3. The Browse tile tier badge is driven by the **active tier list** (the list `TierBoard` shows).
- Skills per ticket: `/prototype` for look rounds, `/research` for canon sourcing, `/grilling` +
  `/domain-modeling` if a decision needs sharpening. Verify against the production build at 375px +
  desktop before shipping.

## Decisions so far

<!-- one line per closed ticket: gist + link. Empty at charting. -->

- **[01](issues/01-canonical-expansion-normalization.md)** — `normalizeExpansion()` maps every raw
  expansion string to the canonical set, tripwire-tested. `Promo2` was ambiguous in the data itself
  (Downpour Drenches the World: `Promo` spirit, all-`Promo2` power cards) and got escalated rather
  than guessed — owner call: `Promo2` always → `Feather & Flame`.
- **[02](issues/02-source-scenario-expansions.md)** — all 16 scenario rows sourced from canon (each
  scenario's own wiki page), 0 left absent; `scenarios.json` gained `expansion`, pinned by
  `scenarioCanon.test.ts`. *A Diversity of Spirits* / *Varied Terrains* hit the same Promo Pack 2 vs
  Feather & Flame shape ticket 01 already settled — carried forward, not re-escalated.
- **[03](issues/03-adversary-subtype-canon.md)** — canon defines **no** adversary subtype/classification
  (checked the wiki's Adversary glossary page, the Category:Adversaries index, and three individual
  adversary pages). The owner's premise was mistaken, not a sourcing gap; `adversaries.json`'s
  existing fields are already complete. "Adversary subtype display in rows" moves from fog to Out of
  scope — nothing built.
- **[05](issues/05-expansion-colour-archive.md)** — owner picked variant **C, solid chip** after a
  three-way round (stripe / tint / chip) on the real Archive grid + rows views. Shipped: a corner
  badge on grid tiles, a coloured pill on rows, Powers rows gained the expansion column the owner
  asked for. Flagged during the round: variant B (tint) would have been invisible on grid tiles —
  full-bleed card art leaves no surface for a background wash to show through; moot since C won.
  Tier-board sub-decision carried forward to ticket 09.
- **[09](issues/09-tier-board-expansion-colour.md)** — after a three-way round (stripe / tint / chip)
  and one changed mind (A, then reconsidered), the owner settled on **a toggle** rather than a fixed
  treatment: "Show expansion colour" on the tier board, off by default (no signal — variant B) and
  the Archive's solid-chip idiom when checked (variant C). Resolves the A-vs-B tension by not forcing
  either as the only answer. Aspect tiles colour by the aspect's *own* expansion when the toggle is
  on (not the base spirit's — confirmed 31/31 aspects diverge from their spirit's expansion).
- **[08](issues/08-scenario-expansion-colouring.md)** — mechanical follow-through, no new decision:
  scenarios join the expansion-colour system (ticket 05's C chip) now that they have the field
  (ticket 02). Grid tiles' top-left chip sits opposite the existing bottom-left difficulty tab —
  the two signals coexist without clobbering each other. All 16 scenarios resolve today; the
  honest-absence guard is in place regardless.
- **[04](issues/04-subtypes-in-rows.md)** — fear/blight/event subtypes surfaced in the Archive rows
  view (previously data used only as filters). New `SUBTYPE_COLOR`/`subtypeLabel` in `tagColors.ts`
  (14 values, pinned distinct). Blight's uniform "blight" kind label — no information, every blight
  card had it — is replaced outright by its subtype tags, the owner's specific ask; a one-time
  row-level note carries the judgment provenance instead of repeating it per chip. Owner picked
  variant **A, filled pill** after a three-way round (pill / tinted text / outlined tag).
- **[06](issues/06-tier-rank-on-browse-tiles.md)** — owner picked variant **B, ribbon** after a
  three-way round (corner badge / ribbon / coloured ring) on the real Browse grid. A Browse tile
  now carries a diagonal ribbon showing the base spirit's rank in the *active* configurations tier
  list (shared `activeConfigTier` helper, so the tile and the modal's `TierChip` can never
  disagree); unrated spirits show no ribbon, never a fabricated tier.
- **[07](issues/07-tame-tier-attribution-and-surface-create-list.md)** — owner picked variant
  **C, citation behind an info toggle** after a three-way round (collapsed citation / compact
  citation with promoted CTA / info toggle) on the tier-list page. The attribution/explanatory
  block now hides behind "ⓘ Source" and "How this list works" disclosures so the board leads the
  page; "Create a personal list" is a real button next to the picker instead of dim `<details>`
  text.

## Out of scope

- **Adversary subtype display in rows** — canon defines no adversary subtype/classification (ticket
  [03](issues/03-adversary-subtype-canon.md)); the owner's premise was mistaken, not a gap to fill.
  `adversaries.json`'s existing fields (name, expansion, escalation levels) are already complete.
- **The floral / vibrant Spirit Island retheme** — moving the app off its intentional black/modern
  "command deck" look (`deck.css` `:root`, "dark by design"). Owner's call at charting: a **separate
  future wayfinder effort**, not this map. It is exactly the "spread" that panel-theming ticket
  `04 the spread verdict` already deferred; that effort's `panel-vibe-sheet.md` + `PANEL_COLOR` are
  its prior art. This map deliberately tunes colour/legibility *for the current dark theme*; the
  retheme will re-tune, and that is accepted (owner picked "polish first").
- **Aspects on the Browse tiles** — owner confirmed aspects stay inside the spirit detail modal
  (already the case); tiles show tier rank, not aspects. No change owed.
