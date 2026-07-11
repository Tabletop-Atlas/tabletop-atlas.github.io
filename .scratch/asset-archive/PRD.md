# PRD — Spirit Island asset archive

Status: ready-for-agent

Companion documents: [MAP.md](MAP.md) (the wayfinder map working this spec, with its seven wired
tickets) and [REFERENCE.md](REFERENCE.md) (the owner's verified sources and retrieval methods —
mandatory reading for any retrieval work; this spec does not restate it).

## Problem Statement

The recommender's detail view was designed around images — panels and cards — because transcribing
rules text is this repo's documented fabrication vector. The cards landed (all 37 spirits' starting
cards, v3 #11), but the spirit panels never did: the wiki has no panel scans, so every spirit still
renders `PlaceholderArt` where its panel front and lore back should be. Beyond the app's immediate
need, the owner wants the full body of Spirit Island imagery — every power, event, fear and blight
card, all 31 aspect cards, adversary and scenario panels — held locally at original quality, so no
future feature ever again stalls for weeks on "the source can't be found". The raw material now
exists (a TTS workshop JSON plus ~55 anonymous Steam downloads with URL-mangled filenames), but an
unnamed pile of PNGs whose provenance lives nowhere is exactly the kind of ambiguity this repo's
history says gets resolved by guessing.

## Solution

A complete local archive under the repo's images directory: original files, never re-encoded,
renamed into one human-readable scheme keyed to spirit and asset names, with a single committed
manifest mapping every file to its source URL, asset type and associated spirit. The archive is
populated from the three verified sources in REFERENCE.md (SICK for standard cards, the wiki API
for the 31 aspect cards, the TTS mod JSON for panels), stays untracked in git except the manifest,
and is verified by a guarded test that enforces manifest completeness and the sanity counts
whenever the archive is present. As the one app-facing step, the 37 spirits' panel fronts and lore
backs are converted to webp derivatives at the exact paths the detail view already requests —
panels appear in the app with no app-code changes at all.

## User Stories

1. As the app user, I want a spirit's panel front in the detail view, so that I can read its
   growth options and presence tracks instead of a placeholder.
2. As the app user, I want the panel's lore back in the detail view, so that I can read a
   spirit's innate powers and setup the way the physical component presents them.
3. As the app user, I want panels rendered from images rather than transcribed fields, so that no
   hand-typed rules text can be fabricated.
4. As the app user, I want a spirit whose panel asset is missing to render the placeholder, so
   that an incomplete archive never breaks the detail view.
5. As the app user on a phone, I want the detail view with real panels to stay within the
   viewport width, so that the page never scrolls horizontally.
6. As a screen-reader user, I want each panel image to carry alt text naming the spirit and side,
   so that the view stays navigable.
7. As the owner, I want every SICK card image (unique, minor, major, event, fear, blight) held
   locally at original quality, so that future features draw on local files instead of re-scraping
   a community site.
8. As the owner, I want all 31 aspect card scans at full resolution, so that the one card type
   SICK lacks is covered from the wiki originals, never thumbnails.
9. As the owner, I want the 8 adversary and 15 scenario panels named and archived, so that
   adversary- and scenario-facing features have their imagery ready.
10. As the owner, I want every archive file named by what it depicts, so that I can find an asset
    by spirit and kind without opening images one by one.
11. As the owner, I want one manifest mapping every file to source URL, asset type and spirit, so
    that every asset's provenance is recorded instead of remembered.
12. As the owner, I want the manifest committed while the image bulk stays untracked, so that the
    repo stays small and the archive stays reproducible from its recorded URLs.
13. As the owner, I want downloads to be resumable and skip existing files, so that a retrieval
    session interrupted mid-way costs nothing and hammers no community site.
14. As the owner, I want retrieval paced politely with a descriptive User-Agent, so that the small
    community sites serving these files aren't burdened or provoked into blocking.
15. As the owner, I want any asset that cannot be sourced or named flagged explicitly (a lore back
    for manual scanning, an unmatched panel reported), so that gaps are visible instead of filled
    with substitutes.
16. As the owner, I want the archive checked against the sanity counts, so that a silent shortfall
    (30 aspects, 7 adversaries) is reported as a mismatch, not shipped as done.
17. As an AFK agent on a later feature, I want unique powers mapped to spirits from the SICK
    database's own type field, so that no spirit association is ever inferred from a filename.
18. As an AFK agent, I want the guarded archive test to fail when the manifest and the files on
    disk diverge, so that drift after unification is caught, not discovered mid-feature.
19. As an AFK agent on a clone without the archive, I want that test to skip itself, so that the
    suite stays green where the untracked images legitimately don't exist.
20. As an AFK agent, I want the existing data-integrity test extended to panel derivatives the
    same way it covers cards, so that a spirit whose panel webp goes missing fails loudly.
21. As a future reader, I want the TTS mod cited in the manifest as the panels' source, so that
    the provenance trail doesn't end at "some JSON the owner had".
