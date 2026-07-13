# 0002 — The tier-list subject axis

Status: accepted
Date: 2026-07-13

## Context

ADR 0001 made a tier list a cited document, but every list's `tiers` map was implicitly keyed by
spirit-configuration ids. Card tier lists from other creators exist (Minor/Major power rankings),
and the owner wants them alongside the spirit lists. The multi-game platform vision remains fog:
the shape must not preclude it, but nothing here designs it. Decided with the owner in phase-4
ticket #06 (grilling + domain modeling); vocabulary in `CONTEXT.md`.

## Decision

- **`TierList` gains a required `subject`** — `configurations` | `minor-powers` | `major-powers`
  (`TIER_LIST_SUBJECTS` in `src/domain/types.ts`). The subject defines the id namespace of the
  list's tier keys: `configurations` keys are configIds; the card subjects key **power-card
  names** — the power-card dataset carries no other id. The three shipped lists migrated to
  `subject: "configurations"` in data. **No `game` field** — the subject axis is itself the seam
  a future game would widen, and multi-game stays undesigned.
- **One active list per subject, session-scoped.** `tierStore` keeps the active pick in memory
  (`setActiveListId` keys it by the *list's own* subject — callers never pass a subject); a
  reload boots the default. `getActiveList()` remains the active configurations list — the one
  Browse, the tier board, and the recommender read, so those surfaces can never disagree.
  `getActiveListFor(subject)` is the per-subject seam (undefined when no list of that subject
  exists).
- **A durable default list per subject** (`spirit-island:default-list-id:<subject>`) is what
  boot activates; `setDefaultListId` / `getDefaultList` are the seams #18's Settings pick calls.
  The **legacy durable active-list key migrates to the configurations default** — under the old
  model the durable active pick *was* the boot pick, so users keep booting into the list they
  chose. An unresolvable stored default falls back to the owner's board rather than failing boot.
- **ADR 0001's rules extend unchanged along the axis**: cited = immutable in-app + citation
  required; personal = editable, creatable for any subject (`createList` now takes a `subject`).
  An absent tier key still means unrated, for cards exactly as for configurations.
- **Canon tripwire**: `tierListCanon.test.ts` pins every shipped list's subject and resolves
  every list's tier keys against its subject's namespace (configIds, or power-card names of the
  matching kind). A future card list with a misspelt card name cannot ship.
- **Backup schema unchanged (v3).** Backups never carried the active-list pick and do not carry
  the default-list pick; `tiers` stays `Record<listId, Record<key, label>>`, which is already
  subject-agnostic. Verified by the existing round-trip suite, not assumed.

## Consequences

- A card tier list ships the same way a spirit list does: drop a file under
  `src/data/tier-lists/` with `subject: "minor-powers"` (or `major-powers`), add it to the
  shipped array, and the canon test holds its keys against `power-cards.json`.
- The Tier list tab can serve every subject from one surface (#16), and Settings can offer a
  per-subject boot pick (#18), without further store changes.
- Switching lists mid-session no longer persists by itself — the durable pick is the default
  list, changed deliberately in Settings. This is the model #06 chose: session curiosity is
  cheap, boot behaviour is a setting.

## Left open, deliberately

**The configurations default is still seeded to the owner's board, not the credited cited
list.** The owner named a specific 3MBG video as the app's default
(`.scratch/phase-4/MAP.md`), but its URL matches **no shipped list's citation** —
`3mbg-strength-solo-2025.json` cites a different video id. Per #18's own tripwire ("if no
shipped list's citation matches it, stop and surface to the owner rather than guessing"),
seeding it here would be a guess. **#18 ran that verification and escalated instead of
flipping**: the visible attribution and the Settings default-list pick shipped; the seed stays
the owner's board. Open question for the owner: is `3mbg-strength-solo-2025` (scraped from
`watch?v=d130MTU08fg`) the list you meant by naming `watch?v=LoP2T4GO4xo`, or is that a
different list still to transcribe? Once answered, the flip is a one-line seed change in
`defaultListFor` plus the smoke test's pinned URL.
