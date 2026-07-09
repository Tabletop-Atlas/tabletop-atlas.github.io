# 02 — Unrated is representable

Status: done

## Parent

`.scratch/v3/PRD.md`

## What to build

The one line standing between a partial tier list and 32 fabricated tiers is
`groupByTier`'s `?? FALLBACK_TIER`. Delete it. Make absence something the app can render.

This ticket ships before any partial list exists, and that is the point: the safety gate lands
first, so no list can ever be loaded onto a fallback.

- `tierStore.getTier` returns `Tier | undefined`. An unrated configuration returns `undefined`,
  never a letter.
- `FALLBACK_TIER` is **deleted**, not left unreachable.
- `groupByTier` returns an additional **unrated bucket** alongside the labelled ones.
- The board renders the active list's own `tierLabels`, in its own order, instead of the global
  `TIERS` constant. A six-band list gets six bands.
- `tierColors` keys by **position** in `tierLabels`, not by the letter `X`/`S`/`A`. No component
  decides whether one list's `S` is another's `X`.
- The board grows an Unrated row below the weakest band. It **explains itself in words** — a source
  that never rated these is not the same as a source that rated them badly, and an empty-looking row
  must not read as a bug.
- The board shows coverage at a glance: "rated 68 of 68".

With only the owner's full-coverage list shipped, the Unrated row is empty and the coverage line
reads 68 of 68. Behaviour on a partial list is proved by a fixture in the tests, not by data.

## Acceptance criteria

- [ ] `getTier` returns `undefined` for a configuration absent from the active list's `tiers`
- [ ] `FALLBACK_TIER` does not appear anywhere in the source
- [ ] `groupByTier` places unrated configurations in the unrated bucket, and a full-coverage list
      leaves that bucket empty (tested against a small fixture list, per `tierStore.test.ts`'s
      existing style — no `localStorage`, no React tree)
- [ ] A fixture list with six labels renders six bands, not seven
- [ ] The Unrated row carries prose distinguishing "not rated by this source" from "rated low"
- [ ] The board shows the active list's coverage as rated-N-of-68
- [ ] Tier colours are derived from label position, and a list of a different length still colours
      sensibly
- [ ] `tierListCanon.test.ts` and `appSmoke.test.tsx` pass

## Blocked by

- #01 (`tierLabels` must exist on the entity before the board can render against it)

## Comments

Resolved. `FALLBACK_TIER` deleted; `groupByTier` returns `{ labeled, unrated }` keyed by the
active list's own `tierLabels`. `tierColor()` in `tierColors.ts` now indexes by position. Board
and editor render an explicit Unrated row with explanatory prose and a rated-N-of-68 count.
Fixture-based tests in `tierStore.test.ts` cover a six-band list and an unknown-label case.