22. As a future reader, I want the raw URL-mangled download directories gone once their contents
    are renamed and manifested, so that the archive has one naming scheme, not two.
23. As the owner, I want the archive work to leave v3 #11's record updated when panels land, so
    that the issue history says how its last open half was resolved.

## Implementation Decisions

- **The archive and the app are two layers.** The archive holds byte-identical originals; the app
  consumes committed webp derivatives generated from them. Never re-encode an archive file in
  place; never point the app at the archive directly.
- **Three sources, fixed per asset class** (full methods in REFERENCE.md): SICK's `cards.js` for
  all standard cards — it is simultaneously the download index and the card database; the wiki's
  MediaWiki API (`generator=images` on List of Aspect Cards) for exactly the 31 aspect cards; the
  TTS workshop JSON for spirit panels and adversary/scenario panels, scanned as raw text because
  URLs hide in Lua script strings.
- **Naming scheme**: human-readable, keyed to spirit and asset names — per-spirit directories
  holding panel front, lore back and unique powers; shared directories per card class (minor,
  major, event, fear, blight), adversaries and scenarios. Spirit identity uses the repo's existing
  spirit slugs/ids from the spirits dataset; the wiki's All Spirits page is the cross-check.
- **The manifest is the archive's schema**: one committed JSON file, one row per asset — archive
  filename, source URL, asset type, associated spirit (where applicable), source site. Provenance
  lives here, not in filenames or memory.
- **Git contract**: everything under the images directory is ignored except the manifest. The
  app-facing webp derivatives under public/ are committed as they already are for cards.
- **Anti-fabrication rules, inherited from the repo's canon**: a spirit association comes from the
  SICK database's `Unique Power: <spirit>` type field, never a filename; a panel is matched to its
  spirit by the JSON's Nickname/Description or by reading the image itself, never by recall; an
  asset that cannot be named or sourced is flagged and absent, never substituted. Expect the
  aspect query to yield exactly 31 files and report any other count.
- **App contract (already shipped, unchanged)**: the detail view requests panel derivatives at
  `panels/<spiritId>-front.webp` and `-back.webp` under the public root and falls back to
  `PlaceholderArt` when absent. This feature adds files at that contract; it changes no component.
- **Derivative encoding** matches the cards' precedent: `cwebp -q 85`.
- **Resolution order**: the TTS JSON inventory precedes any panel naming; per-source retrievals
  run independently; manifest unification and cleanup of the raw-named directories come last. The
  panels-into-app step needs only the named spirit panels, not the full manifest.

## Testing Decisions

- A good test here asserts external, observable state — files exist where contracts say, counts
  match the printed game's reality — never how a retrieval script worked. Retrieval scripts
  themselves are throwaway and untested; what's tested is what they leave behind.
- **Existing seam, extended**: the data-integrity test already asserts an on-disk asset for every
  spirit's art and every starting card; it gains the same existence check for both panel
  derivatives per spirit. Prior art: its own card-asset block.
- **New seam (the only one)**: a guarded archive test alongside the other data tests. When the
  archive directory is absent it skips; when present it asserts every manifest row's file exists,
  every archive file has a manifest row, and the sanity counts hold — aspects 31, adversaries 8,
  scenarios 15, panel fronts and lore backs 37 each, events ≈ 64, with power/fear/blight counts
  derived from the SICK database rather than hard-coded. Prior art for count-pinning tripwires:
  the aspect and adversary canon tests.
- **App behaviour is already covered** by the smoke test (placeholder fallback, no-throw) and was
  browser-verified in v3 #12; landing panel files must not require changing those tests — if it
  does, the contract was broken.

## Out of Scope

- Wiring any archive asset beyond spirit panels into the app (aspect card images in the detail
  view, event/fear browsing) — future feature efforts.
- Committing the image bulk to git — decided against (owner, 2026-07-11).
- Transcribing anything readable on the images into data fields — the standing anti-fabrication
  rule; aspect-to-starting-card deltas remain out of scope per v3.
- Rights/licensing research — settled as accepted risk (owner, 2026-07-09); not to be reopened or
  reassured away.
- TTS-mod-only extras (deck atlases, tokens, island boards, invader cards) — undecided fog on the
  map, not part of this spec's counts.

## Further Notes

- REFERENCE.md's warning stands: the wiki's earlier "captcha" was user-agent rejection; pace at
  ~1s with a descriptive UA and never retry aggressively.
- Roughly 55 raw downloads already exist with filenames that are their source URL with punctuation
  stripped — matching them to inventory URLs is mechanical, so nothing already on disk is fetched
  twice.
- Expect the scenario directory's ~32 files against 15 scenarios (fronts/backs or extras); the
  reconciliation must account for every file rather than stopping at 15 matches.
- The map's tickets 01–07 are the work breakdown of this spec; resolve them through the map so
  decisions land in one place.
