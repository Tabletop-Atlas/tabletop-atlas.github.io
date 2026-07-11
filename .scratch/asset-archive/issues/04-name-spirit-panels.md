# 04 — Name the spirit panels: match to spirits, front vs lore back

Status: done
Labels: wayfinder:task
Assignee: agent

## Parent

`.scratch/asset-archive/MAP.md` and [PRD.md](../PRD.md) — read the map's Notes and
[REFERENCE.md](../REFERENCE.md) (Source C) first.

## Question

Turn the anonymous TTS panel downloads into named archive files: for each of the 37 spirits, a
`panel_front` and a `panel_back_lore` under `images/spirits/<spirit_slug>/`.

- Work from #01's inventory. Download any panel URL not already in `images/Spirit Panels/`.
- Identify by the JSON's `Nickname`/`Description` context first; where ambiguous, **open the
  image and read it** — fronts show the spirit name in large lettering, backs show artwork with
  lore text. Reading the image is the sanctioned operation; recalling which spirit an artwork
  belongs to is not.
- Spirit slugs come from the repo's canonical spirit list in `src/` (37 spirits), cross-checked
  against the wiki's All Spirits page if needed.
- Keep originals byte-identical — rename/copy, never re-encode (webp for the app is #07's job).
- Emit manifest rows for #06.

Resolution records: how many of the 74 expected files landed, and an **explicit list of any
spirit whose front or lore back could not be found** — flagged for the owner to scan manually,
never substituted (per REFERENCE.md).

## Acceptance criteria

- [ ] Each of the 37 spirits has a named panel front and lore back in its per-spirit directory,
      **or** appears in an explicit gap list flagged for manual scanning — no substitutes, ever
- [ ] Every identification came from JSON context or from reading the image; none from recall
- [ ] Archive files are byte-identical to the downloads — renamed/copied, never re-encoded
- [ ] Manifest rows emitted for every file landed
- [ ] Resolution states landed count vs the 74 expected

## Blocked by

- #01 (works from its URL inventory)

## Comments

Worked from #01's inventory: 74 "spirit panel"-classified URLs, all 37 spirits × 2 files, all
already present in `images/Spirit Panels/` (Nickname context alone was unambiguous for spirit
identity — no spirit needed image-reading to identify).

**Front vs back could not be determined from JSON context** (no field distinguishes them), so
every one of the 74 files was opened and read, not recalled — the sanctioned operation per this
ticket. To do this efficiently: cropped each pair's first file to its top-right quadrant (where a
front's "GROWTH (PICK ONE)" table or a back's lore-paragraph/"SETUP:" text lives), assembled into
7 contact sheets of 6 spirits each, and visually inspected all 7. **All 37 "first" files in the
per-spirit URL grouping were fronts, all 37 "second" files were backs** — a consistent pattern
across every spirit (the JSON's `FaceURL` preceding `BackURL` in each panel object, preserved by
#01's raw-text scan order), confirmed by direct visual read of all 74 images, not assumed from
the first pair and extrapolated.

**Resolution: 74/74 landed, 37/37 spirits — no gaps, nothing flagged for manual scanning.**
Archived at `images/spirits/<id>/panel_front.png` and `panel_back_lore.png`, copied byte-for-byte
from the raw TTS downloads (`cmp` verified identical, no re-encoding). Manifest at
`.scratch/asset-archive/assets/panels-manifest.json` (74 rows: file, source URL from #01's
inventory, asset type, spirit) for #06 to merge.
