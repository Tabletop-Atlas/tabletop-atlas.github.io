# 05 — Expansion colour across the Archive surfaces

Status: done
Label: wayfinder:prototype (HITL — owner picks the look)
Parent: [Legibility-pass map](../MAP.md)

## Blocked by

- [01 canonical expansion normalisation](01-canonical-expansion-normalization.md) — colour can't
  resolve for `Basegame`/`Promo2`/`Branch and Claw` etc. until every raw string maps to an
  `EXPANSION_COLOR` key.

## Question

Today expansion is coloured **only** on Browse spirit tiles (`SpiritTile` — left-edge stripe + solid
chip, both from `EXPANSION_COLOR`). In the Archive it's plain uncoloured text
(`OtherCardRows`/`AdversaryRows` `.card-row-expansion`) or absent. The owner wants expansion coloured
**consistently, aligned with the rest of the site** — as an "underlying character" that matches the
spirit-browse colour for the same expansion.

Two things to settle in one round:

1. **The treatment** — what does "underlying character" mean concretely? A background tint on the
   grid card / row, a left-edge stripe (the `SpiritTile` idiom), or a chip? It must read as the
   *same signal* as Browse (same `EXPANSION_COLOR` value, so an expansion is one colour everywhere —
   phase-4 #21's single-source rule) while staying legible on the dark theme. Run a `?variant=`
   round; the **owner picks**.
2. **The rollout** — apply the winning treatment to the **grid views** (Powers/Fear/Events/Blight/
   Adversaries `*Grid` components) and the **rows views**, and **add a new expansion column to the
   Powers rows** (`CardRows.tsx` — the owner asked for this column explicitly).

Owner sub-decision to surface during the round (map fog): **should expansion colour also extend to
the tier board?** The board already colours tiles by tier *position*, so a second colour signal may
conflict — show the owner and let them decide; if yes, it graduates from here.

Scenario expansion colouring is **excluded** here — scenarios have no expansion field until
[02](02-source-scenario-expansions.md) lands (map fog: it becomes a trivial follow-up applying this
treatment).

## Acceptance criteria

- [x] Expansion renders in the chosen treatment across all Archive grid views + rows views
- [x] Powers rows gain a coloured expansion column
- [x] Colour comes from the one `EXPANSION_COLOR` map (via ticket 01's normalisation) — no surface
      carries its own copy; an expansion matches its Browse-tile colour byte-for-byte
- [x] `cardChipColors.test.ts` still green (no new collisions introduced)
- [ ] Tier-board extension either shipped (owner said yes) or recorded as declined — **not yet
      answered, carried to the map's fog list rather than assumed either way**
- [x] `?variant=` round run, owner pick recorded, scaffolding deleted, screenshots kept
- [x] Legible on dark theme at 375px + desktop; test suite green

## Comments

**Round live (2026-07-14) — OWNER PICK NEEDED, question at the end.**

Three treatments on the real Archive (Powers/Fear/Events/Blight `CardGrid`, `AdversaryGrid`,
`CardRows`, `OtherCardRows`, `AdversaryRows`), gated on **`?expansionColor=A|B|C`** (the panel-theming #02
pattern: namespaced param, floating switcher, production build). Without the param the app is
byte-identical, **except** Powers rows now always show an expansion column (plain text, no colour)
— that column is the "rollout" half of this ticket and ships regardless of which letter wins;
only the `variant` prop and its styling are scaffolding (`ExpansionColorRound.tsx`, see its header
comment for the exact delete list). Colour always comes from the one `EXPANSION_COLOR` map via the
new `expansionColorFor()` helper (`tagColors.ts`) — a card whose raw expansion string doesn't
normalize renders with no colour in every variant (honest absence, never a guessed fallback).

- **A — left-edge stripe:** the `SpiritTile` idiom carried onto grid tiles and rows (`border-left`,
  4px, solid).
- **B — background tint:** a low-opacity wash (`${color}33`, ~20% alpha) across the tile/row
  surface.
- **C — solid chip:** the `SpiritTile` chip idiom — a small corner badge on grid tiles, a solid
  pill replacing the plain-text expansion column on rows.

Screenshots (baseline + A/B/C, Powers rows + grid, Adversaries rows, at 375px + 1280px) in
[`../screenshots-05/`](../screenshots-05/).

**Flagged, not solved — reactions to carry into the ship step:**

1. **Variant B is invisible on grid tiles.** Card art is full-bleed (`img` at 100% width/height)
   with no visible tile background behind it, so the tint never renders on `CardGrid`/
   `AdversaryGrid` (compare `B-grid-375.png` — no colour signal at all — against `A-grid-375.png`
   or `C-grid-375.png`, both clearly coloured). B still reads fine on rows views, where card art
   isn't full-bleed (`B-adversary-rows-375.png`). **If B wins, grid tiles need their own answer**
   (e.g. a border or corner mark) — B as specified can't ship on grids as-is.
2. **The tier-board sub-decision (map fog) is unaddressed by this round** — the round only covers
   Archive grid/rows per the ticket's core question; extending expansion colour to the tier board
   is a separate yes/no the owner can answer independently of the A/B/C pick.

---

### The pick (owner)

**Owner picked C (solid chip), 2026-07-14.**

**Shipped:** variant C across `CardGrid`, `AdversaryGrid` (corner badge, colour from
`expansionColorFor()`, absent when a raw expansion string doesn't normalize) and `CardRows`,
`OtherCardRows`, `AdversaryRows` (the expansion column renders as a solid pill). Scaffolding
deleted: `ExpansionColorRound.tsx` removed, the `variant` prop and its threading through
`CardsTab.tsx` removed, `deck.css`'s throwaway switcher block removed — `.expansion-chip`/
`.expansion-chip-corner`/`.card-row-expansion.expansion-chip` kept as the permanent rules. Shipped
screenshots in [`../screenshots-05/`](../screenshots-05/) (`SHIPPED-*`). `tsc -b`, `oxlint`, and the
full test suite (390 tests) all green after the ship.

**Still open, not part of this ticket's close:** the tier-board sub-decision (should expansion
colour extend to the tier board?) was never answered — carried to the map's "Not yet specified"
fog list rather than assumed either way. It doesn't graduate without an explicit yes.
