# v5 #08 prototype — tag colour scheme

**Question:** what should a spirit tile's expansion/complexity/playstyle-tag colouring look like,
and how many tags fit under a name at 375px? See `.scratch/v5/issues/08-the-tag-colour-scheme.md`.

**Run it:** `npm run dev`, then visit `http://localhost:5173/prototype-v5-tag-colors.html`.
Switch variants via the floating pill (bottom-centre), arrow keys, or `?variant=A|B|C` in the URL.

**Screenshots:** `.scratch/v5/screenshots-08/` — all three variants at 375px and desktop, real
spirit data, worst-case fixture (longest name, most tags, one spirit per expansion).

## The three variants

- **A — Chip row.** Expansion, complexity, and every playstyle tag render as equal-weight pill
  chips in a wrapping row under the name.
- **B — Badge + dots, tags as text.** Expansion and complexity fuse into one compact badge
  (expansion = hue, complexity = filled dots, ●●○○). Playstyle tags demote to small coloured-dot
  + plain-text labels underneath.
- **C — Accent stripe.** No chips. Expansion becomes a thin coloured left-edge stripe on the
  tile. Complexity becomes a tiny dot-ramp next to the name. Playstyle tags are inline coloured
  words joined by " · " under the name — the lowest-weight treatment of the three.

All three share one palette (`palette.ts`): expansion uses muted "jewel tone" hues, complexity
uses a single-hue slate ramp (light→dark, ordinal), playstyle tags use a third muted categorical
set assigned by a stable hash. None of it shares hues with `tierColors.ts`'s bright pastel
palette, so a chip can't be mistaken for a tier badge.

**Layout finding:** no overflow or wrapping problems in any variant at 375px, even on the longest
name ("Serpent Slumbering Beneath the Island") and the most-tagged spirit (3 tags, Sharp Fangs
Behind the Leaves).

**Not built:** the "also visible in the dropdown" question. A native `<select>` can't hold a
coloured chip — if the owner means the Browse filter dropdown or the tier-list picker, that's a
real cost (replacing a native select with a custom listbox) and should be scoped as its own
decision, not assumed here.

**Not built:** tags-as-filters. The owner didn't ask for it; noted per the ticket in case the
colour makes the idea obvious in person.

## Verdict

_Pending — the owner needs to look at the screenshots/live prototype and choose (or mix). Once
chosen, record the pick in #08's `## Comments`, delete this whole `src/prototypes/v5-tag-colors/`
directory and `prototype-v5-tag-colors.html`, and fold the winning treatment into
`SpiritTile.tsx` as [#09](../../../.scratch/v5/issues/09-coloured-tags-everywhere.md)'s spec._
