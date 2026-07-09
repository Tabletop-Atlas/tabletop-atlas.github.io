# 01 — TierList entity, one file per list, canon tripwire

Status: done

## Parent

`.scratch/v3/PRD.md`

## What to build

A tier list stops being a flat map and becomes a **cited document**. Nothing visible changes: the
app renders the same 68 configurations in the same seven bands, and the owner's stored edits
survive. What changes is that a *second* list is now representable.

- `TierList` is declared in `src/domain/types.ts` with the shape settled in
  `.scratch/v3/tier-list-schema.md`: `id`, `name`, `type`, `players?`, `origin`, `tierLabels`,
  `methodology`, `source?`, `verified`, `tiers`, `uncertain?`, `unresolved?`.
- `src/data/tiers.json` is **deleted**. The owner's board moves to `src/data/tier-lists/` as one
  file, unchanged in content, gaining `type: 'strength'`, `origin: 'personal'`,
  `tierLabels: ['X','S','A','B','C','D','F']`, and a methodology note in his own framing.
- `tierStore` reads the shipped lists from that directory, holds one **active list** (the owner's,
  for now the only one), and keys overrides by `listId`. Its public API is otherwise unchanged —
  `getTier`, `setTier`, `getAll`, `getOverrides`, `isCustomised`, `wasDiscarded` all still work,
  still against the active list.
- **The owner's existing overrides are migrated, not discarded.** Deleting `tiers.json` moves the
  seed fingerprint by definition, and the v2 fingerprint guard would eat his real board edits. The
  store reads the v2 payload shape (`{ seed, overrides }`) explicitly and re-stamps it against the
  owner's personal strength list. A payload that cannot be migrated is still discarded, and
  `wasDiscarded()` still reports it.
- `tierListCanon.test.ts` — new tripwire, modelled directly on `aspectCanon.test.ts`.
- The v3 ADR lands under `docs/adr/`, settling what `tier-list-schema.md` marks as still open: where
  list files live, how many per file, the tripwire, and the fingerprint migration. The "may an
  unverified list feed `recommend()`" question is **left open on purpose** — record that it is open
  and why, do not decide it.
- `tier-list-schema.md` drops its "still open" section and becomes the published contract for the
  owner's out-of-repo scraper.

## Acceptance criteria

- [ ] `src/data/tiers.json` no longer exists; the owner's board lives under `src/data/tier-lists/`
- [ ] The board and the editor render identically to before this ticket
- [ ] `tierListCanon.test.ts` asserts, for every shipped list: every `configId` in `tiers` exists in
      `spirits.json`; every label in `tiers` appears in that list's `tierLabels`; `tierLabels` has
      no duplicates; `origin: 'cited'` implies a `source` with a URL; `verified` is a boolean
- [ ] The owner's list is additionally pinned to full 68-key coverage by a deliberate duplication of
      its expected keys, so drift fails loudly
- [ ] A stored v2 override payload is migrated onto the owner's list and its edits still apply
- [ ] A stored payload that cannot be migrated is discarded and `wasDiscarded()` returns true
- [ ] A fresh install never sets `wasDiscarded()`
- [ ] Overrides in storage are keyed by list id
- [ ] `docs/adr/` gains the v3 ADR; it records the verified-feeds-recommend question as open
- [ ] `tier-list-schema.md` no longer says "still open"
- [ ] Existing `tierStore.test.ts`, `dataIntegrity.test.ts` and `aspectCanon.test.ts` pass unchanged

## Blocked by

- None — can start immediately.

## Comments

Resolved. `TierList` lands in `src/domain/types.ts`; the owner's board moved to
`src/data/tier-lists/owners-board.json` unchanged in content. `tierStore.ts` rewritten around an
active-list model, keyed overrides (`spirit-island:tier-overrides:<listId>`), and
`migrateV2Overrides()`, which re-stamps the old flat payload onto the owner's list rather than
losing it to the fingerprint guard. `tierListCanon.test.ts` added with the full-coverage
duplication check. ADR at `docs/adr/0001-tier-lists-as-cited-documents.md`, records the
verified-feeds-recommend question as open. `tier-list-schema.md` updated to drop "still open".
