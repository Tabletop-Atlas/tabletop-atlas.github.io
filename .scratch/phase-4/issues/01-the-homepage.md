# 01 — The homepage

Status: done
Type: wayfinder:grilling (HITL)
Parent: [phase-4 map](../MAP.md)

## Blocked by

_(nothing)_

## Question

What is the homepage — its content, how it frames the app's purpose, and what it links to?

There is no homepage today: `App.tsx` boots straight into the Recommend tab, which is also pinned
first in nav. Two owner calls are already locked and shape this ticket: the Spirit Island logo
becomes clickable → homepage, and "Recommended" loses its pinned top spot. The current nav is
Recommend / Browse / Archive / Tier list / Customise tiers / Log.

Things the grilling should pin down:

- **Purpose framing.** The audience is broad — gamers who know Spirit Island and non-gamers who
  don't. Does the homepage explain the game, the app, or both? What does a first-time visitor do
  next?
- **What it links to.** Which surfaces get top billing, and does the homepage replace Recommend as
  the default view?
- **Its relationship to nav.** Is "home" a nav tab, or reachable only via the logo?

Interactions, not blockers: [#02](02-the-settings-tab.md) may change what tabs exist, and
[#08](08-the-recommenders-short-term-shape.md) may change what the recommender entry point looks
like. Decide the homepage top-down; where its links depend on those outcomes, record the
requirement ("links to whatever #08 produces") and let
[#09](09-assemble-the-phase-4-spec.md) reconcile.

## Comments

**Resolution (2026-07-13, grilled with the owner — seven decisions, all owner's calls):**

1. **Job: orientation + router.** A mostly-static welcome that frames the app and routes by
   intent. Explicitly not a dashboard and not a hybrid — nothing on the homepage may go stale.
2. **Boot: every visit starts on the homepage.** No first-visit-only flag, no last-tab
   persistence. This completes the locked "Recommended loses its pinned top spot" call: Recommend
   stops being the default view.
3. **Nav seat: none.** The clickable logo (locked call) is the only route home. No Home nav
   button. While on the homepage, no nav item shows active.
4. **Doors: three, intent-phrased.** "Explore every spirit → Browse", "Not sure what to play? →
   Recommend", "How do they rank? → Tier list". Archive, Log, and Settings are nav-only — the
   doors are guidance, not a second sitemap.
5. **Top billing: Browse leads** — first door and first nav button; Recommend slots second in
   nav. Full nav order is finalized at spec assembly
   ([#09](09-assemble-the-phase-4-spec.md)), once [#02](02-the-settings-tab.md) settles which
   tabs exist.
6. **Framing text: one line each + footer slot.** One sentence on the game (linking out to the
   official site), one on the app as an unofficial fan-made companion. A reserved footer line for
   the fan-content disclaimer — exact wording contingent on
   [#05](05-official-assets-and-licensing.md)'s licensing findings.
7. **Visuals: art-backed door tiles, current styling.** Door tiles use spirit art the app already
   hosts; no hero treatment, no new aesthetic calls. The floral/island theming overhaul stays fog
   and restyles the homepage app-wide when it lands.

Contingencies recorded for [#09](09-assemble-the-phase-4-spec.md): final nav order (#02), footer
disclaimer wording (#05).
