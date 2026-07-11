# 03 — Download the 31 aspect cards from the wiki API

Status: done
Labels: wayfinder:task
Assignee: agent

## Parent

`.scratch/asset-archive/MAP.md` and [PRD.md](../PRD.md) — read the map's Notes and
[REFERENCE.md](../REFERENCE.md) (Source B) first.

## Question

Retrieve all 31 aspect card scans from `https://spiritislandwiki.com/api.php`.

- `action=query&generator=images&titles=List of Aspect Cards&prop=imageinfo&iiprop=url&format=json&gimlimit=500`,
  following the continue token until exhausted.
- Download the `imageinfo.url` full-resolution original; **never** any `/images/thumb/` path.
- Discard results whose name contains "box" or "flag". Filenames follow
  `Spirit Name (Aspect Name).png` and contain apostrophes/parentheses — URL-encode carefully.
- **The wiki is not captcha-gated**: send a descriptive User-Agent
  (`SpiritIslandArchiver/1.0 (personal use, contact adam.kubovic@gmail.com)`), one session,
  ~1s between requests, no aggressive retries.
- Land under `images/` in the clean scheme keyed to the app's 31 aspect configurations (the
  repo's aspect canon in `src/` is the cross-check for the spirit↔aspect pairing).
- Emit manifest rows for #06.

Resolution records the final count. **Exactly 31 or report the mismatch** — do not pad, do not
silently accept 30.

## Acceptance criteria

- [ ] Exactly 31 aspect card files landed, or the mismatch is reported as the headline of the
      resolution — never padded, never silently fewer
- [ ] Every file is the full-resolution original; no `/images/thumb/` URL was fetched
- [ ] Box/flag images discarded; every kept file pairs to one of the repo's 31 aspect
      configurations
- [ ] Requests carried the descriptive User-Agent at ~1s pacing in one session; no retry loops
- [ ] Manifest rows emitted for every file landed

## Blocked by

None — can start immediately.

## Comments

**REFERENCE.md's exact recipe (`generator=images` on "List of Aspect Cards") undershoots.**
Followed literally, it returns 25 candidate images; after discarding box/flag and matching the
`Spirit Name (Aspect Name).png` filename pattern, only **6 of 31** aspect cards resolve — the
page mostly embeds spirit "Navicon" thumbnails and box art, not a full gallery of aspect scans.
This was verified, not assumed: the raw API response was inspected directly (25 pages, no
`gimcontinue`, so pagination wasn't the issue).

**Adapted using REFERENCE.md's own fallback clause** ("the same technique works on any other wiki
page title... if a gap ever needs filling"): queried each spirit's own wiki page
(`generator=images&titles=<Spirit Name>`) for images named `<Aspect Name> (<set-abbrev>).png` —
excluding `Navicon` files, which are unrelated nav-thumbnail assets that happen to share the
spirit's name. Aspect names are unique across all 37 spirits in `src/data/spirits.json` (checked:
zero name collisions), so a filename match to a spirit's own declared aspect list is unambiguous,
never a guess. This landed 23 more (29 total).

**Two remained after that pass** (Ocean's Hungry Grasp's "Deeps", Serpent Slumbering Beneath the
Island's "Locus") — their spirit pages embed only the aspect's individual power cards
(`Deeps 1 (ni).png`, `Locus 1 (ni).png`, etc.), not the aspect identity card. Found instead on
the *aspect's own* wiki page (`generator=images&titles=Deeps` / `titles=Locus`), which embeds
`<Spirit Name> (<Aspect Name>).png` — the same pattern REFERENCE.md described, just hosted on a
different page than the one it named.

**Resolution: exactly 31/31 aspect cards landed, headline count intact — no padding, nothing
substituted.** Landed at `images/spirits/<id>/aspect_<name>.png` (originals, no re-encoding);
manifest at `.scratch/asset-archive/assets/wiki-aspects-manifest.json` (31 rows, one per file,
source URL + spirit id + aspect name). No `/images/thumb/` URL was ever fetched — verified by
checking every kept `imageinfo.url` for the substring before download. All requests carried the
`SpiritIslandArchiver/1.0` User-Agent in one session at ~1s pacing; no retry loops.
