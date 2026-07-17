# 05 — Ornament vocabulary for the winning direction

Status: ready-for-human
Type: wayfinder:prototype
Blocked by: —
Assignee: —
Parent: ../MAP.md

> **Correction (2026-07-17):** ticket 02's base-direction pick moved from A (light-parchment) to
> **B (warm-dark, nature accent)** after this ticket was originally charted against A — see
> [02's correction note](02-theme-variant-round.md#correction--owners-revised-pick-2026-07-17).
> Build ornament candidates against **`?theme=B`**, not `?theme=A`; the "Question" and "candidates
> render against `?theme=A`" line below are stale, left as-written for the audit trail rather than
> silently rewritten.

## Question

Now that the owner has picked candidate A (light-parchment) on the theme variant round
([02](02-theme-variant-round.md)), which CSS-only leaf/vine/flourish motifs, on which surfaces,
and how heavy — the "floral is figurative + CSS ornament, not illustrated art" call locked at
charting (map Notes)? This was deliberately held back from ticket 02 ("Base palette / surface /
light-dark only... Ornament is a *later* ticket, deliberately held back so it doesn't muddy the
base direction decision") so the owner could react to ornament sitting on the *actual* winning
surface, not a placeholder.

No new art assets — CSS-achievable shapes only (dividers, corner flourishes, accent rules), per
the charting-time constraint. Candidates should render against the live `?theme=A` shell (see the
correction above: read as `?theme=B`).

## Acceptance criteria

- [ ] At least two or three ornament-density/motif candidates (e.g. minimal accent rules only vs.
      corner flourishes vs. leaf/vine dividers) rendered on at least the app shell + one other
      anchor surface, behind a namespaced param.
- [ ] CSS-only — no new image assets.
- [ ] Chip-system and modal legibility (per tickets 03/04's outcomes, if already resolved) hold.
- [ ] Owner's pick + reaction notes recorded.

## HITL

The **OWNER** picks the motif/density, never the agent. Ticket waits at `needs-info` once
candidates are live.
