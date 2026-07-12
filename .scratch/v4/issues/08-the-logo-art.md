# 08 — The logo art

Status: done
Type: wayfinder:task (AFK, with one HITL check)
Parent: [v4 map](../MAP.md)

## Question

The header's top-left is a text wordmark. The owner wants the **original Spirit Island logo art**
there. Find a real source for it and swap it in.

## The one thing that could make this hard

The archive has 616 assets and **not one of them is the logo** — it's cards, panels, adversaries,
scenarios. So this ticket has a retrieval half before it has a CSS half. Likely sources, in order:
the TTS mod JSON (which already gave 114 assets and may carry a box/banner image), the wiki, the
publisher's own press/media page. `.scratch/asset-archive/REFERENCE.md` holds the pacing and
user-agent rules that make those sources work — read it first.

**Get a real file.** Do not have a model draw an approximation of the logo, and do not settle for a
low-res screenshot scaled up. If no usable source turns up, say so in `## Comments` and stop — a
"close enough" logo is worse than the text one.

## What this ticket produces

- The logo as a committed asset in `public/`, added to `images/manifest.json` with its `source_url`,
  like every other asset in this repo.
- Swapped into the header, sized so it survives #07's 375px pass — a wide wordmark in a phone header
  is exactly the kind of thing that overflows.
- Rights: hosting risk is already accepted (2026-07-09). Do not reopen it.

## Comments

Checked the TTS mod JSON first (per the ticket's suggested order): no `Nickname`/`Description`
containing "logo", "box", "banner", "title" or "cover" anywhere in the 4.2 MB file — the mod has no
box art. Went to the wiki next and found it there: `spiritislandwiki.com`'s own site logo,
`File:Spirit-Island-Logo.png`, fetched via the MediaWiki `imageinfo` API (never the `/images/thumb/`
path, per `REFERENCE.md`). It's a clean isolated crop of the real box-cover wordmark — hand-lettered
"SPIRIT · ISLAND" on a wood-grain banner with vine/flower details, transparent background, 600×208.
Cross-checked against `File:Spirit_Island_box.png` (the actual box cover, 600×600): same artwork,
confirming it's not a fan recreation.

- Archive original saved to `images/spirit_island_logo.png` (git-ignored, per owner policy — matches
  every other archive asset).
- App-facing derivative: `public/spirit-island-logo.webp` (cwebp -q 90, 27.8 KB), following this
  repo's existing convention of webp-only in `public/`.
- Registered in `images/manifest.json` with `source_url` pointing at the wiki's full-resolution API
  URL and a new `asset_type: "logo"`.
- Swapped into `AppShell.tsx`: the `.deck-brand` div (`SPIRIT ISLAND` text) is now an `<img>` with
  `alt="Spirit Island"`. CSS caps it at `max-width: 232px` (the 264px sidebar minus its 1rem
  padding) with `height: auto`, so it scales down as the sidebar narrows rather than overflowing —
  the same technique #07 will need for the rest of the sidebar, done here first since this control
  had to solve it anyway.
- `appSmoke.test.tsx` updated to assert on `alt="Spirit Island"` instead of the removed literal
  `SPIRIT ISLAND` text node. Full suite (246/246), `tsc -b` and `vite build` all clean; `vite
  preview` confirms the derivative resolves at the deployed base path.

**Update (v4 #07's audit):** driven in real Chromium at 375×667 and 390×844 — the logo scales down
with the sidebar exactly as intended, no overflow, no cropping. See
`.scratch/v4/screenshots-07/wizard_step0_375x667.png`. The `max-width: 232px` bound holds. Flipping
to `done`.
