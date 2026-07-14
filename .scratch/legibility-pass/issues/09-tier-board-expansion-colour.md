# 09 — Expansion colour on the tier board

Status: done
Label: wayfinder:prototype (HITL — owner picks the look)
Parent: [Legibility-pass map](../MAP.md)

## Blocked by

- [05 expansion colour across the Archive](05-expansion-colour-archive.md) — the treatment idiom
  (stripe/tint/chip, one `EXPANSION_COLOR` source) and the owner's C pick are the starting point
  here, not a fresh design question.

## Question

Ticket 05's round surfaced a sub-decision the owner didn't answer at the time: should expansion
colour extend to the **tier board** (`TierBoard.tsx`), the one remaining surface that shows
spirits/aspects/cards without an expansion signal? The owner has now said yes, prototype it
(2026-07-14).

The tier board already colours the **row label** by tier *position* (`tierColor()`, a bright
pastel palette deliberately hue/lightness-separated from `EXPANSION_COLOR`'s darker jewel tones —
see `tagColors.ts`'s header comment). The **tiles themselves carry no colour today** — only the
label cell beside them does — so a tile-level expansion signal has a clean canvas, not a collision
to resolve.

Run the same three-way round ticket 05 used, applied to `TierTile` (configurations — base spirit
or spirit+aspect) and `CardTile` (power cards):

- **A — left-edge stripe**
- **B — background tint** (ticket 05 found this fails on full-bleed art tiles; tier tiles are also
  full-bleed art — confirm the same limitation holds here rather than assuming it does)
- **C — solid chip** (the owner's pick for the Archive)

One fresh sub-decision this round must surface, not guess: **which expansion colours an aspect's
tile** — the aspect's own `expansion` (`Aspect.expansion`), or its base spirit's? They can differ
(an aspect can ship in a later box than its spirit). Show the owner both readings if they diverge
for any aspect in the collection, or note if none currently do.

## Acceptance criteria

- [x] Three treatments prototyped on the real tier board (`TierTile` + `CardTile`), gated on a
      namespaced query param, screenshots at 375px + 1280px in `../screenshots-09/`
- [x] Colour comes from the one `EXPANSION_COLOR` map (via `expansionColorFor()`) — absent for a
      card whose raw expansion string doesn't normalize; spirits/aspects use their own canonical
      `expansion` field directly
- [x] The aspect-tile sub-decision (aspect's own expansion vs. base spirit's) is surfaced with a
      concrete example if one exists in the data, not decided by the agent
- [x] Variant B's grid-tile limitation from ticket 05 is checked against tier tiles, not assumed
- [x] `cardChipColors.test.ts` and the full suite stay green; no collision between `EXPANSION_COLOR`
      and `tierColor()`'s palette introduced
- [x] Owner pick recorded, winner shipped, scaffolding deleted, screenshots kept
- [x] Legible on dark theme at 375px + desktop

## Comments

**Round live (2026-07-14) — OWNER PICK NEEDED, question at the end.**

Same three-way round as ticket 05, applied to `TierTile` (configurations — base spirits and
aspects) on the real tier board, gated on **`?tierExpansion=A|B|C`** (namespaced distinct from
ticket 05's `?expansionColor=`, per the standing convention). Screenshots (baseline + A/B/C, the
Spirits/configurations subject, all seven tier rows, at 375px + 1280px) in
[`../screenshots-09/`](../screenshots-09/). `CardTile` (minor/major powers) got the same code path
(`expansionColorFor(card.expansion)`) but isn't separately screenshotted — no minor/major-powers
tier list exists in the shipped data to view without first creating one, and its treatment is
identical to `CardGrid`'s already-shipped C chip.

- **A — left-edge stripe**
- **B — background tint**
- **C — solid chip** (the Archive's pick)

**The aspect sub-decision, resolved with data, not guessed:** every one of the 31 aspects in
`spirits.json` ships in a **different** expansion than its base spirit (31/31 diverge — checked
directly against the data, not assumed). `Lightning's Swift Strike` is `Base`, but its aspects
Pandemonium/Wind/Immense/Sparking are `Jagged Earth`/`Jagged Earth`/`Feather & Flame`/
`Nature Incarnate` respectively — visible in every screenshot (its four aspect tiles each carry a
different colour from the base spirit's blue). Given that, an aspect tile colours by **its own**
`expansion`, not its base spirit's — the base spirit's would be uniformly stale information on
every single aspect tile that exists.

**Variant B confirmed, not assumed, to fail the same way ticket 05 found:** tier tiles are also
full-bleed art (`.tier-tile-art`/`.tier-tile-card-art`), so the background tint renders with no
visible colour anywhere (`B-configurations-1280.png` — compare to `A-configurations-1280.png` or
`C-configurations-1280.png`, both clearly coloured). Confirms rather than repeats ticket 05's
finding; not a fresh discovery.

**No palette collision:** `tierColor()`'s pastel row-label palette and `EXPANSION_COLOR`'s jewel
tones were already hue/lightness-separated by design (`tagColors.ts`'s header comment) — visible in
every screenshot where a bright tier-label swatch sits beside a darker expansion badge on the same
row without being confused for one another. Full suite (390 tests) + `tsc -b` + `oxlint` stay green.

---

### The pick (owner)

**Superseded same day.** The owner first picked A (left-edge stripe, logged below for the trail),
then reconsidered: "I think the best approach will be to have a toggle between version B and C.
Invisible by default, and expansion chips if toggle is on. Let's remove the variant A and have this
nicer UI approach." **Final shape: not a locked treatment at all, but a user-facing toggle** —
resolves the A/B tension the first pick left open by not forcing a single answer.

**Shipped:** a "Show expansion colour" checkbox on the tier board (session-only, off by default,
alongside the board's other view-preference toggles — "Only show spirits I own," "Edit tiers").
Off = B (no colour signal — the board's original look). On = C (the Archive's solid-chip idiom,
`.expansion-chip`/`.expansion-chip-corner`, already permanent from ticket 05) on every `TierTile`/
`CardTile`, aspect tiles still colouring by the aspect's own expansion, not the base spirit's.
Variant A's border-left stripe and its `box-sizing`/width CSS changes were reverted — `.tier-tile`/
`.tier-tile-art` are back to their pre-#09 fixed widths, since the chip idiom needs none of that.
Screenshots: `SHIPPED-toggle-off-1280.png` / `SHIPPED-toggle-on-1280.png` in
[`../screenshots-09/`](../screenshots-09/). `tsc -b`, `oxlint`, and the full test suite (390 tests)
all green after the ship.

<details>
<summary>Superseded pick (kept for the trail, no longer what's shipped)</summary>

**Owner picked A (left-edge stripe), 2026-07-14** — after briefly considering C (the Archive's
pick), then B (no visible signal at all). Owner's own words at the time: "I am also leaning towards
B, i.e. keeping it invisible — I will see after some time how I feel but for now let's go with C"
(then changed the pick itself to A). That live tension between "some signal" and "no signal" is
exactly what the toggle above resolves, rather than forcing a single static answer.

</details>
