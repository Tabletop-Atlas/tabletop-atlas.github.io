# 18 — Attribution and the default list

Status: done
Parent: [Phase 4 PRD](../PRD.md) · cluster 4 (tier UX)

## Blocked by

- [#12 the subject axis](12-the-subject-axis.md) — the default-list domain rule lives there
- [#14 the Settings tab](14-the-settings-tab.md) — the pick lives in Settings

## What to build

Two credit-where-due behaviours:

- **Attribution display:** when the active list is cited, the tier surface visibly credits it —
  author, title, and a link — straight from the citation fields the schema already carries
  (locked owner call: the default list is 3 Minute Board Games' published ranking, "not mine").
  A personal list shows its personal origin instead; no fake citations.
- **The default-list pick:** Settings gains a "default tier list" preference (per its open-door
  policy) choosing which list boots as active per subject; seeded to the credited default list.
  **Verify the seed against the shipped lists' citation URLs** — the owner named a specific
  video as the default; if no shipped list's citation matches it, stop and surface to the owner
  rather than guessing which list they meant.

## Acceptance criteria

- [x] The tier surface shows author/title/link for any active cited list; personal lists show
      origin without a citation
- [x] Settings offers the default-list pick; changing it changes which list is active on next
      boot
- [x] The shipped seed is verified against the owner's named source URL (or explicitly escalated)
- [x] Default-list behaviour unit-tested with injected storage
- [x] App smoke asserts the credit line renders for the default boot state

## Comments

**Resolved (2026-07-13), with one explicit escalation for the owner — see the question below.**

Attribution: the tier board's citation panel already carried author + a bare "source" link; the
link text is now the source's **title**, so an active cited list credits author, title, and link
straight from its citation fields (3MBG shows "By 3 Minute Board Games · Tier ranking all the
official spirits in Spirit Island (2025)" linking to its video). A personal list still shows
"your list" / "By you" with no link — no fake citations. Settings: new "Default tier list"
section on the #12 seams (`getDefaultList`/`setDefaultListId`), one pick per subject that has
lists; the active list stays session state, so the pick changes what the next load boots, not
the current one. #14's "exactly three sections" smoke guard moved to four, sanctioned here.

**The seed gate — verified, and ESCALATED rather than flipped.** The owner named
`watch?v=LoP2T4GO4xo` (MAP.md) as the default list's source. No shipped citation matches:
`3mbg-strength-solo-2025` was scraped from `watch?v=d130MTU08fg`, `sia-favorites-fun-solo-2026`
from `watch?v=jkBInOMEFvA`. Both videos are 3MBG-adjacent in the owner's framing, but assuming
the shipped list is the one the owner meant is exactly the guess this ticket forbids. **Question
for the owner: is `3mbg-strength-solo-2025` (from `d130MTU08fg`) the list you meant by naming
`LoP2T4GO4xo`, or is that a different list still to transcribe?** Until answered the seed stays
the owner's board. Once answered, the flip is a one-line seed change in `defaultListFor` plus
the smoke test's pinned URL. Recorded in ADR 0002 "Left open", CONTEXT.md's "Default list"
entry, and the `tierStore.ts` comment — all updated this ticket to state the escalation as the
outcome (they previously promised a flip).

Verified: 371/371 — default-list behaviour was already pinned with injected storage by #12's
tests (durable across reboot, per-subject, unresolvable fallback, legacy migration; no new store
behaviour shipped, so no new unit tests owed); new smoke asserts the boot credit ("By you") and
the full cited credit. Production build in Playwright at 375px + 1280px: personal origin without
a link on boot, cited author/title/href after switching, Settings pick seeded to Owner's board,
changing it boots 3MBG after reload, board switches don't rewrite the default, no overflow.
Code review (two-axis): hard finding fixed pre-commit — the escalation existed only in code
comments while ADR 0002/CONTEXT.md still promised the flip; both now record the real outcome,
and this resolution carries the owner question. Also applied: hoisted `tierStore.getLists()` in
Settings, retitled the stale "pending #18's verified seed" test.
