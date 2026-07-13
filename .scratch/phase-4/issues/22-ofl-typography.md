# 22 — OFL typography 🎨

Status: ready-for-agent
Parent: [Phase 4 PRD](../PRD.md) · cluster 5 (Archive & theming)

## Blocked by

None — can start immediately.

## What to build

The typography the owner locked at spec assembly, informed by the
[licensing research](../official-assets-research.md): **OFL fonts only, self-hosted** — the
commercial title font (Fling-a-Ling) and the app-forbidding free lookalike (DK Snemand) were
both declined.

- **Body:** Reem Kufi (reportedly the game's actual body font; SIL OFL via Google Fonts),
  self-hosted — no font CDN, this is a local-first app.
- **Spirit names / display:** one OFL display face, chosen by variant round.

**Variant round (HITL):** render 2–3 OFL display candidates (e.g. Mouse Memoirs, Josefin Sans,
one more of the builder repo's OFL set) on real spirit names in Browse and the detail modal via
the `?variant=` switcher; the owner picks; winner ships; screenshots kept in
`../screenshots-22/`.

## Acceptance criteria

- [ ] Font files are committed and self-hosted with their OFL license texts alongside; the app
      makes no network font requests
- [ ] Spirit names render in the chosen display face across Browse, the tier board, and the
      detail modal; body text renders in Reem Kufi
- [ ] Every shipped font's license is OFL — verified, not assumed
- [ ] Variant round run and recorded (screenshots kept, scaffolding deleted)
- [ ] Browser-verified at 375px + desktop (long spirit names don't overflow their tiles)
