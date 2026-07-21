# 0006 — The asset archive: originals, derivatives, and a manifest as schema

Status: accepted
Date: 2026-07-21

## Context

The spirit detail view was designed around images because transcribing rules text is the repo's
fabrication vector — but the spirit panels never landed (the wiki has no scans), and the owner
wanted the full body of Spirit Island imagery held locally so no future feature stalls on "the
source can't be found". The raw material arrived as a TTS workshop JSON plus ~55 anonymous Steam
downloads with URL-mangled filenames — exactly the unnamed pile whose provenance this repo's
history resolves by guessing. Decided in the asset-archive map + PRD; retrieval methods in
`.scratch/asset-archive/REFERENCE.md`.

## Decision

- **Archive and app are two layers.** `images/` holds byte-identical originals, never re-encoded;
  the app consumes committed webp derivatives (`cwebp -q 85`) at a fixed path contract
  (`public/panels/<spiritId>-{front,back}.webp`, `public/cards/…`). Never point the app at the
  archive; never re-encode an original in place.
- **The manifest is the archive's schema.** One committed JSON (`images/manifest.json`), one row
  per asset → filename, source URL, asset type, associated spirit, source site. Provenance lives in
  the manifest, never in filenames or memory.
- **Git contract:** everything under `images/` is git-ignored except the manifest; the app-facing
  derivatives under `public/` are committed. Enforced by `.gitignore`.
- **Three fixed sources, one per asset class:** SICK's `cards.js` for standard cards (it is
  simultaneously download index and card database), the wiki's MediaWiki API for exactly the 31
  aspect cards, the TTS workshop JSON for spirit/adversary/scenario panels. Retrieval is paced
  (~1s, descriptive User-Agent, never retry aggressively — the wiki's "captcha" was user-agent
  rejection).
- **Anti-fabrication rules (ADR 0003 applied to assets):** a spirit association comes from SICK's
  `"Unique Power: <spirit>"` field, never a filename; a panel is matched by the JSON's
  Nickname/Description or by reading the image, never by recall; an asset that cannot be named or
  sourced is flagged and left absent, never substituted.
- **Tripwire: a guarded `archiveIntegrity` test** — skips when the archive directory is absent (a
  clone without the untracked originals stays green), and otherwise asserts manifest↔disk
  completeness both ways plus the sanity counts (aspects 31, adversaries 8, scenarios 15, panel
  fronts/backs 37 each). `dataIntegrity` covers the app-facing derivatives unconditionally.

## Consequences

- Any future feature draws on local originals instead of re-scraping a community site; the manifest
  is the audit trail from a file back to its source URL.
- A missing asset degrades to `PlaceholderArt`; an incomplete archive never breaks the app or the
  test suite.

## Left open, deliberately

**The TTS mod's own Steam Workshop source URL** was never found inside the JSON — a standing
owner-facing gap noted in the asset-archive map, not a licence to invent one. TTS-only extras (deck
atlases, tokens, island boards, invader cards) are undecided fog, outside the archive's counts.
