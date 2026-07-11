# Asset archive — wayfinder map

Labels: wayfinder:map

## Destination

A complete local archive of Spirit Island image assets — all standard cards, the 31 aspect cards,
spirit panels (front + lore back), adversary and scenario panels — as original-quality source
files under `images/`, renamed to a clean human-readable scheme, with a committed manifest mapping
every file to its source URL, asset type and associated spirit. Plus the one app-facing step v3
#12 has been waiting on: the 37 spirits' panels converted to webp at
`public/panels/<spiritId>-{front,back}.webp`, closing out `.scratch/v3/issues/11-transcribe-starting-cards.md`'s
panel half.

## Notes

- **This map carries execution.** The tickets download, rename and verify — they are `task` type,
  AFK unless marked otherwise. The owner supplied verified sources and methods; there is little
  left to decide, mostly to do.
- **[REFERENCE.md](REFERENCE.md) is mandatory reading for every ticket.** It holds the three
  sources (SICK, wiki API, TTS JSON), the user-agent/pacing rules that make the wiki work, and the
  quality rules: originals only, never re-encode, resumable, polite pacing.
- **This repo fabricates when a source can't answer** (see CLAUDE.md). Archive rule: an asset that
  cannot be matched to a name is flagged in the ticket's Comments, never guessed. A missing lore
  back is reported for manual scanning, never substituted.
- **Git policy (owner, 2026-07-11):** `images/` stays untracked except the manifest. App-facing
  webp derivatives in `public/` are committed as before.
- **Prior art:** starting cards for all 37 spirits are already done and committed
  (`public/cards/`, see v3 #11 Comments). `images/{Adversary,Scenarios,Spirit Panels}/` already
  hold ~55 raw TTS downloads whose filenames are the source URL with punctuation stripped —
  reconcile, don't re-download.
- **Rights:** the owner accepted the hosting risk (2026-07-09, recorded in v3 #11 Notes and
  memory). Do not reopen, do not research GTG's terms, do not block on it.
- Tracker mechanics: tickets are `issues/NN-slug.md`. Claim by adding an `Assignee:` line before
  working. Frontier = open, unassigned, everything in its `## Blocked by` closed (`Status: done`).

## Decisions so far

<!-- one line per closed ticket -->
- **#01–#07 all done (2026-07-12).** 616-row `images/manifest.json` committed, `images/` git-ignored
  except it. 471 SICK cards, 31/31 aspects (REFERENCE.md's exact recipe undershot 6/31; adapted
  using its own per-spirit-page fallback), 74/74 spirit panels (37/37, zero gaps), 8/8 adversaries,
  15/15 scenarios. Panels wired into the app at `public/panels/`, closing v3 #11's panel half.
  One open HITL ask: the TTS mod's Steam Workshop URL isn't in the JSON anywhere — owner knows
  which listing they subscribed to, nothing else found it. See each ticket's Comments for the
  full trail; `.scratch/v3/issues/11-transcribe-starting-cards.md` has the cross-reference.

## Not yet specified

- **Deck atlases and mod-only assets.** The TTS JSON likely holds sprite-sheet decks and objects
  neither SICK nor the wiki covers (invader cards, tokens, island boards, power progression
  decks). Whether any of that belongs in the archive can't be judged until the inventory
  ([01](issues/01-inventory-tts-json.md)) shows what's actually there and the SICK mirror shows
  what's already covered.
- **Source citation for the TTS assets.** The manifest needs the mod's Workshop URL/name; the JSON
  may carry it, otherwise it's a one-line HITL ask when the manifest is unified.

## Out of scope

- **Committing the bulk archive to git** — owner chose untracked-with-committed-manifest
  (2026-07-11).
- **Wiring archive assets beyond panels into the app** (aspect card images in the detail view,
  event browsing, etc.) — a future feature effort against the v3 app, not part of reaching this
  archive.
- **Rights/licensing research** — explicitly settled as accepted risk; see Notes.
