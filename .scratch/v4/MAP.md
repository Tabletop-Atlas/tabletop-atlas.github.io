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
- **#08** — real logo art found at `spiritislandwiki.com`'s own site logo (`Spirit-Island-Logo.png`,
  a clean crop of the box-cover wordmark), not in the TTS mod JSON. Swapped into `AppShell`'s
  `.deck-brand`, capped at `max-width: 232px` so it scales with the sidebar. Verified at 375/390px
  by #07's audit — holds. **Correction (owner, 2026-07-12):** the source PNG's background was
  opaque white, not transparent as first recorded — showed as a visible white box in the sidebar.
  Fixed by flood-filling the background transparent; `cwebp` silently drops alpha unless told
  `-alpha_q 100`, worth remembering for future conversions in this repo.
- **#07** — audited all nine surfaces at 375×667/390×844 with Playwright. Worst finding: the
  recommender results' wildcard/reroll box (`.deck-wild`'s fixed-plus-auto grid columns) genuinely
  overflows the page at 375px. Also found: the spirit detail modal's close button overlaps a long
  spirit name; tier board captions render at 8–8.8px and truncate. The nav shell itself is **not**
  the hard part — it already collapses cleanly below 900px; every finding is inside the main content.
  No fixes made (by design). Full list in [issues/07](issues/07-responsive-audit.md#comments).
- **#10** — card viewer lifted into standalone `CardViewer.tsx`. Verified with no regression by #07's
  audit (real Chromium, 375px).
- **#14** — fixed all four fixable findings from #07 (wildcard overflow, modal close-button overlap,
  tiny tier captions, sub-44px nav buttons), all confined to the existing mobile media query. Two
  findings (small filter labels, a cosmetic spacing gap) explicitly closed, not fixed — see
  [issues/14](issues/14-the-phone-fixes.md#comments) for why. Desktop measured pixel-identical
  before/after. `playwright` is now a dev dependency for this kind of verification going forward.
- **#04 — owner's decision: both.** Not A vs. B — the image grid and compact rows answer different
  needs (visual recognition vs. fast scanning) and neither replaces the other. #11/#12 build a
  switchable view, not a single layout. Also: variant B's element glyphs are the real in-game icons
  (`spiritislandwiki.com`'s `Esun.png` etc., archived to `images/elements/`), not emoji — requested
  after judging the prototype. Prototype code kept (not deleted) as a starting point for #11/#12.
  See [issues/04](issues/04-result-shape-prototype.md#comments).
- **#09** — owner named the org `Tabletop-Atlas` (deliberately generic, not Spirit-Island-specific —
  the owner's stated plan is other games under the same umbrella later). Live at
  `https://tabletop-atlas.github.io/`, verified against the real deployed site: `vite.config.ts`'s
  `base` is `/`, title is "Spirit Island Knowledge Base", git remote updated. One correction to the
  ticket's own assumption: the old repo URL redirects, but the old **Pages** URL does not — it 404s,
  since Pages sites don't inherit a repo-transfer redirect the way repo URLs do.

- **#11** — power-card dataset (332: 101 minor / 78 major / 153 unique) extracted by a committed,
  re-runnable script (`scripts/extract-power-cards.mjs`) from #01's source, joined to the manifest by
  name. Discriminated-union `PowerCard` type, `cardCanon.test.ts` tripwire pinned against an
  independent source (#04's fixture). New **Cards** nav tab ships both of #04's result shapes
  (grid/rows, switchable), reusing #10's `CardViewer`. Verified in real Chromium at 375px and
  desktop against a production build — 332 tiles/rows, no overflow. See
  [issues/11](issues/11-power-cards-end-to-end.md#comments).

## Not yet specified

- **Whether variant A (the image grid) also gets element icon overlays**, or keeps to card art only
  — #04 raised this, deferred to whoever picks up #11.
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

Frontier right now: **03** (needs the owner — the filter set's semantics) and **12** (power filters,
AFK, blocked on 03). #01/#04/#07/#08/#09/#10/#11/#14 are all done.
