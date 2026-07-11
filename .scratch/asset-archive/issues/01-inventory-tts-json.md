# 01 — Inventory the TTS mod JSON

Status: done
Labels: wayfinder:task
Assignee: agent

## Parent

`.scratch/asset-archive/MAP.md` and [PRD.md](../PRD.md) — read the map's Notes and
[REFERENCE.md](../REFERENCE.md) (Source C) first.

## Question

What image assets does `images/spirit_island_tabletop_simulator_mod.json` actually contain, and
which of them do we already have on disk?

Produce a linked asset (`assets/tts-inventory.json` or `.csv` in this feature dir) with one row
per **deduplicated** image URL:

- the URL (scan the whole file as raw text — `FaceURL`, `BackURL`, `ImageURL`,
  `ImageSecondaryURL`, and any http image URL inside Lua script strings)
- the nearest `Nickname` / `Description` context
- a best-guess asset class (spirit panel front/back, adversary, scenario, deck atlas, token,
  board, other) — from context fields only, never from downloading and guessing
- whether the file already exists in `images/{Adversary,Scenarios,Spirit Panels}/` — those ~55
  files are named as the source URL with punctuation stripped, so matching is mechanical

Do **not** download anything new in this ticket; it's the index the downstream naming tickets
work from. Note in the resolution: total unique URLs, count per asset class, how many are already
on disk, and whether the JSON carries the mod's own name/Workshop URL (the manifest will need it).

## Acceptance criteria

- [ ] Every http image URL in the JSON is captured — structured fields *and* Lua script strings —
      and deduplicated
- [ ] Each URL row carries its nearest Nickname/Description context and an asset-class guess from
      context only, never from downloaded content
- [ ] Every file already in the three raw download directories is matched to its URL row
- [ ] Nothing was downloaded; the inventory is an index, not a retrieval
- [ ] Resolution states totals per asset class, on-disk coverage, and whether the JSON names the
      mod / its Workshop URL

## Blocked by

None — can start immediately.

## Comments

Inventory built at `.scratch/asset-archive/assets/tts-inventory.json` by scanning the whole JSON
as raw text (regex over `https?://...`, filtered to `steamusercontent`/`akamaihd` hosts or a
`.png/.jpg/.jpeg/.webp` suffix — the akamaihd URLs carry no file extension, only a hash path, so
an extension-only filter would have silently dropped every already-downloaded panel/adversary/
scenario asset). Nearest `Nickname`/`Description` found by byte-offset proximity (closest match
within 3000 chars either side).

**Resolution:**
- **1060 unique image URLs** found in the JSON.
- **Asset-class guess counts**: spirit panel 74, scenario 48, adversary 8, other 690, no-context
  240. Classification uses the on-disk raw-download directory as ground truth where a URL is
  already downloaded (mechanical, not a guess), falling back to Nickname/Description keyword
  context otherwise. Three URLs (`Balanced Boards`, `Invader Board`, `Spirit Panel Editor`) matched
  the "panel/board" keyword but are mod-UI objects, not per-spirit scans — explicitly excluded
  rather than counted, since a keyword match alone isn't a safe classification.
- **On-disk coverage: 114/114** — every one of the ~55 raw files each in `Adversary/`,
  `Scenarios/`, `Spirit Panels/` (mechanical filename match, source URL with punctuation
  stripped) resolved to a URL row. All 74 spirit-panel URLs are already on disk (37 spirits × 2
  sides). The 48 "scenario" and 8 "adversary" URL rows exceed the 32/8 files on disk — likely
  duplicate object references in the JSON pointing at the same already-downloaded image; #05
  reconciles this against the 15-scenario/8-adversary sanity counts.
- The bulk of "other" (690) and "no-context" (240) rows are TTS-internal tokens, map/board
  furniture and generic game pieces (Blight, Cities, Towns, Ready markers, etc.) — out of this
  spec's scope per the PRD's "TTS-mod-only extras" exclusion. Nothing there was assumed to be a
  spirit/adversary/scenario asset without a context match.
- **Mod name found**: `SaveName` = "Spirit Island - [By MJ & iakona]". No Workshop URL string is
  present anywhere in the JSON (searched for `steamcommunity.com/sharedfiles` — zero matches).
  The manifest will need the Workshop URL as a one-line ask to the owner, per the map's "Not yet
  specified" note.
- Nothing was downloaded; this ticket only produced the index.
