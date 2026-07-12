# 07 — What actually breaks at 375px

Status: done
Type: wayfinder:task (AFK)
Parent: [v4 map](../MAP.md)

## Question

The owner wants the app usable on a phone so his friends can open it. Before deciding a single fix:
go and look. Which parts of the app are actually broken at phone width, and how?

## Why this is a task and not a redesign

The owner chose **"responsive: nothing breaks"** over a phone-first rewrite. Desktop stays exactly as
it is. So the work is a list of breakages, not a new design — and the list has to come from driving
the real app, not from reading CSS and imagining.

## What to do

Drive the built app in a headless browser at **375×667** (and 390×844) through every surface:
questionnaire, recommender results, browser, tier board, tier editor, spirit detail modal, game log,
statistics, backup/import. For each, record: horizontal overflow, text under 12px, tap targets under
44px, controls that fall off-screen, modals that don't fit, tables that can't be read.

Screenshot each breakage. Note that v3 already verified `SpiritDetail`'s card modal at 375px, so
that one is expected to pass — if it doesn't, that's a regression worth flagging loudly.

## What this ticket produces

A findings list in `## Comments`, ordered worst-first, each with a screenshot. **No fixes.** The
fixes graduate out of the map's fog once the list exists — the nav shell in particular is likely to
need a real decision (`AppShell`'s tabs were designed for one big surface, and v4 adds a second), and
that decision is worth making with evidence rather than ahead of it.

## Comments

Installed `playwright` as a dev dependency (chromium only) and drove the production build
(`vite build` + `vite preview`) at 375×667 and 390×844 through all nine surfaces: wizard, recommender
results, browser, spirit detail modal, card-enlarge viewer, tier board, tier editor, backup/import,
game log + statistics. For each: measured `document.scrollWidth` vs viewport width, text under 12px,
tap targets under 44px, and elements whose right edge falls past the viewport, then screenshotted.
Kept `playwright` in `package.json` — #14 will need to verify its fixes the same way. Evidence
screenshots for the findings below are in [`screenshots-07/`](../screenshots-07/); the rest were
too large to be worth committing and weren't needed as evidence (no defect to point at).

Ordered worst first:

1. **Real horizontal overflow on the recommender results screen, from the wildcard/reroll box.**
   At 375px the document is 389px wide (`overflowX: true`) — the only surface where the *page itself*
   overflows, not just a cramped control. Root cause: `.deck-wild` (`src/deck.css`) is
   `grid-template-columns: auto 104px 1fr auto` — a fixed 104px thumbnail column plus two
   content-sized (`auto`) columns for the "Wildcard" tag and the "Reroll" button. Auto columns don't
   shrink below their content's min width, so on a 342px-wide content area the row's minimum width
   exceeds the viewport and the Reroll button clips off the right edge entirely (invisible, not just
   tight). At 390px it doesn't overflow the page, but the Reroll button is jammed against the edge
   and the description text wraps into an unreadably narrow column (see
   `recommender_results_375x667.png`, `recommender_results_390x844.png`). This is the one item here
   that's a page-level bug, not just a cramped-but-usable control — worth prioritizing first.

2. **Spirit detail modal: the close button overlaps the spirit's name, and the name is clipped.**
   `.spirit-detail-head` lays out the art and a text column side by side with no width reserved for
   `.modal-close` (which is `position: absolute; top/right`), so a long spirit name runs straight
   under the × button and gets cut off mid-word at both 375px (`"A SPREAD O"`) and 390px
   (`"RAMPANT GREE"`, with the × sitting directly on top of the last visible letters). See
   `spirit_detail_modal_375x667.png` and `spirit_detail_modal_390x844.png`. Not the same component
   the ticket flagged as a regression risk — that's the click-to-enlarge card viewer (#10's
   `CardViewer`), checked separately below and it's fine. This is the modal's own header layout, and
   it was never phone-verified before now.

3. **Tier board: spirit names render at 8–8.8px and several are truncated mid-word** (e.g. "A Spread
   of Rampant Gre…", "Fractured Days Split th…") — see `tier_board_375x667.png`. The board itself is
   structurally fine at 375px (2-per-row grid, tier-colored side bars, no overflow) — this isn't the
   "completely invisible" failure v3 shipped once, it's a readability problem: the captions are
   genuinely too small to read comfortably, not just tight.

4. **Systemic: the five primary nav buttons (Recommend/Browse/Tier list/Customise tiers/Log) are
   36px tall**, under the 44px tap-target guideline, on every single surface. Not a break — nothing
   overflows or is unreachable, they're full-width (342px) and easy to hit with a fingertip in
   practice — but it's the one finding that shows up everywhere, so worth a mention if the nav shell
   gets touched for other reasons.

5. **Minor: filter control labels and `<select>` text render at 10–11px** in the Browser tab's
   Expansion/Complexity/Tag filters and the Tier board's Player count/Filter by type controls.
   Legible but below the stated 12px floor. Low priority — no truncation, no overflow, just small.

6. **Cosmetic: a ~90px dead gap between the collapsed sidebar nav and the main content** on the
   wizard screen in the stacked mobile layout (`wizard_step0_375x667.png`) — spacing, not breakage.

**Confirmed no regression**: the click-to-enlarge card viewer (#10's `CardViewer`, opened from a
spirit detail modal's panel image) fits cleanly inside the 375px viewport with no overflow — see
`card_enlarge_viewer_375.png`. v3's prior verification of this surface still holds.

**Not investigated here** (out of this ticket's scope, per its own instructions — no fixes): the
`AppShell` nav shell decision the map's "Not yet specified" section calls out. What was learned that
bears on it: the sidebar already collapses to a stacked, full-width layout below 900px
(`@media (max-width: 900px)` in `deck.css`, pre-existing), and it holds up fine visually at both
tested widths — the five findings above are all *inside* the main content, not the nav shell itself.
Whatever #14 decides for the second tab (Cards) can most likely build on the existing collapse
rather than redesigning it.
