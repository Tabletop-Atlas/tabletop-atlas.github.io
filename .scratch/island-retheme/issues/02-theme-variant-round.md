# 02 — Theme variant round: the owner picks a direction

Status: ready-for-human
Type: wayfinder:prototype
Blocked by: — (01 closed, unblocked)
Assignee: —
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

- [ ] At least one **light** candidate and one or two **warm-dark** candidates render behind
      `?theme=A|B|C`.
- [ ] All four anchor surfaces — app shell, Browse grid, tier board, Archive — are restyled per
      candidate from the ticket-01 tokens.
- [ ] Base palette / surface / light-dark only; **no ornament** in this round.
- [ ] Chip systems stay legible and pairwise-distinct in every candidate; OCFDU figures and unrated
      markers stay honest.
- [ ] Screenshots at 375px + desktop captured to `screenshots-02/`.
- [ ] The **owner's** pick + reaction notes recorded; the fog (ornament, chip-adaptation, modal
      re-alignment, per-surface rollout spec) graduated into fresh tickets.

## HITL

The **OWNER picks**; the agent never decides. Screenshots at 375px + desktop to `screenshots-02/`.
Ticket waits at `needs-info` once the candidates are live, until the owner's pick. On resolution,
record the owner's verdict + any reaction notes as a comment, then graduate the fog (ornament,
chip-adaptation, modal re-alignment, terminal spec) into fresh tickets.
