# 03 — Ship the winner

Status: done
Label: wayfinder:task (AFK once the pick exists)
Parent: [Panel theming map](../MAP.md) · [PRD](../PRD.md)

## Blocked by

- [02 the modal variant round](02-the-modal-variant-round.md) — needs the owner's pick.

## Question

None to decide — this is the map's execution override: rewrite the picked treatment properly
(prod component/CSS, colours in the `tagColors.ts` home where they're a palette, any new pure
logic at a domain seam with tests), delete the round scaffolding and `?panel=` gate, verify on
the production build at 375px + desktop, keep a SHIPPED screenshot, close with a resolution
comment per the house pattern. Apply any reaction notes the pick carried (the #22 "font size
feels small" precedent). The two-axis code review runs before the commit.

Resolution = what shipped and where, linked screenshot, test count.

## Acceptance criteria

- [x] The picked treatment is the modal's default look; `?panel=` is inert and the round
      scaffolding is deleted
- [x] The palette lives in the colour home; the collision test pins it apart from the
      expansion, tag, kind/speed, and band palettes
- [x] App smoke asserts the treatment renders and the OCFDU truth rules survive it
- [x] The pick's reaction notes are applied (the #22 "sized up" precedent)
- [x] Production build verified at 375px + desktop; SHIPPED screenshot kept; two-axis code
      review applied before the commit

## Comments

**Shipped (2026-07-13). Owner picked C** — dark translation of the panel palette, keeping #23's
vertical OCFDU bars retinted. No reaction notes carried (just "I like C"), so nothing to size up.

**What shipped, and where:**

- **The palette lives in the colour home.** `PANEL_COLOR` in `src/components/tagColors.ts` — six
  values traced to the [vibe sheet](../panel-vibe-sheet.md): `text`/`accent` sampled
  (parchment `#e7d19c`, band-tan `#d2b068`), the umber `surface`/`raised`/`edge` the sheet's
  proposed dark-translations. It's the modal's one colour source: injected as `--panel-*` CSS
  custom properties on the modal root (`SpiritDetail`), consumed by the `.modal.spirit-detail`
  rules in `deck.css` — the same colour-from-map + CSS-shape-class idiom the chip systems use.
- **Cascade hazard handled.** The shipped rules are prefixed `.modal.spirit-detail` (two classes)
  so they beat the base `.modal` / `.spirit-detail-head h2` / `.deck-main h3` rules by
  specificity, not source order — the equal-specificity `font:`/`color`-shorthand trap phase-4
  hit can't bite.
- **Round scaffolding deleted.** `PanelRound.tsx` gone; `?panel=` is inert (nothing reads it —
  verified: `?panel=A` renders no switcher and is byte-identical to the default); the A/B node
  CSS and the `--pnl-*` variant tokens are removed. The modal now wears C by default.
- **Collision test.** `cardChipColors.test.ts` gained a `panel treatment palette` block pinning
  all six `PANEL_COLOR` values pairwise-distinct and byte-for-byte apart from the tier, expansion,
  tag, kind/speed, and scenario-band palettes (tier enumerated via `tierColor(0..6)` since its
  palette is module-private — PRD story 17 names tier).
- **App smoke.** A new assertion renders the shipped modal and checks the panel palette is
  present (`--panel-surface:#241d12`, `--panel-accent:#d2b068`) with no `panel-switcher`; the
  existing #11/#23 clamp assertions (a transcribed 6 shows `6` over a `height:100%` bar) still
  pass unchanged — the OCFDU truth rules survive the retheme.
- **Bonus fix (the #02 round note):** the pre-existing 375px head clip — a long spirit name
  running past the modal edge beside the fixed-200px art, present in the baseline too — is fixed
  by stacking `.spirit-detail-head` (art over full-width name) below 480px. Not caused by the
  theme; fixed while the modal was in hand.

**Verification:** production build, Playwright at 375px + 1280px. Shipped treatment renders on
both; page-x-overflow measured **0** in every state; `?panel=A` confirmed inert. SHIPPED
screenshots in [`../screenshots-02/`](../screenshots-02/) (`SHIPPED-375.png`, `SHIPPED-1280.png`).
**384 tests pass** (was 381: +2 collision/palette in `cardChipColors.test.ts`, +1 treatment
smoke).

**Two-axis code review run before the commit; fixes applied:**

- *Standards (data honesty, CLAUDE.md):* `PANEL_COLOR.body #c8b78f` was mislabelled "sampled" — it
  is the vibe sheet's proposed dark-translation of the ink-soft brown, not a sampled hex.
  Relabelled `body`/`surface`/`raised`/`edge` as proposed dark-translations; only `text`/`accent`
  are sampled. A judgment value no longer reads as sampled data.
- *Spec (PRD story 17):* the collision test named tier in its intent but only checked expansion/
  tag/kind-speed/band — tier added to the pinned set (enumerated via `tierColor`), so the claim
  is now enforced, not just asserted.
- *Standards (nit):* dropped a redundant `CSSProperties` annotation on `PANEL_VARS` (the `as`
  cast is the load-bearing one).
- *Cross-axis note:* the ≤480px head-stack fix was flagged as possible scope creep by Standards
  but confirmed **in-scope** by Spec — #02's round note explicitly delegated the pre-existing
  clip fix to "#03 or its own nit". Kept.

**Carried forward, not solved:** the tier chip's dark-tuned bright yellow is a touch loud even on
the umber surface (visible top of the screenshots) — C is dark so it stays legible, unlike the
light-A tension, so no chip-adaptation ticket is owed. The spread question is ticket
[04](04-the-spread-verdict.md).
