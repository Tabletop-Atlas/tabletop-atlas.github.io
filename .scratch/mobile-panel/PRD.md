# PRD — Mobile panel: a phone-legible layout for the command deck

Status: ready-for-agent
Assembled: 2026-07-21 (from a grill-with-docs session; single-session build, no ticket split)

## Problem Statement

On a phone, the app doesn't feel like a website — it feels like a desktop layout squeezed onto a
small screen. The specific, owner-named culprit is the **navigation menu panel** (Browse, Recommend,
Archive, Dashboard, Tier list, Log, Settings): on wide screens it is the left sidebar of the
"command deck", but below `900px` the two-column grid collapses to one column and the whole sidebar
— logo, all seven nav buttons stacked vertically, plus any tab-specific controls — renders
**full-width at the top of the page**. The visitor must scroll past the entire menu before reaching
any content. It reads as clutter and "takes a big chunk of the website".

Secondarily, the **Dashboard plots** are not adjusted for a phone. The worst is the **element-set
UpSet matrix** (`DeckUpset`): a wide grid of one narrow column per element combination that can only
be read by scrubbing sideways. The other Dashboard visualizations (`DeckFacets`, `DeckGapOdds`,
`FearImpactView`, `EventValenceView`) are legible but not tuned for narrow widths.

## Solution

Introduce a dedicated **phone treatment** at a new `≤640px` breakpoint. The desktop command deck is
untouched.

1. **Navigation becomes a sticky top bar + slide-out drawer.** A thin bar pinned to the top holds
   the logo (still the only route home) and a hamburger toggle. The seven nav items live in a
   drawer that slides in on tap and closes on selection or backdrop tap. The menu is out of the
   scroll flow, so content is the first thing the visitor sees.
2. **The Recommend controls ("Your answers") become a collapsible disclosure** at the top of the
   Recommend main pane, collapsed by default, so the recommendations are visible first and the
   tweak-an-answer → watch-the-results loop survives without an overlay hiding the results.
3. **The Dashboard plots get a phone pass.** The UpSet matrix gets a bespoke mobile fallback: the
   per-element totals bars show by default with a "show full matrix" escape hatch that reveals the
   existing scroll view. The other four plots get spacing / min-width / contained-scroll
   adjustments so they read at ~390px.

## User Stories

1. As a phone visitor, I want the page to open on content rather than a wall of menu buttons, so
   that the app feels like a website instead of a shrunken desktop layout.
2. As a phone visitor, I want the navigation tucked into a top bar, so that it takes a thin strip
   rather than a big chunk of the screen.
3. As a phone visitor, I want to tap a hamburger to open the navigation, so that I can reach any
   tab without the menu occupying the page while I read.
4. As a phone visitor, I want the drawer to close when I pick a destination, so that I land on the
   chosen tab's content immediately.
5. As a phone visitor, I want to close the drawer by tapping the backdrop, so that I can dismiss it
   without making a choice.
6. As a phone visitor, I want the top bar to stay pinned as I scroll, so that navigation is always
   one tap away.
7. As a phone visitor, I want the logo in the top bar to still take me home, so that the one route
   home (the logo) is preserved on mobile.
8. As a phone visitor using a screen reader, I want the hamburger toggle to announce its
   expanded/collapsed state and what it controls, so that the drawer is operable without sight.
9. As a phone visitor using a screen reader or a slow connection, I want the nav destinations to be
   present in the page even when the drawer is closed, so that navigation is never missing from the
   rendered markup.
10. As a phone visitor on the Recommend tab, I want "Your answers" collapsed above the results by
    default, so that I see recommendations first rather than a stack of dropdowns.
11. As a phone visitor on the Recommend tab, I want to expand "Your answers", change an answer, and
    collapse it again to watch the shortlist react, so that the live-tuning interaction still works
    on a phone.
12. As a phone visitor on the Dashboard, I want the element-set breakdown to show the per-element
    totals by default, so that I get the headline read without scrubbing a wide matrix sideways.
13. As a phone visitor who wants the full detail, I want a "show full matrix" control, so that the
    complete UpSet view is still reachable when I choose it.
14. As a phone visitor on the Dashboard, I want the Facets, element-gap odds, fear-impact and
    event-valence plots to be legible at my screen width, so that the whole Dashboard is usable on a
    phone.
15. As a desktop visitor, I want the command deck sidebar and its live-tuning interaction unchanged,
    so that nothing I rely on regresses.
16. As a tablet visitor in the 640–900px band, I want the current single-column behaviour preserved,
    so that the change is scoped to phones and does not surprise mid-size screens.
17. As a maintainer, I want the phone treatment gated behind one documented breakpoint, so that the
    mobile rules are easy to find and reason about.

## Implementation Decisions

- **Breakpoint.** A new `≤640px` (phone) breakpoint drives the entire mobile treatment. The existing
  `max-width: 900px` rules that collapse the grid and enlarge tap targets stay as they are for the
  640–900px band. Wide desktop is unchanged. Record the phone breakpoint value as a single source of
  truth (a CSS custom property or a shared constant), not a magic number repeated across rules.
- **`AppShell` is where nav restructures.** The `.deck` grid + `.deck-side` aside currently host
  brand, nav and the `side` slot. On phone, `AppShell` renders a sticky top bar (logo + hamburger)
  and moves the nav list into a drawer element. The drawer holds only the seven nav items; the
  `side` slot (tab-specific controls) does **not** go into the drawer.
