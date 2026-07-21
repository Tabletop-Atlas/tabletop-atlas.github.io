# Power-deck chart vocabulary

Status: done
Labels: wayfinder:prototype
Map: ../MAP.md

## Question

What plots do the Minor and Major deck views actually show? The owner named an UpSet plot
(element-combination intersections) — is that the right vocabulary, or do simpler forms
serve the at-the-table question better?

Run `/prototype`: build cheap, concrete candidates the owner can react to. Candidates to
cover at minimum:

- **UpSet plot** of element combinations (cards carry 1–3 elements; 3 element-less minors
  exist — `groupPowerCards` already handles a "No element" group).
- **Per-element bars with draw-N odds** — "chance of ≥1 Fire among the next 4 draws"
  (hypergeometric on the full deck; draw count default 4, decide whether N is adjustable).
- Secondary facets worth showing or dropping: cost distribution, fast/slow split.
- **Spirit highlight treatment**: how the picked spirit's elements (from `spirits.json`)
  read in each candidate.
- Whether a chart library earns its way in, or hand-rolled SVG (per `OcfduBars.tsx`) covers
  the winning form.

Deck contents come from the expansion picker (settled at charting; default = owned
collection). Resolution records the chosen vocabulary and links the prototype artifact.

## Comments

**2026-07-21 — prototype round shipped, awaiting the owner's pick.** Three chart-vocabulary
candidates for the Minor/Major view, gated on `?deckchart=A|B|C` (`DeckChartRound.tsx`, the
`?theme=`/`?side=` pattern — app is byte-identical without the param; baseline = the shipped
bars + dot-matrix). Screenshots in `screenshots-03/` (plus `-river` variants showing the
spirit highlight):

- **A — odds-first table**: elements sorted by draw-N odds, count/share/odds columns, plus a
  plain-text "top pairings" list. The no-chart candidate.
- **B — classic UpSet**: combination counts as columns over a dot matrix, element totals as
  left bars. The full vocabulary the owner originally named; ~40 columns wide on the full
  set, horizontally scrollable.
- **C — pair heat grid**: 8×8 element co-occurrence triangle (diagonal = element totals),
  draw-odds chips above. Answers "a card advancing two thresholds at once" directly.

All three derive from the existing `DeckComposition` — no domain or data changes, no chart
library needed for any candidate (hand-rolled per `OcfduBars` precedent). Facets (speed/cost)
stay below in every variant, so the vocabulary question is isolated. Teardown list in
`DeckChartRound.tsx`'s docblock; winner folds back as a rewrite of the shipped components.

**2026-07-21 — resolved: the owner picked B (classic UpSet) after four feedback rounds, and it
shipped.** The rounds added, at the owner's direction: readability filters (must-include
elements, elements-per-set buckets, min-cards, top-N, with a "showing X of Y" honesty line),
element icons instead of words, set-size colour coding (≤2/3/4/5+), element-coloured total
bars, pill-styled controls, count/A–Z row sort, a Counts/% unit toggle shared with the facets,
red-fast/blue-slow speed colours with the official wiki icons, a raised chart panel, a promoted
display-size deck switch, and an opt-in "fold this spirit's uniques into the Minor pool"
hypothetical. Folded in as `DeckUpset.tsx` (replacing `DeckElementBars`/`DeckCombinationMatrix`)
plus rewrites of `DeckFacets`/`DashboardTab`; the per-element draw-odds column (PRD user story
10) was restored at fold-in — the prototype had dropped it. Round scaffolding
(`DeckChartRound.tsx`, `?deckchart=` gate) deleted. No chart library; no domain changes.
Verdict on the ticket's actual question: UpSet is the right vocabulary *with filters* — the
unfiltered form was unreadable at 76 element sets. Screenshots in `../screenshots-03/`
(`final-shipped.png` is the landed form).
