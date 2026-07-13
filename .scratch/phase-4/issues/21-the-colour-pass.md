# 21 — The colour pass 🎨

Status: done
Parent: [Phase 4 PRD](../PRD.md) · cluster 5 (Archive & theming)

## Blocked by

None — can start immediately.

## What to build

Three locked colour calls, delivered as one visible pass:

- **Card-kind tag colours:** Major / Unique / Minor visibly distinct in the Archive's grids.
  Heed v5's tag-colour lesson (its round 1 shipped a hash palette that guaranteed collisions):
  an explicit colour per kind, pinned by a test that no two kinds share a colour.
- **Speed:** Fast = red, Slow = blue — locked at spec assembly (the icon alternative was
  declined: only ~80px contested-provenance PNGs exist, per the
  [research](../official-assets-research.md)).
- **Expansion colours:** one expansion→colour mapping, consumed by every surface that colours an
  expansion (Browse, tier board, Archive, detail) — a single source of truth, so an expansion is
  the same colour everywhere.

**Variant round (HITL):** present 2–3 palette candidates for the kind/speed chips on the real
Archive grid (dark surface) via the `?variant=` switcher; the owner picks; winner ships;
screenshots kept in `../screenshots-21/`.

## Acceptance criteria

- [x] Major/Unique/Minor chips are visibly distinct; a test pins that no two kinds (and neither
      speed) share a colour *(`cardChipColors.test.ts`)*
- [x] Fast renders red, Slow renders blue, everywhere speed is shown
- [x] Expansion colours come from one mapping; no surface carries its own copy *(verified
      already true — see the comment)*
- [x] Variant round run and recorded (screenshots kept, scaffolding deleted)
- [x] Legibility checked on the dark theme at 375px + desktop

## Comments

**Round prepared (2026-07-13) — OWNER PICK NEEDED, see the question at the end.**

**Expansion colours (the locked structural call) were verified already single-source, so
nothing shipped for that box:** `tagColors.ts`'s `EXPANSION_COLOR` is the one mapping, and its
only consumers are the only two surfaces that colour expansions today (Browse's `SpiritTile`,
the detail's `SpiritDetail`) — no surface carries its own copy (grep-verified). One reading
question for the owner, flagged rather than guessed: the ticket's parenthetical names the tier
board and Archive among consuming surfaces, but neither colours expansions at all today. If you
want expansion COLOUR ADDED to those surfaces (not just consistency where colour already
appears), say so and that becomes its own small ticket — the PRD's wording ("an expansion is
one colour everywhere") supports the weaker consistency reading this round went with.

**The kind/speed chip round is live and awaiting the pick.** On the Archive's Powers rows (the
one view where minor/major/unique mix), production build, gated on **`?colors=A|B|C`** — note
the param: the ticket wrote `?variant=`, but #20's round is pending on that param, so this one
is namespaced (`?colors=`, per the handoff's collision rule; coexistence Playwright-verified).
Nothing changes without the param:

- **`?colors=A` — Tinted text:** coloured type/speed text, saturated hues, no chrome.
- **`?colors=B` — Filled pills:** solid rounded chips, muted hues, light text.
- **`?colors=C` — Outlined chips:** bordered chips, colour on border + text.

All three keep Fast in the red family and Slow in the blue family (the locked call — the icon
alternative stays declined per the research), and all five keys (three kinds + two speeds) are
pairwise distinct within each palette. **Hue disclosure:** you are picking a *treatment*; exact
hues may shift a step at ship time — palette A currently reuses Browse's tag-chip hues verbatim
(different treatment, but `tagColors.ts`'s rule wants chip systems tellable-apart), and B's
Fast red matches #20's top difficulty band. The winner's palette gets separated from whichever
system it collides with, per tagColors' own re-check rule, with the pinning test shipping
alongside.

Verified: 373/373 unchanged; production build in Playwright at 375px + 1280px — baseline
byte-identical without the param, all five chip colours pairwise distinct per candidate
(computed styles), Fast red/Slow blue per candidate, no horizontal overflow, switcher
round-trips and leaves #20's `?variant=` param intact. Screenshots (baseline + A/B/C, both
widths): `../screenshots-21/`. Code review (two-axis): applied pre-commit — palette B's kind
hues shifted off the verbatim `EXPANSION_COLOR` values (worst collision: same hue AND same
filled treatment as Browse's expansion chip), the reuse disclosure above added, the gate moved
wholly inside the prototype (the #20 shape — no reload hack, no export), palette keys typed
`PowerCard['kind'] | PowerCard['speed']`. Judgement call kept: the CardRows markup copy inside
the prototype is sanctioned throwaway (the #20/v4 precedent).

**Question for the owner: which treatment ships — A (tinted text), B (filled pills), or C
(outlined chips)?** Archive → Powers → Rows with `?colors=A|B|C`, or the floating switcher
bottom-left. On your pick: the winner ships into `CardRows`/`deck.css` with final hues
separated per the disclosure above, the no-two-share-a-colour test lands, the scaffolding file
is deleted, and this ticket closes. And answer the expansion question above if you want colour
added to the tier board/Archive.

---

**Closed (2026-07-13). The owner picked B — filled pills.** Shipped: `CARD_KIND_COLOR` /
`CARD_SPEED_COLOR` in `tagColors.ts` (the colour home), consumed inline by `CardRows` per the
`SpiritTile` precedent, with the `.card-row-pill` shape class in `deck.css`. Final hues
separated per the disclosure: a lightness/saturation step off `EXPANSION_COLOR`'s jewel tones
and off #20's shipped scenario bands — `cardChipColors.test.ts` pins pairwise distinctness,
Fast-red/Slow-blue by channel, and zero byte-identical overlap with the expansion palette.
Fear/Events/Blight rows keep their grey type text (single-kind segments — nothing to
distinguish). Scaffolding deleted (`ColourPassRows.tsx`), `?colors=` inert. Verified on the
production build at 375px + 1280px: five distinct pill fills by default, pills survive grouped
rendering, Fear rows pill-free, no overflow. 383/383 tests. Shipped screenshot:
`../screenshots-21/1280-SHIPPED-B.png`.

**Post-close review fix (same day):** the batch review caught the speed pill rendering dim
grey text — `.card-row-speed`'s own `color`/`text-align` sat later in deck.css than
`.card-row-pill` and won the cascade at equal specificity. The pill rule now sits after both
chip rules with a comment naming the hazard, and the collision test widened to pin
kind/speed colours apart from the expansion, tag, AND scenario-band palettes (the disclosure's
full promise). **The expansion sub-question (adding expansion colour
to the tier board/Archive) went unanswered and stays open** — flagged for a future ticket, not
built.
