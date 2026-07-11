# 02 — Mirror the SICK card catalog

Status: done
Labels: wayfinder:task
Assignee: agent

## Parent

`.scratch/asset-archive/MAP.md` and [PRD.md](../PRD.md) — read the map's Notes and
[REFERENCE.md](../REFERENCE.md) (Source A) first.

## Question

Download every card image SICK serves, at original quality, into the archive.

- Fetch `https://sick.oberien.de/cards.js` once; it is both the image index and the card database
  (name, type, cost, elements, spirit association).
- Extract every `imgs/` path (jpg, png, webp) and download relative to the site root:
  `imgs/powers/` (unique + minor + major), `imgs/events/`, `imgs/fears/`, `imgs/blights/`.
- Land files under `images/` in the clean scheme (e.g. `images/cards/minor/<card_name>.webp`,
  `images/spirits/<spirit_slug>/unique_<card_name>.webp`) — map unique powers to spirits **only**
  via cards.js entries whose type reads `Unique Power: <spirit>`; never from filenames, never
  assuming 4 per spirit.
- Emit manifest rows (new filename → source URL → asset type → spirit) as a linked asset for #06
  to merge.
- Resumable: skip files already present. Polite pacing; it's a small community site.
- Do **not** use the oberien/spirit-island-card-katalog GitHub repo (git-LFS quota failures).

Resolution records: counts per card type as derived from cards.js vs files landed (report any
mismatch — expect events ≈ 64), and any card whose image failed to download.

## Acceptance criteria

- [ ] Every `imgs/` path referenced in cards.js exists as a local original — no re-encoding, no
      resizing
- [ ] File counts per card class match what cards.js itself says (events ≈ 64); any mismatch is
      reported, not smoothed over
- [ ] Every unique power's spirit comes from a `Unique Power: <spirit>` database entry; no spirit
      count assumed, no filename inference
- [ ] Manifest rows (filename → source URL → asset type → spirit) emitted for every file landed
- [ ] Re-running the retrieval skips existing files and downloads nothing twice
- [ ] Failed downloads are listed by card name in the resolution

## Blocked by

None — can start immediately.

## Comments

`cards.js` was loaded as real JS (Node, DOM stubbed out, page-load handler truncated) rather than
regex-scraped, so `getImageFolder()`/`getImagePath()` — the site's own naming logic — produced the
exact paths instead of a guessed pattern. Each card's `type` field was read directly for the
`Unique Power: <spirit>` string; spirit id resolved via a case-insensitive match against
`src/data/spirits.json` names (two mismatches were pure capitalization — "Starlight Seeks its
Form" vs "Its", "Sharp Fangs behind the Leaves" vs "Behind" — matched correctly, not guessed).

**Resolution — counts per cards.js vs files landed, exact match, zero mismatches:**

| class  | cards.js | landed |
|--------|---------:|-------:|
| unique | 153      | 153    |
| minor  | 101      | 101    |
| major  | 78       | 78     |
| event  | 65       | 65     |
| fear   | 50       | 50     |
| blight | 24       | 24     |

- Events: 65 vs the PRD's "≈64" estimate — one over, not a mismatch worth flagging further (the
  PRD's own count is qualified as approximate).
- **0 failed downloads.** Every card resolved to a `.webp` (site's preferred format; `.jpg`/`.png`
  fallback tried and unused).
- All 153 unique powers mapped to a spirit via the `Unique Power: <spirit>` type field — all 37
  spirits covered, no filename inference, no spirit-count assumption.
- Landed under `images/cards/{minor,major,event,fear,blight}/` and
  `images/spirits/<id>/unique_<card_name>.webp`; manifest at
  `.scratch/asset-archive/assets/sick-manifest.json` (471 rows) — a linked asset for #06 to merge.
- Re-run is resumable: `try_download` skips any local path that already exists before touching
  the network. Pacing: 0.3s between requests, one descriptive User-Agent, no retries beyond the
  three extension attempts (webp→jpg→png) per card.
