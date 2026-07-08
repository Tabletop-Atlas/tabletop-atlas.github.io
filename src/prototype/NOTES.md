# Prototype — visual direction for the recommender

**Status: awaiting verdict.**

## Question

The app works but looks barebones. What should it look like? Specifically the three
surfaces: the results/shortlist, the tier board, and the browser.

## Shape

Three variants of the whole app shell, rendered on the existing single route, gated on
`?variant=A|B|C`. Real data, real artwork, real tier list. Floating switcher at the
bottom (← / → also cycle).

- `?variant=A` — **Dossier.** Dark, editorial, single column. Full-bleed banner art,
  serif display type, big rank numerals, no cards at all. Tier list as typographic rows.
  Browser as a dense index list. Primary affordance: *reading*.
- `?variant=B` — **Command deck.** Dense dashboard. Persistent left sidebar whose weight
  sliders **actually re-rank live**. Compact result rows, monospace numerals, OCFDU as a
  heat strip. Tier list as chips. Browser as a sortable table. Primary affordance:
  *fiddling with the model*.
- `?variant=C` — **Gallery.** Light, airy, art-forward. Three hero cards as a podium
  (best fit raised). Tier list as horizontal art rails. Browser as a masonry-ish gallery.
  Primary affordance: *looking at spirits*.

## Deviation from the skill's defaults

The switcher is **not** hidden in production. This project's only viewing surface is the
GitHub Pages production build, so hiding it there would make the prototype unusable. It is
instead **opt-in**: nothing renders unless `?variant=` is present, so a stray merge cannot
show it to a normal visitor. This must be deleted regardless once a direction is picked.

## Verdict

<!-- Fill in: which variant won, what got stolen from the others, and why. -->

- Winner:
- Stolen from others:
- Reasoning:

## Cleanup

Delete `src/prototype/` and the `usePrototypeVariant` hook + early return in `src/App.tsx`.
Rewrite the winning variant properly (it was written under prototype rules: no tests, no
error handling, no abstractions). Do not promote this code directly.
