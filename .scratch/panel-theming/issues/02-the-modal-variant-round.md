# 02 — The modal variant round 🎨

Status: done
Label: wayfinder:prototype (HITL — the owner picks)
Parent: [Panel theming map](../MAP.md) · [PRD](../PRD.md)

## Blocked by

- [01 the panel vibe sheet](01-panel-vibe-sheet.md) — variants are built from its sampled
  palette, not guesses.

## Question

Which panel-aligned treatment does the owner want for the spirit detail modal?

Build three coherent compositions on the REAL modal, gated on `?panel=A|B|C` (the #20–#22
pattern: floating switcher, byte-identical without the param, production build):

- **A — light parchment + nodes:** the modal becomes a light parchment card over the dark app;
  OCFDU renders as five panel-style nodes carrying the true figures.
- **B — dark translation + nodes:** panel palette translated into the dark theme (umber/tan
  surfaces, parchment text); same node treatment.
- **C — dark + retinted bars (anchor):** the conservative composition — #23's vertical bars
  kept, retinted to the sampled palette on a dark-translated surface.

Constraints inherited from the map: vibe not replica; #11's data rules (true figures, clamped
track, absent = unrated); chips/buttons inside the modal must stay legible in every variant
(the light-surface chip question is mapped fog — variants may hold chips as-is and note the
tension, not solve it). Screenshots (baseline + each variant, modal open, 375px + 1280px) to
`../screenshots-02/`; ticket waits at `needs-info` for the pick — never self-close.

Resolution = the owner's pick recorded, plus their reactions worth carrying into the ship
ticket (e.g. "A but warmer", size notes).

## Acceptance criteria

- [x] Three compositions (A light parchment + nodes, B dark translation + nodes, C dark +
      retinted bars anchor) live behind `?panel=A|B|C` with the floating switcher; the app is
      byte-identical without the param
- [x] Every colour traces to the vibe sheet's sampled palette
- [x] OCFDU truth rules hold in every variant (a transcribed 6 shows 6 over a clamped track;
      unrated renders nothing)
- [x] Screenshots (baseline + each variant, modal open) at 375px + 1280px in
      `../screenshots-02/`; no horizontal overflow at 375px
- [x] Ticket left at `needs-info` carrying the pick question — never self-closed

## Comments

**Round live (2026-07-13) — OWNER PICK NEEDED, question at the end.**

Three panel-aligned compositions on the real spirit detail modal, gated on **`?panel=A|B|C`**
(namespaced param, the #20–#22 pattern). Production build, `SpiritDetail` + a throwaway
`src/components/PanelRound.tsx` + a delete-on-ship `deck.css` block. **Without the param the app
is byte-identical** — no theme class, #23's bars render, no switcher (SSR smoke's 17 modal
assertions unchanged; runtime page-x-overflow measured 0 in every state). Every colour is a
`--pnl-*` token traced to the [vibe sheet](../panel-vibe-sheet.md): light values sampled, dark
values the sheet's proposed dark-translations. The floating switcher flips A→B→C live.

- **A — light parchment + nodes:** the modal becomes a parchment card (field `#e7d19c`) over the
  dark app; OCFDU renders as five stone-like presence nodes, green fill bottom-up, ink figures.
- **B — dark translation + nodes:** umber surface (`#241d12`) + parchment text; same nodes,
  brightened green fill.
- **C — dark + retinted bars (anchor):** same umber surface, #23's vertical bars kept, retinted
  to the band-tan `#d2b068`.

**OCFDU truth rules hold in all three:** the node/bar fill is `min(100, rating/5 × 100)%` (byte
for byte #23's math), so a transcribed 6 clamps at a full node while the figure shows `6`. The
`OCFDU` type carries all five axes as required numbers, so "unrated renders nothing" has no data
path to exercise — same as the shipped bars.

Screenshots (baseline + A/B/C, modal open, Lightning's Swift Strike — offense 5, Air+Fire) at
375px + 1280px in [`../screenshots-02/`](../screenshots-02/).

**Reactions to carry into the ship ticket (#03), flagged not solved:**

1. **The tier chip is jarring on light (A).** The `C`-tier chip's dark-tuned bright yellow sits
   loudly on parchment (visible top-right of `A-1280.png`). This is exactly the mapped-fog
   chip-adaptation question (PRD): held as-is for the round. **If A wins, the light-surface chip
   palette becomes its own ticket** (tier / tag / expansion / element chips were all tuned for
   the dark theme).
2. **Pre-existing: the spirit name clips inside the head at 375px.** `LIGHTNING'S…` runs past the
   text column on narrow screens — **identical in the baseline** (see `baseline-375.png`), so the
   theming neither caused nor fixed it. No *page-level* horizontal scroll (measured 0). A one-line
   head fix (`min-width: 0` on the head text column) belongs to #03 or its own nit, not this
   round — flagged so the pick isn't blamed for it.

Two-axis code review run before commit: Standards — no hard violations (one CSS dedupe applied,
file renamed to PascalCase per house convention); Spec — clean, only this needs-info transition
was outstanding.

---

### The pick (owner)

Which composition ships as the modal's default — **A** (light parchment + nodes), **B** (dark
translation + nodes), or **C** (dark + retinted bars anchor)? Any reaction to carry ("B but the
nodes larger", "A but warmer parchment", size notes) goes here, and #03 builds it. **This ticket
does not self-close — it waits for your pick.**

**Owner picked C — dark + retinted bars (anchor).** No reaction notes carried forward. Shipped in
[#03](03-ship-the-winner.md); this ticket's status/pick section was left unfilled when the pick
was made and is being closed out now for bookkeeping (see `../MAP.md`'s "Decisions so far" and
"Status: COMPLETE").
