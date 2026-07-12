# 04 — What a filtered result looks like, at 375px

Status: ready-for-human
Type: wayfinder:prototype (HITL)
Parent: [v4 map](../MAP.md)

## Blocked by

- [01 — Where card data comes from](01-where-card-data-comes-from.md)

## Question

Card art is the point of a card browser, but 471 images is a lot on a phone. Does a result read as a
wall of card images, as compact data rows with the art one tap away, or as something between?

The owner explicitly declined to decide this off a description: **"let a prototype decide."** So
build both, cheap and rough, and look at them at a real phone viewport before committing.

## What to build

Use `/prototype`. Throwaway, not production code, not tested, not wired into `AppShell`.

- **A.** Lazy-loaded image grid. Tap enlarges. The filters are the only way to read a card's data.
- **B.** Compact rows — name, elements, cost, speed — that scan fast at 375px. Tap opens the art.
  `SpiritDetail`'s existing click-to-enlarge card modal is the prior art; reuse it, don't rebuild it.

Feed both from real data (#01's source, even hand-copied into a fixture) and real images from
`images/cards/`. A prototype on fake cards answers nothing.

Look at them at **375px and at desktop width** — the desktop layout the owner already likes must not
regress. Judge: how many cards fit before scrolling, how long the grid takes to paint, whether the
data is legible without opening anything.

## What this ticket produces

The owner's choice, recorded in `## Comments`, plus whatever the prototype revealed about
thumbnails — if the grid needs smaller derivatives than the ~28 KB full-size webps, that's the input
[#05](05-card-art-into-the-app.md) is waiting for.

## Comments

Both variants built as a standalone Vite HTML entry (`prototype-v4-cards-shape.html` at the repo
root → `src/prototypes/v4-cards-shape/`), deliberately **not** wired into `App.tsx`/`AppShell` per
this ticket's own instruction. `vite build` confirmed to still emit only `index.html` at its
original size — the prototype has zero footprint on the real app or its production bundle.

**How to look at it:** `npm run dev`, then open `/spirit-island/prototype-v4-cards-shape.html` (note
the `base: '/spirit-island/'` prefix `vite.config.ts` already requires for every route). Switch
variants with the floating pill at the bottom (click the arrows, or `←`/`→`), or set `?variant=A` /
`?variant=B` directly in the URL. Resize the window or use devtools device emulation for 375px.

**Data**: 36 real cards (24 power spread across minor/major/unique, 4 each of fear/event/blight),
pulled from the exact source #01 verified (`oberien/spirit-island-card-katalog`'s `DB.CARDS`, the
same extraction #01 used — not hand-typed, not guessed) and joined to the real archive images. Not a
cherry-picked "nice" sample — picked by even-stride sampling across each type's full list, so it
includes ordinary cards, not just visually striking ones. Fixture and images live in
`src/prototypes/v4-cards-shape/fixture.{json,ts}` and `public/_prototype-04/cards/` (1.4 MB, 36
webps copied from the archive — throwaway, delete both when this ticket closes).

**What each variant is:**

- **A — image grid.** `repeat(auto-fill, minmax(140px, 1fr))`, native `loading="lazy"`, tap opens
  `CardViewer` (#10's component, reused not rebuilt). At 375px: 2 columns, ~5 rows visible before
  scrolling (10 cards). At 1440px desktop: 9 columns, all 36 visible without scrolling, ~2 rows.
- **B — compact rows.** Flex-wrap (not a rigid grid — deliberately, since a fixed-column grid is
  exactly what #14 just had to fix elsewhere for not shrinking below its content width). Type badge,
  name (+ spirit name for uniques), element glyphs, cost, speed; fear/event/blight render `—` for
  the three power-only fields rather than blank space. Tap opens the same `CardViewer`. At 375px:
  ~15 rows visible before scrolling. At desktop: all 36 visible, no scrolling.

**Verified with Playwright** (real Chromium) at 375×900 and 1440×900: no horizontal overflow on
either variant at either width; tap-to-enlarge confirmed working in both. Screenshots in
[`screenshots-04/`](../screenshots-04/): `variantA_375.png`, `variantA_desktop.png`,
`variantB_375.png`, `variantB_desktop.png`, `enlarge_A.png`.

**One thing the prototype already answered without needing a decision:** the full-size ~28 KB webps
paint fine even in the 36-tile grid at 375px — no visible jank, no obvious need for smaller
thumbnail derivatives at this scale. That question may look different at 471 cards with real
scrolling/pagination, which this prototype doesn't test (36 cards, no filters, no virtualization) —
flagging for #05 rather than answering it definitively.

**Owner's call — not made here, by design (this is a HITL ticket):** A vs. B. Once decided, delete
`src/prototypes/v4-cards-shape/`, `prototype-v4-cards-shape.html`, and `public/_prototype-04/`, and
record the choice + reasoning above this line before deleting.
