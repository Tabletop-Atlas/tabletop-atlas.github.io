# 05 — Expansion colour across the Archive surfaces

Status: ready-for-human
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

- [ ] Expansion renders in the chosen treatment across all Archive grid views + rows views
- [ ] Powers rows gain a coloured expansion column
- [ ] Colour comes from the one `EXPANSION_COLOR` map (via ticket 01's normalisation) — no surface
      carries its own copy; an expansion matches its Browse-tile colour byte-for-byte
- [ ] `cardChipColors.test.ts` still green (no new collisions introduced)
- [ ] Tier-board extension either shipped (owner said yes) or recorded as declined
- [ ] `?variant=` round run, owner pick recorded, scaffolding deleted, screenshots kept
- [ ] Legible on dark theme at 375px + desktop; test suite green
