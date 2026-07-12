# 10 — Prefactor: a reusable card viewer

Status: done
Type: wayfinder:task (AFK)
Parent: [v4 map](../MAP.md) · Spec: [PRD.md](../PRD.md)

## What to build

Nothing new, from the user's perspective — that is the point. The click-to-enlarge card viewer built
for v3 #11 lives inside the spirit detail view, which is the only place that can use it. The Cards
tab needs exactly the same behaviour, so lift the viewer out to stand on its own rather than
building a second one that drifts.

Make the change easy, then make the easy change.

## Acceptance criteria

- [ ] The card viewer is a standalone component, usable by any surface, taking a card image and
      whatever caption it needs
- [ ] The spirit detail view uses it and behaves **identically** — cards enlarge, dismiss, and do not
      overflow at 375px, exactly as v3 verified
- [ ] No behaviour change is visible anywhere in the app; the existing test suite passes untouched
- [ ] Verified by opening the spirit detail modal in a real browser, not just by reading the diff —
      this is the component v3 shipped invisible once already

## Blocked by

- None — can start immediately.

## Comments

Lifted the enlarge-on-click viewer out of `SpiritDetail.tsx` into `src/components/CardViewer.tsx`:
a presentational component taking `src`, `alt`, `onClose`. `SpiritDetail` keeps its own
`enlarged` state (unchanged) and now renders `<CardViewer .../>` instead of the inline backdrop +
`<img>`. The `stopPropagation` that stops the enlarge click from also closing the parent modal moved
into `CardViewer`'s own `onClick`, so the public API stays a plain `onClose: () => void`.

`tsc -b`, the full test suite (246/246) and `vite build` are all clean — no test needed touching, the
JSX emitted for the enlarge overlay is byte-for-byte the same as before extraction.

**Update (v4 #07's audit):** a later session installed Playwright and drove the built app in real
Chromium at 375×667, opening a spirit's panel image via `CardViewer`. It renders cleanly with no
overflow — see `.scratch/v4/screenshots-07/card_enlarge_viewer_375.png`. v3's prior verification of
this surface holds; no regression. Flipping to `done`.
