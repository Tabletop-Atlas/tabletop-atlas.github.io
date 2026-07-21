# Fear/event view prototype

Status: ready-for-human
Labels: wayfinder:prototype
Map: ../MAP.md
Blocked-by: 02-fear-event-valence-taxonomy.md

## Question

What do the Fear and Event deck views show, once the valence taxonomy exists?

Run `/prototype` with the taxonomy from
[Fear/event valence taxonomy](02-fear-event-valence-taxonomy.md) in hand: composition of
each deck by valence (the owner's driving question — "how likely is a bad event / a good
fear card?"), plus whatever existing facets earn a place (fear `tags`, event `eventClass`,
expansion split). Decide the draw-odds presentation (next-card odds? next-N?) and keep the
visual language consistent with whatever
[Power-deck chart vocabulary](03-power-deck-chart-vocabulary.md) lands on, if it has
resolved by then.

Resolution records the chosen views and links the prototype artifact.

## Comments

**2026-07-21 — prototype up, awaiting owner verdict.** Three variants mounted inside the real
Dashboard Fear/Event segments (sub-shape A), gated by `?variant=` — without the param the
shipped views render untouched; the switcher is dev-only. Run `npm run dev` and open
`/?variant=A`, then Dashboard → Fear/Event; `←`/`→` or the floating pill cycles variants.
Screenshots in `screenshots-04-proto/`.

- **A — Headline stack:** stat-tile row answering the driving question ("next event: X%
  harmful"), one 100%-stacked valence bar, then the tag/class facet rebuilt as mini stacked
  bars (expansion facet dropped). Odds framing on trial: next-draw odds = pool share.
- **B — Crosstab matrix:** valence × class (impact × tag) grid — "where does the bad live" —
  with an all-cards totals row.
- **C — Card wall:** every card a chip colored by its bucket, grouped by tag/class — browsing
  over aggregating. Known softness: the sequential green impact ramp reads subtly on chip edges.

Ratings are loudly-marked **name-hash stubs** in `Prototype04FearEvent.tsx` — not judgments;
the real table comes with the follow-up spec's rubric + ratification. Colors dataviz-validated
on the app surface: harmful `#d97742` / mixed neutral / beneficial `#4f9ad4` — **blue, not the
accent green, because green fails CVD separation against the warm pole (deutan ΔE 7.1)**; fear
impact uses a sequential green ramp (magnitude, not polarity). Both calls are for the owner to
ratify or override with the variant pick.

VERDICT (owner): _pending — record the picked variant (or the mix) here, then fold in and
delete the prototype._
