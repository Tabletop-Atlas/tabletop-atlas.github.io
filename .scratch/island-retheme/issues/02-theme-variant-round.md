# 02 — Theme variant round: the owner picks a direction

Status: needs-info
Type: wayfinder:prototype
Blocked by: — (01 closed, unblocked)
Assignee: claude
Parent: ../MAP.md

## Question

Which Spirit-Island-aligned direction does the owner pick — light-parchment vs warm-dark, palette,
surface treatment — after reacting to real renders on the four anchor surfaces?

Build a small set of divergent candidates behind a namespaced query param (`?theme=A|B|C` — the
established `?variant=` / `?panel=` / `?headerVariant=` idiom), applying the ticket-01 tokens to the
**four anchor surfaces**:

- **app shell** — sidebar / nav / knobs panel / page background (the frame the owner called "all
  black")
- **Browse grid** — spirit tiles + complexity dots + tag chips + tier ribbon
- **tier board** — tier labels / tiles / captions / aspect tiles
- **Archive / Cards** — kind/speed pills, expansion chips, fear/blight subtype tags

Constraints:

- **Include at least one light-parchment candidate and one or two warm-dark candidates** — the
  broad-latitude call locked at charting. The owner reacts to renders; do not pre-narrow to one.
- **Base palette / surface / light-dark only.** Ornament (leaf/vine/flourish) is a *later* ticket,
  deliberately held back so it doesn't muddy the base direction decision.
- **Keep the chip systems legible and pairwise-distinct in every candidate** — the
  `cardChipColors.test.ts` invariant. If a candidate surface forces a chip re-tune to stay
  distinct, note it (it feeds the chip-adaptation fog); don't silently break distinctness.
- **Data honesty holds** — OCFDU true, unrated absent — as in every prior round.

## Acceptance criteria

- [x] At least one **light** candidate and one or two **warm-dark** candidates render behind
      `?theme=A|B|C`.
- [x] All four anchor surfaces — app shell, Browse grid, tier board, Archive — are restyled per
      candidate from the ticket-01 tokens.
- [x] Base palette / surface / light-dark only; **no ornament** in this round.
- [x] Chip systems stay legible and pairwise-distinct in every candidate; OCFDU figures and unrated
      markers stay honest.
- [x] Screenshots at 375px + desktop captured to `screenshots-02/`.
- [ ] The **owner's** pick + reaction notes recorded; the fog (ornament, chip-adaptation, modal
      re-alignment, per-surface rollout spec) graduated into fresh tickets.

## HITL

The **OWNER picks**; the agent never decides. Screenshots at 375px + desktop to `screenshots-02/`.
Ticket waits at `needs-info` once the candidates are live, until the owner's pick. On resolution,
record the owner's verdict + any reaction notes as a comment, then graduate the fog (ornament,
chip-adaptation, modal re-alignment, terminal spec) into fresh tickets.

## Candidates live (2026-07-17)

Behind `?theme=A|B|C` on any tab (floating switcher, bottom-right):

- **A — light-parchment**: the vibe sheet's sampled parchment field/ink text, presence-green accent.
- **B — warm-dark, nature accent**: the vibe sheet's proposed umber dark-translation, green accent
  (near-identical to the shipped modal's `PANEL_COLOR` — the "no modal changes needed" case).
- **C — warm-dark, vibrant accent**: same umber surface as B, accent/warn swapped to the freshly
  sampled vibrant water-blue/fire-orange pair.

Screenshots (desktop 1280 + mobile 375, Browse/Tiers/Archive, plus a `baseline-*` set with no
param for comparison) are in [screenshots-02/](../screenshots-02/).

**Two real bugs surfaced and fixed while building candidate A** (not candidate-specific — they
were latent, dark-theme-only assumptions baked into the base CSS, invisible until something other
than the shipped dark theme rendered):

1. `body`'s `background`/`color` resolve `var(--deck-bg)`/`var(--deck-body)` at the `body`
   element, which sits *outside* `.deck` — a `.deck.theme-X` class override on the CSS custom
   properties never reached it, leaving the page backdrop and default text colour stuck on the
   dark-theme root values under every candidate. Fixed by repeating the resolution on `.deck`
   itself (`src/deck.css`); a no-op for the unthemed baseline.
2. The active nav item's background was a hardcoded `#16202a` (not a token) — invisible on the
   dark theme by coincidence, but on candidate A it painted a dark box behind the (correctly
   themed, now-dark) nav text, making "Browse" unreadable. Retokenized to `var(--deck-line-soft)`.

**Chip-system re-tune actually applied:** `tierColors.ts`'s `tierColor()` gained an optional
`variant?: 'light'` param (default behaviour unchanged, existing tests untouched) with a
judgment-labelled `LIGHT_PALETTE` — the pastel `PALETTE` washed into the light-parchment page per
the ticket-01 reconciliation's flagged risk; the light variant darkens/saturates the same seven
hues so the tier ribbon/label stays visible. Wired into `TierBoard.tsx` and `SpiritTile.tsx`,
gated on `theme === 'A'`. Every other chip system (`tagColors.ts`'s seven palettes) needed no
change — confirmed by eye across all three candidates, matching ticket-01's "probably fine"
assessment.

Full test suite (412 tests) and `tsc --noEmit` pass unchanged.

**Waiting on the owner's pick** — this ticket stays at `needs-info`.
