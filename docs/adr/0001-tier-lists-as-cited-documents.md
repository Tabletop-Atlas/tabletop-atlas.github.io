# 0001 — Tier lists are cited documents, not a flat map

Status: accepted
Date: 2026-07-09

## Context

`tiers.json` was a single flat map of `configId -> Tier`, with no author, no source, no
methodology, and no way to represent a configuration nobody had rated. The owner has built a
scraper that turns published rankings (e.g. YouTube reviews) into structured data, and wants to
compare his own board against those. Neither fits into a flat map: a second list has nowhere to
go, and a partial list (most scraped lists will be) would either be rejected or silently
fabricate ratings for whatever it didn't cover.

Full problem statement and rationale: `.scratch/v3/PRD.md`.

## Decision

A tier list is a `TierList` entity (`src/domain/types.ts`): an id, a name, a type
(`strength`/`fun`), an optional player count, an origin (`cited`/`personal`), its own
`tierLabels` vocabulary, a methodology note, an optional source citation, a `verified` flag, and
`tiers: Record<configId, string>` where **an absent key means the source never rated that
configuration** — never `null`, never a default, never inherited from another list.

- One file per list under `src/data/tier-lists/`. The owner's board moved there unchanged in
  content (`owners-board.json`), gaining the entity wrapper.
- `tierStore` holds one *active* list and keys overrides by list id
  (`spirit-island:tier-overrides:<listId>`). `origin: 'cited'` lists refuse `setTier` — enforced
  in the store, not just the UI.
- `groupByTier`'s `FALLBACK_TIER` (`?? 'B'`) is **deleted**, not left unreachable. `getTier`
  returns `Tier | undefined`; the board renders an explicit unrated bucket.
- Rank fed to `recommend()` is a label's **position** in its own list's `tierLabels`, normalised
  to `0` (strongest) .. `1` (weakest). `recommend.ts` no longer imports a tier type at all — it
  is vocabulary-agnostic by construction.
- `tierListCanon.test.ts` (modelled on `aspectCanon.test.ts`) pins every shipped list: every
  `configId` resolves against `spirits.json`, every label is in that list's own `tierLabels`, a
  `cited` list has a `source` with a URL, `verified` is a boolean. The owner's board is
  additionally pinned to full 68-key coverage by a deliberate duplication of its expected keys.
- The v2 override payload (`{ seed, overrides }` under the old flat key) is migrated on first
  read: re-stamped against the owner's personal list rather than discarded by the ordinary
  fingerprint guard, because `owners-board.json`'s `tiers` content is unchanged from
  `tiers.json`'s — see `tierStore.ts`'s `migrateV2Overrides`. A payload that cannot be read as
  that shape is discarded, and `wasDiscarded()` still reports it.
- Backup schema bumps to v2: `BackupState.tiers` becomes
  `Record<listId, Record<configId, string>>`. A v1 backup's flat map migrates onto the owner's
  personal list on import, since that is the only list a v1 backup could ever have described.

## Consequences

- A second, third, ... tier list can be added by dropping a file under `src/data/tier-lists/`
  and adding it to the shipped-lists array — no store or scoring changes required.
- Coverage on a partial list (e.g. a scraped list missing 32 of 68 configurations) is now
  *correct*, not a bug to route around. The unrated bucket names the gap instead of hiding it.
- `recommend()` has no notion of a tier letter. Any future list vocabulary — six bands, ten
  bands, one band — works without touching scoring code.

## Left open, deliberately

**Whether a `verified: false` list may feed `recommend()` at all, or only display.** This is a
one-line policy decision, but it belongs to the owner once real scraped lists exist and their
quality is visible in practice — not something this ticket should decide in the abstract. Today
nothing in the code distinguishes `verified` when computing `getRankPrior()`; an unverified
list's ranks flow into the recommender exactly like a verified one's. Revisit when #08 (the
first cited list) lands.
