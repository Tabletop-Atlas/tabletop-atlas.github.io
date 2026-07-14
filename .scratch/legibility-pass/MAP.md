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

## Not yet specified

<!-- fog: in-scope, but not sharp until an upstream ticket resolves -->

- **Adversary subtype display in rows** — only specifiable after
  [03](issues/03-adversary-subtype-canon.md) says whether canon *defines* an adversary subtype at
  all. If yes: a rows-display ticket mirroring [04](issues/04-subtypes-in-rows.md). If no: it never
  graduates (honest absence — moves to Out of scope).
- **Extending expansion colour to the tier board** — the phase-4 #21 open thread also named the tier
  board. Ticket [05](issues/05-expansion-colour-archive.md) surfaces it as an owner sub-decision
  during its round (the board already colours tiles by tier position, so it may conflict); if the
  owner wants it, it graduates from that ticket.

## Out of scope

- **The floral / vibrant Spirit Island retheme** — moving the app off its intentional black/modern
  "command deck" look (`deck.css` `:root`, "dark by design"). Owner's call at charting: a **separate
  future wayfinder effort**, not this map. It is exactly the "spread" that panel-theming ticket
  `04 the spread verdict` already deferred; that effort's `panel-vibe-sheet.md` + `PANEL_COLOR` are
  its prior art. This map deliberately tunes colour/legibility *for the current dark theme*; the
  retheme will re-tune, and that is accepted (owner picked "polish first").
- **Aspects on the Browse tiles** — owner confirmed aspects stay inside the spirit detail modal
  (already the case); tiles show tier rank, not aspects. No change owed.
