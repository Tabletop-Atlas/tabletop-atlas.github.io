# 04 — The Archive's structure: tabs vs subfolders

Status: done
Type: wayfinder:grilling (HITL)
Parent: [phase-4 map](../MAP.md)

## Blocked by

_(nothing)_

## Question

Does the Archive keep card-type tabs on top, or restructure into subfolders per type? The owner
explicitly wants the agent's counsel on the implications — they don't know what each option costs.

Facts to bring to the grilling (read `CardsTab.tsx` first):

- The Archive is a single component with a **6-segment switch** (Minor / Major / Fear / Events /
  Blight / Adversaries / Scenarios area) — v5 grew it from 4 to 6 segments and it already
  overflowed a 375px viewport once, caught and fixed in v5 #05b. More segments won't fit; that's
  part of why the question exists.
- There is **no backend** — this is a static Vite site with in-memory state and no router. What
  the owner calls "backend implications" is really: component structure, whether the app adopts
  URL routing (subfolders imply URLs; today tab state is a `useState` in `App.tsx`), and what
  either shape does to deep-linking later (deep-linking a single card is v5 fog, still open).
- The locked Archive sorting call (Minor/Major groupable by cost/elements/speed; Fear stays
  alphabetical) lands on this surface — the structure chosen must leave room for per-type
  controls that differ between types.

The decision is structure only; the sorting/grouping build is spec work downstream.

## Comments

**Resolution (2026-07-13, grilled with the owner — two decisions):**

The counsel that decided it: **"subfolders" is a navigation question in disguise.** A subfolder
without a URL is fake navigation — the browser back button lies, the dishonest-control smell v5
spent #01 killing. So the real choice was switch vs. adopting URL routing app-wide, and nothing
in this phase needs a URL.

1. **The segmented switch stays.** Six flat type-buttons, per-segment control sets swapping
   beneath (the shape already gives each type its own control room — the locked Powers
   sort/group controls land inside their segment). **No router this phase**; deep-linking and
   shareable URLs remain a future decision that a concrete feature must justify — if it ever
   arrives, it arrives as its own effort, app-wide, not through one tab.
2. **Powers stays one segment.** The existing kind filter (minor/major, OR-combining) already
   slices the deck; splitting into Minor/Major segments would grow the switch to seven buttons
   (re-inviting the 375px overflow v5 #05b fixed) to duplicate a working filter, and would
   leave uniques homeless. Tier-list subjects (`minor-powers`/`major-powers`, from
   [#06](06-multi-tier-list-architecture.md)) are a different axis — what a list ranks, not how
   the Archive is shelved.

For [#09](09-assemble-the-phase-4-spec.md): the locked Archive sorting item (Minor/Major
sortable/groupable by cost/elements/speed; Fear and similar stay alphabetical/by-type) specs as
controls within the Powers segment, no structural change.
