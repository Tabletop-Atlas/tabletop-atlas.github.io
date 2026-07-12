# v4 — the knowledge base — wayfinder map

Labels: wayfinder:map

## Destination

The app stops being *Adam's spirit recommender* and becomes **a Spirit Island knowledge base**
anyone can open on their phone:

1. **A Cards tab** — all 471 power / fear / event / blight cards, filtered by dropdown and
   multi-select controls (elements, cost, speed, type, expansion, terror level). No free-text
   search.
2. **It works on a phone.** Nothing breaks at 375px; the desktop layout the owner likes is
   untouched.
3. **It reads as a product, not a personal repo.** The real Spirit Island logo art instead of the
   text wordmark, and a Pages URL without the owner's name in it (free GitHub org route).

## Notes

- **The spec is [PRD.md](PRD.md)** — the destination written out in full (problem, user stories,
  implementation and testing decisions). This map is the route to it. Where the two disagree, a
  ticket's `## Comments` win: they record what was actually decided while walking it.
- **This map carries execution.** Like `asset-archive`, the destination is shipped code, not a
  spec. `task` tickets do the work; `research`/`grilling`/`prototype` tickets decide what the work
  is.
- **This repo fabricates when a source can't answer** (see CLAUDE.md — it has shipped five aspects
  that do not exist). A card's elements, cost or speed are **never read off a card image by a
  model**. They come from a machine-readable source or the field is absent. Every new dataset
  arrives with a tripwire test, as `aspectCanon.test.ts` and `startingCardsCanon.test.ts` did.
- **The image half is already done.** `.scratch/asset-archive/` finished 2026-07-12: 616 assets in
  `images/manifest.json`, including 101 minor, 78 major, 153 unique, 65 event, 50 fear, 24 blight —
  all webp. The browsable cards total ~13 MB, so hosting them is cheap. What the archive does
  **not** have is card *data*: the manifest is `{file, name, asset_type, spirit, source_url}` and
  nothing else. That gap is [#01](issues/01-where-card-data-comes-from.md).
- **Decision tickets gate build tickets.** #01, #03, #04 and #07 decide; #10–#14, #08 and #09 build.
  A build ticket re-decides nothing — it implements its blockers' answers. (The map's original
  coarse build tickets #02, #05 and #06 were retired on 2026-07-12 and re-cut as the vertical slices
  #10–#14.)
- **Rights:** hosting risk accepted by the owner (2026-07-09). Do not reopen.
- Tracker mechanics: tickets are `issues/NN-slug.md`. Claim by adding an `Assignee:` line **before**
  working. Frontier = open, unassigned, every ticket in its `## Blocked by` closed (`Status: done`).

## Decisions so far

<!-- one line per closed ticket -->

- **#01** — card data source is `oberien/spirit-island-card-katalog` (`src/types.ts` + `src/db.ts`,
  upstream of the compiled `cards.js`). All 471 cards join to the manifest by primary name, 0 misses.
  Elements/cost/speed/major-minor exist only on `PowerCard`; expansion exists on all 471. See
  [card-data-source.md](card-data-source.md).

## Not yet specified

- **What actually breaks on a phone, and how to fix it.** [#07](issues/07-responsive-audit.md) goes
  and looks; the fixes can't be ticketed until it reports. The nav shell is the suspected hard part
  — `AppShell`'s tabs were designed for one big surface and v4 adds a second.
- **The Cards tab's shape beyond filtering.** Sort order, empty state, deep-linking to a single
  card, whether a filtered set can be shared as a URL. Follows [#03](issues/03-the-filter-set.md).
- **Cross-links between spirits and cards.** A spirit's uniques already render in `SpiritDetail`;
  whether the Cards tab knows about spirits (or vice-versa) is a real question, but not one that can
  be answered before the Cards tab exists.
- **Element-threshold matching ("I have Sun+Fire, what can I play?").** The owner chose simple
  predicate filters for now. Whether the threshold matcher is wanted is judged after the simple one
  ships, not before.

## Out of scope

- **Browsing adversaries, scenarios, aspect cards and spirit panels.** They're in the archive, but
  the Cards tab covers powers + fear/event/blight (owner, 2026-07-12).
- **Free-text search.** The owner explicitly declined it: dropdowns and multi-selects only, because
  they're "more stable and robust than just the text."
- **Buying a custom domain.** The free GitHub-org route was chosen instead
  ([#09](issues/09-the-name-and-the-url.md)).
- **Rating or tiering cards.** The tier machinery is spirit-shaped and the sources are
  spirit-shaped. Ranking 471 cards would be this repo inventing data.
- **A phone-first rewrite** (bottom tab bar, sheets, full-screen viewer). The owner picked
  "responsive: nothing breaks" over a native-feeling shell.

## Not part of this map

`.scratch/v2/issues/17-terror-level-range.md` is still `ready-for-human` — the last open ticket from
v2. Everything else in v2, v3 and asset-archive is `done`.

```
decide                             build

01 card data ────────────┐
                         ├─ 11 powers end-to-end ─┬─ 12 power filters ─── 13 fear/event/blight
04 result shape ─────────┤                        │
10 prefactor: viewer ────┘   03 the filter set ───┘

07 responsive audit ──────── 14 the phone fixes

08 the logo art          (independent)
09 the name and the URL  (independent, HITL)
```

Frontier right now: **01**, **07**, **08**, **10** (AFK) and **09** (needs the owner).
