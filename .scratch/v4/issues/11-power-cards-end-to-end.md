# 11 — Power cards, end to end, unfiltered

Status: done
Type: wayfinder:task (AFK)
Parent: [v4 map](../MAP.md) · Spec: [PRD.md](../PRD.md)

## What to build

The first complete path: a **Cards** tab that lists every power card in the game and enlarges one
when you tap it. No filters yet — this ticket proves the data, the images, the tests and the UI all
join up before any filtering is layered on.

332 power cards: 101 minor, 78 major, 153 unique. Their data comes from the source #01 established,
extracted by a **committed script** so it can be re-run and audited — never by a model reading a card
image. A field the source cannot supply is **absent**, not estimated. This is the rule CLAUDE.md
exists to enforce and this repo has already broken three times.

## Acceptance criteria

- [ ] A script in the repo derives the power-card dataset from the source; re-running it reproduces
      the committed data
- [ ] The dataset lives alongside the existing spirit and adversary data, follows the same
      conventions (absent key = the source never said; provenance recorded on the data), and models
      card types as a discriminated union rather than one wide interface of optionals
- [ ] `cardCanon.test.ts` pins the counts — 101 minor, 78 major, 153 unique — and spot-pins the
      fields of a handful of cards a human checked against the printed card. It fails loudly if a
      count moves
- [ ] The card webps are served from `public/`, reconciled with the starting cards already there (a
      starting card **is** a unique power — do not ship a second copy under a second name)
- [ ] Filenames resolve from the dataset by rule, not via a lookup table
- [ ] The existing asset-existence check covers cards: every card in the dataset resolves to an image
      that exists
- [ ] A **Cards** entry in the nav opens a tab listing all 332, in the shape #04's prototype chose
- [ ] A unique power shows which spirit it belongs to
- [ ] Tapping a card opens the viewer from #10
- [ ] Images load lazily — opening the tab does not pull every image at once
- [ ] Verified in a real headless browser at 375px **and** desktop width. Tests passing is not
      evidence the tab is visible; v3 proved that

## Blocked by

- [01 — Where card data comes from](01-where-card-data-comes-from.md)
- [04 — What a filtered result looks like, at 375px](04-result-shape-prototype.md)
- [10 — Prefactor: a reusable card viewer](10-prefactor-reusable-card-viewer.md)

## Comments

`scripts/extract-power-cards.mjs` fetches `sick.oberien.de/cards.js` fresh each run, executes it in
a sandboxed Node `vm` (same technique #01 used for research — required explicit owner sign-off this
session since Claude Code's auto-mode classifier gates executing fetched third-party JS), filters
`PowerCard` instances, and joins each to `images/manifest.json` by name (the same perfect 471/471
join #01 already proved) to get its filename and, for uniques, its spirit slug. Output:
`src/data/power-cards.json`, 332 cards, re-run reproduces it byte-for-byte since the upstream source
is static card data. Re-running printed `101 minor / 78 major / 153 unique` — exact match to #01's
counts.

`PowerCard` in `src/domain/types.ts` is a discriminated union on `kind: 'minor' | 'major' | 'unique'`;
only `unique` carries `spirit`/`spiritName`. No optional-everything interface.

Image filenames resolve by rule, not a lookup table: minor/major go to `cards/{minor,major}/<file
basename from the manifest join>`; uniques check whether their name is in that spirit's
`startingCards` (already-committed data) — if so the image is `cards/<spiritId>-<index>.webp`,
reusing the already-committed starting-card art already in `public/` rather than copying a second
file under a second name; the 5 uniques with no starting-card slot (extra unique innates found on
Finder of Paths Unseen, Dances Up Earthquakes, Many Minds Move as One) copy fresh from
`images/spirits/<id>/unique_*.webp` to `public/cards/unique/`. All 332 resolved paths verified to
exist on disk (`cardCanon.test.ts`'s asset-existence check, same pattern as `dataIntegrity.test.ts`).

`cardCanon.test.ts`: pins the 101/78/153/332 counts, and spot-checks 8 cards' cost/speed/elements/
spirit against the fixture #04 built and visually cross-checked against real card art via Playwright
screenshots during prototype judging — an independent source, not this ticket's own extraction
output, so the check isn't circular.

UI: `CardsTab` (nav entry "Cards") renders all 332 (sorted by name, unfiltered — #12's job), switchable
between `CardGrid` (#04 variant A) and `CardRows` (#04 variant B, real element icons copied from
`public/_prototype-04/elements/` to `public/elements/`), both reusing `CardViewer` (#10) for
tap-to-enlarge. Images use native `loading="lazy"`.

Verified with Playwright against the production build (`vite build` + `vite preview`) at 375×667 and
1440×900: 332 tiles/rows render in both views at both widths, zero horizontal overflow, enlarge
opens and closes, a unique row shows its spirit name. `tsc -b`, the full suite (251/251, up from 246),
and `vite build` all clean.

**Not done here (explicitly out of scope for #11):** filtering (#12), fear/event/blight (#13), and
whether variant A also gets element-icon overlays (#04 flagged, still open for whoever picks up #12).
