# 13 — Spirit artwork

Status: ready-for-human

## Parent

`.scratch/spirit-recommender/PRD.md`

## What to build

Acquire and wire up real spirit artwork, replacing the element-colored placeholder tiles.

This is a **human task** — it needs sourcing/cropping decisions (and the owner has said the
personal-use licensing is fine): the agent can't reliably fetch and crop binary art.

- Acquire a **cropped illustration thumbnail** per spirit (the artwork from the top of the
  official spirit panel), cropped to a **uniform aspect ratio** so grid/card layouts stay
  clean. Source from the wiki panel art.
- Save as WebP in `public/spirits/<slug>.webp`, where `<slug>` matches the name-derived slug
  convention established in the app. Add an explicit `image` override in `spirits.json` only
  for names that don't slugify cleanly.
- Confirm lazy-loading and that placeholders still render for any missing image.

## Acceptance criteria

- [ ] A uniform-aspect WebP thumbnail exists for each spirit under `public/spirits/`
- [ ] Filenames match the app's slug convention (or an `image` override is set)
- [ ] Art appears in the Recommender, Browser, and Tier list; placeholders cover any gaps
- [ ] Images lazy-load

## Blocked by

- #01 (slug convention). Slots into #08's placeholder grid and #06's rec cards.
