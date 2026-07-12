# 14 — The phone fixes

Status: done
Type: wayfinder:task (AFK)
Parent: [v4 map](../MAP.md) · Spec: [PRD.md](../PRD.md)

## What to build

The owner wants to hand his phone across the table to a friend. Fix what [#07](07-responsive-audit.md)
actually found, worst-first — not what a CSS file suggests might be wrong.

**Desktop is untouched.** The owner chose "nothing breaks at 375px" over a phone-first shell, and he
likes the command deck exactly as it is. Every fix is checked at desktop width too, and a fix that
costs the desktop layout is not a fix.

The nav is the suspected hard part: the app shell is a persistent sidebar built when there was one
big surface, and v4 adds a second. If #07's findings force a real decision there rather than a
tweak, **stop and raise it** — that is a design question, and this ticket does not have the standing
to answer it alone.

## Acceptance criteria

- [ ] Every finding from #07 is either fixed or explicitly closed with a reason
- [ ] No horizontal scrolling on any surface at 375×667 and 390×844
- [ ] Every tab is reachable
- [ ] Modals — spirit detail, card viewer — fit on screen and dismiss
- [ ] Tap targets are big enough to hit
- [ ] The desktop layout is unchanged, checked side by side, not assumed
- [ ] Verified with real screenshots at both widths, before and after

## Blocked by

- [07 — What actually breaks at 375px](07-responsive-audit.md) — done, this ticket builds on its
  findings.

## Comments

The nav shell was **not** the hard part — #07 already established it collapses cleanly below 900px
(pre-existing `@media (max-width: 900px)` in `deck.css`), so no design question needed raising. All
four fixable findings turned out to be scoped, mobile-only CSS changes inside that same media query;
nothing here touches desktop's unconditional rules.

**Fixed**, worst-first:

1. **Wildcard/reroll overflow (finding 1).** `.deck-wild` switches to a single stacked column
   (`grid-template-columns: 1fr`) inside the existing `@media (max-width: 900px)` block, instead of
   its desktop 4-column `auto 104px 1fr auto` grid. Verified: `document.scrollWidth` now equals
   viewport width at both 375 and 390 (`overflowX: false`, was `true`), and the Reroll button's
   bounding box is fully on-screen at both. Desktop's 4-column row is byte-for-byte unchanged (own
   screenshot, `.deck-wild` box still 1112px wide across the 3 result columns).
2. **Modal close button overlapping the spirit name (finding 2).** `.spirit-detail-head h2` gets
   `padding-right: 2rem` — enough to clear `.modal-close`'s absolute-positioned 32px circle — so a
   long name wraps onto multiple lines instead of running under the button. Verified at both widths:
   "A Spread of Rampant Green" now wraps cleanly to 3 lines with no glyph under the ×. The 2rem
   padding is negligible against the modal's 640px max-width, so desktop is visually unaffected.
3. **Tier board captions unreadable (finding 3).** Inside the same mobile media query, `.tier-tile`
   widens from 116px to 150px (2 still fit per row, confirmed by content-width arithmetic and by
   screenshot) and caption font-size goes from 0.55rem/0.5rem (8.8px/8px) to 0.7rem/0.62rem
   (11.2px/9.9px). Still ellipsis-truncates on genuinely long names (e.g. "Keeper of the Forbidde…")
   — the fix is legibility, not eliminating truncation, which would need either wider tiles than fit
   two-per-row or a one-per-row layout neither #07 nor the owner asked for. Desktop's 116px tiles and
   0.55rem/0.5rem captions are untouched (own screenshot matches the pre-fix desktop layout exactly).
4. **Nav buttons under the 44px tap-target guideline (finding 4).** `.deck-nav button` padding goes
   from `0.5rem 0.7rem` to `0.85rem 0.7rem`, mobile-only. Measured height: 36px → 46.7px at both
   375 and 390. Desktop's button height measured unchanged at 35.5px.

**Explicitly closed, not fixed:**

5. **10–11px filter labels (finding 5).** Legible, no truncation, no overflow — genuinely cosmetic.
   Fixing it would mean touching `Browser.tsx`'s and `TierBoard.tsx`'s filter-label styles, which
   are shared with desktop's denser layout; the risk of that ripple outweighs a font a point or two
   larger. Left as-is; revisit only if a human finds it hard to read in practice.
6. **~90px dead gap above the wizard content (finding 6).** Confirmed cosmetic only — no element is
   unreachable or clipped, it's spacing. Not worth a special-case rule for one screen.

**Acceptance criteria status:**

- [x] Every finding from #07 is either fixed or explicitly closed with a reason (above)
- [x] No horizontal scrolling on any surface at 375×667 and 390×844 — re-verified programmatically
      (`overflowX: false` on every surface checked) after the fixes
- [x] Every tab is reachable — unchanged, #07 found no reachability problem
- [x] Modals — spirit detail, card viewer — fit on screen and dismiss — re-verified; card viewer had
      no regression per #07, spirit detail modal's overlap is now fixed
- [x] Tap targets are big enough to hit — nav buttons now ≥44px on mobile; the other tap-target-ish
      findings (filter selects, "Show aspects" buttons) were not flagged as broken, only small, and
      were not touched
- [x] The desktop layout is unchanged, checked side by side, not assumed — screenshotted at 1440px
      before relying on it; `.deck-wild`, nav button height and `.tier-tile` all measured identical
- [x] Verified with real screenshots at both widths, before and after — `screenshots-07/` (before) and
      [`screenshots-14/`](../screenshots-14/) (after)

Full test suite (246/246), `tsc -b` and `vite build` all clean.