- **Drawer is CSS-off-canvas, never unmounted.** The nav list is always in the DOM. A closed drawer
  is translated off-screen / hidden via CSS class, not conditionally rendered. This keeps the nav
  destinations in the server-rendered markup (a11y, SSR) and preserves the existing smoke contract
  that asserts the exact nav label list.
- **Drawer open/close is local UI state** in `AppShell` (e.g. a `useState` boolean), toggled by the
  hamburger, cleared on nav selection and on backdrop click. No new store, no new domain module.
- **The logo remains the only route home** on mobile, matching the existing decision (#01 decision
  3): there is no Home nav button, and no nav item shows active while home is current.
- **Accessibility of the toggle.** The hamburger carries `aria-expanded`, `aria-controls` pointing at
  the drawer, and an accessible label. The drawer is labelled as a navigation landmark.
- **Recommend "Your answers" on phone.** `RecommenderSide` renders into a collapsible disclosure at
  the top of `RecommenderMain` on phone widths, collapsed by default. On desktop it stays in the
  sidebar `side` slot exactly as today. The disclosure must not change the questionnaire gating: the
  controls still do not appear until the questionnaire is complete (existing behaviour asserted by
  the "hides the live controls until the questionnaire is done" smoke test).
- **UpSet plot mobile fallback (`DeckUpset` / `DashboardTab`).** On phone, the per-element totals
  bars are the default view and the wide matrix is hidden behind a "show full matrix" toggle that
  reveals the existing `.deck-upset-scroll` matrix. **Both representations render in the DOM**; the
  matrix is gated by a CSS class / local toggle state, not unmounted, so the existing smoke
  assertions that look for `deck-upset-grid` / `deck-upset-dot` still find them. Prefer reusing the
  existing per-element totals rendering (the pool-breakdown bars) over inventing a new chart.
- **Other Dashboard plots.** `DeckFacets`, `DeckGapOdds`, `FearImpactView`, `EventValenceView` get
  phone-width adjustments only (spacing, `min-width` relaxation, contained horizontal scroll where a
  block genuinely can't reflow). No structural rework, no data changes.
- **Existing smoke assertions get updated, not bypassed.** Assertions that slice `deck-nav` / `<nav>`,
  check `aria-label="Home"`, or pin the exact nav label list are updated to match the new markup
  while still asserting the same invariants (logo-is-home, exactly the seven labels present).
- **No `CONTEXT.md` or ADR changes.** Everything here is UI/implementation vocabulary and reversible
  layout decisions; nothing belongs in the domain glossary and no decision meets the ADR bar
  (hard-to-reverse + surprising + real trade-off).

## Testing Decisions

- **A good test here asserts external behaviour, not layout.** For this feature the externally
  observable, tool-checkable facts are *markup invariants* (what is present in the rendered DOM,
  what ARIA it carries, what starts collapsed). Pixel-level responsive behaviour (does the drawer
  actually slide, does the grid reflow at 390px) is verified visually, not asserted in code — this
  matches the repo's standing rule that the UI is glue over the domain seams and is not unit-tested
  (`appSmoke.test.tsx` header comment).
- **Seam 1 — the existing `appSmoke` static-render seam** (`renderToStaticMarkup`, no DOM/localStorage).
  Extend it to assert:
  - the top-bar hamburger toggle renders with `aria-expanded`, `aria-controls`, and an accessible
    label;
  - the seven nav destinations are present in the markup with the drawer in its default (closed)
    state — i.e. the nav is rendered-but-off-canvas, not absent;
  - the logo-is-home invariant and the exact seven-label list still hold (updated slices, same
    invariants);
  - the UpSet fallback: both the per-element totals markup and the matrix markup are present, with
    the matrix in its default-hidden state on the mobile path.
  Prior art: every assertion style already in `appSmoke.test.tsx` — nav-label slicing, `aria-label`
  checks, `deck-upset-grid` / `deck-upset-dot` presence checks, "hides the live controls until the
  questionnaire is done" for gated rendering.
- **Seam 2 — a Playwright screenshot script at a phone viewport (~390px).** The responsive truth —
  drawer open/closed, top-bar stickiness, plot legibility — is captured as screenshots for human
  review, following the existing `.scratch/*/…_screenshots.mjs` scripts (theme, chip, modal,
  ornament). This is verification, not an automated assertion.
- **No new test dependency.** jsdom / testing-library are deliberately absent and stay absent;
  drawer interaction is not unit-tested.
- **Modules touched by tests:** `appSmoke.test.tsx` (extended). No domain-seam tests change, because
  no domain logic changes.

## Out of Scope

- Any change to the **desktop** command-deck layout or its live-tuning interaction (owner scoped
  this mobile-only).
- The **tier board** mobile treatment — borderline, not broken; its own future task.
- A **bottom tab bar** or **pull-up bottom sheet** — considered and rejected in favour of the
  top-bar + drawer and the in-pane disclosure.
- The 640–900px **tablet** band — its current single-column behaviour is deliberately preserved.
- Any **data**, rating, or domain-model change.
- Introducing jsdom / a DOM-interaction test layer.

## Further Notes

- The failure mode CLAUDE.md warns about (inventing data) does not apply here — this effort touches
  layout and markup only, no dataset. The relevant discipline instead is **not regressing the
  documented UI contracts**: the logo-is-home rule, the exact nav label set, the questionnaire
  gating of the live controls, and the Dashboard smoke assertions.
- The drawer and disclosure both follow the same principle that resolved the core complaint: get
  chrome (nav) and controls (knobs) *out of the content's scroll flow* on a phone, each into the
  place that fits its job — nav into an overlay it's fine to hide, controls into the pane whose
  content they drive.
