# 01 — Export/import backup (schema v1)

Status: done

## Parent

`.scratch/v2/PRD.md`

Read the PRD, `CLAUDE.md`, and `.scratch/spirit-recommender/PRD.md` (v1) before starting.

**This issue blocks the whole of v2 and must land first.** Growing `tiers.json` from 37 to
68 keys changes its seed fingerprint, and `tierStore` discards overrides stamped with a
stale fingerprint (by design — it fixes a real bug where stale edits shadowed a new seed).
Without export/import, that upgrade silently destroys any tier edits made in a browser.

## What to build

Export the whole app state to a versioned file, and import it back.

- A **pure `backup` module**: `serialise(state) → json` and `parse(json) → { state, unresolved }`.
  Testable with no storage and no DOM.
- **Schema v1 declares every section now**, even for features that don't exist yet, so later
  slices populate rather than force a version bump:

```jsonc
{
  "schemaVersion": 1,
  "exportedAt": "<iso8601>",
  "tiers":               { "<configId>": "X" },
  "complexityOverrides": { "<spiritId>": "Moderate" },
  "answers":             { "<questionId>": "<value>" },
  "log": []
}
```

- **The file carries no seed fingerprint.** The fingerprint is a `localStorage` staleness
  guard, not a file format. Import is a deliberate human act: imported overrides are stamped
  with the **current** fingerprint so they survive.
- **Merge policy differs per section, and the asymmetry is the point:**
  - `tiers`, `complexityOverrides`, `answers` → **replace** (a single coherent opinion).
  - `log` → **append, de-duplicated by entry `id`** (an accumulating record; replacing
    destroys played games).
- Import **reports unresolved ids** (keys that no longer match the dataset) instead of
  throwing or silently dropping them. Surface them to the user.
- Reject a bundle whose `schemaVersion` is newer than the app understands, with a clear error.
- **Export is manual** — a download button in the Customise tab. No nags, no cloud.
- **Warn before any action that discards saved data**: "Reset tiers", and the moment a
  shipped-seed change invalidates overrides. Offer to export first.

## Acceptance criteria

- [ ] `serialise` then `parse` round-trips every section
- [ ] `tiers` / `complexityOverrides` / `answers` are **replaced** on import
- [ ] `log` entries are **appended and de-duplicated by id** on import
- [ ] Unknown ids are returned as `unresolved` and shown to the user, never silently dropped
- [ ] A bundle with a future `schemaVersion` is rejected with a clear message
- [ ] Imported tier overrides survive the next page load (stamped with the current fingerprint)
- [ ] Export downloads a file; import accepts it back and restores state
- [ ] "Reset tiers" warns and offers export first
- [ ] The `backup` module is pure — its tests touch no `localStorage` and no DOM

## Blocked by

None - can start immediately.
