# PRD: Spirit Island Spirit Recommender (v1)

Status: done

## Problem Statement

I own every Spirit Island expansion, which means ~40 spirits are available at any given
game night. Two things are hard as a result:

1. **Choosing a spirit is paralysing.** When I sit down to play I want a spirit that fits
   the *mood* of tonight's game — aggressive, defensive, control-heavy, simple, whatever —
   but I can't hold 40 spirit kits in my head, and the printed reference sheet is a wall of
   numbers that doesn't map to "what do I feel like playing."
2. **I often play with newcomers** who don't know the game's vocabulary at all — they've
   never heard of Fear, Dahan, Blight, or any specific spirit. They can't answer "do you
   want a high-Control spirit?" because the words are meaningless to them. They *can* answer
   "do you like hitting hard and fast, or slow builds that snowball?" — the way they'd talk
   about any board game.

There is no tool that translates a *plain-language playstyle preference* into a concrete
spirit recommendation from my full collection, and lets me (or a friend) trust that the
answer reflects both fit and spirit strength.

## Solution

A local-first, static web app (Vite + React + TypeScript, deployable unchanged to GitHub
Pages) with three tabs:

1. **Recommender** — a short paged questionnaire (10 plain-language, jargon-free questions
   answerable by anyone who's played any board game) that feeds a live, re-rankable results
   board. The board shows a top-5 shortlist (top 3 emphasised, each with a one-line "why you
   specifically"), one deliberately spicy **wildcard**, and a **reroll**. All questionnaire
   answers become live controls the user can tweak while watching the ranking reshuffle.
   Includes a **random chooser** mode (uniform draw under stated constraints). Optionally
   accepts teammates' already-chosen spirits and shows a mechanical **team coverage panel**.

2. **Browser** — every spirit as an art thumbnail grid with 1–2 sentence "how it plays"
   summaries, filterable and sortable (expansion, complexity, OCFDU, tags).

3. **Tier list** — a per-spirit-editable tier list (S/A/B/C/D), seeded from a
   community-consensus default, persisted to the browser. The tier list feeds the
   recommender as an adjustable strength-vs-novelty prior.

The recommendation engine is a **deterministic, rule-based weighted scoring function** over
a static hand-maintained dataset. No LLM in v1. (Architecture principle: *deterministic
where facts live, stochastic only where judgment lives*.)

## User Stories

### Recommender — questionnaire & results

1. As a player, I want to answer a short set of plain-language questions about how I like to
   play games, so that I get spirit recommendations without needing to know Spirit Island
   vocabulary.
2. As a complete newcomer, I want the questions phrased in general board-gaming terms (hit
   hard vs. outlast, early-game vs. late-game), so that I can answer them meaningfully
   despite never having played Spirit Island.
3. As a player, I want the questionnaire presented as a short paged wizard (one step at a
   time), so that I'm not overwhelmed by a wall of controls.
4. As a player, I want to land on a live results board after the wizard, so that I can see
   my recommendations immediately.
5. As a player, I want to tweak my answers after seeing results and watch the ranking update
   in real time, so that the tool feels like something I explore rather than a quiz I submit
   once.
6. As a player, I want the top 3 recommendations each shown with a one-line "why this suits
   *you*" explanation, so that I understand *why* it was picked, not just *that* it was.
7. As a player, I want to see a shortlist of about 5 spirits (top 3 emphasised) rather than a
   single answer, so that I can make the final pick myself from a curated set.
8. As a player, I want one deliberately spicy "wildcard" recommendation alongside the fitted
   ones, so that I'm occasionally nudged toward something outside my stated comfort zone.
9. As a player, I want a "reroll" action, so that I can get a fresh set of suggestions
   without re-answering everything.
10. As a player, I want each recommended spirit shown with its **artwork**, not just its
    name, so that I can recognise it at a glance.
11. As a player, I want the recommended spirit's OCFDU profile shown as a **radar chart**, so
    that I can see the mechanical shape of what my plain-language answers translated into.
12. As a player, I want to state how many players are at the table, so that the
    recommendation can surface player-count-relevant notes ("strong solo", "shines at high
    player counts").

### Recommender — the questions (playstyle → hidden weights)

13. As a player, I want to say how I like to beat opponents (overwhelming force / outsmart &
    control / make them panic / dig in and outlast / adapt flexibly), so that the tool can
    infer my Offense/Control/Fear/Defense/Utility priorities.
14. As a player, I want a second question about my gut reaction to a threat, so that my
    playstyle priorities are inferred from more than one answer and are therefore stable.
15. As a player, I want to say whether I prefer doing one thing brilliantly or keeping many
    options open, so that "flexible/Utility" is a deliberate choice rather than an
    "unsure" default.
16. As a player, I want to say whether I prefer huge decisive turns or steady inevitable
    pressure, so that burst-vs-grind sharpens my offense/fear vs. control/defense lean.
17. As a player, I want to say whether I'm early-game or late-game focused, so that the tool
    can match my **tempo** preference (strong-from-turn-one vs. slow snowball).
18. As a player, I want to say how I feel about fiddly positioning puzzles, so that the tool
    can match my **board-control** preference.
19. As a player, I want to say how much complexity/bookkeeping I enjoy, so that the tool can
    weight spirit complexity appropriately.
20. As a player, I want to say how well the player at the table knows Spirit Island, so that
    a first-timer is never handed a Very-High-complexity spirit.
21. As a player, I want to optionally say I'm drawn to a particular element/theme, so that
    (lightly) my aesthetic preference can act as a tiebreaker without overriding fit.
22. As a player, I want to say whether I'm chasing raw power or something fresh this game, so
    that the strength-vs-novelty prior starts where I want it.

### Recommender — scoring behaviour

23. As a player, I want spirits scored by how strongly they deliver what I *asked for* (not
    penalised for also being good at things I didn't ask for), so that surplus capability
    is treated as a bonus, not a mismatch.
24. As a player who wants a simple game, I want high-complexity spirits pushed down the
    ranking (but not hard-removed), so that the wildcard can still surprise me with a spicy
    complex pick if I'm feeling brave.
25. As a player, I want a strength-vs-novelty control that nudges the ranking toward
    higher-tier spirits when I want power, so that I can bias toward strong picks — without
    the tool ever ignoring the answers I just gave.
26. As a player, I want ties broken predictably (by tier prior, then stably), so that the
    ordering is deterministic across reloads.

### Recommender — random chooser

27. As a player, I want a "just pick one at random" mode, so that I can let go of the
    decision entirely.
28. As a player, I want the random draw to respect stated constraints (e.g. "random but low
    complexity"), so that the random pick is still within bounds I care about.

### Recommender — aspects

29. As a player, when a recommended base spirit fits my answers but misses one thing I care
    about, I want a one-line nudge toward an aspect that shifts it that way ("you wanted
    support and base Lightning is pure offense — the Wind aspect leans supportive"), so that
    I discover relevant variants.
30. As a player, I want aspects shown as collapsible variants under their base spirit with a
    one-line description, so that they stay secondary and don't clutter the main list.

### Recommender — team play

31. As a player at a multiplayer table, I want to enter the spirits my teammates have already
    chosen, so that I can factor the team into my pick.
32. As a player, I want a factual coverage panel showing the team's element spread and role
    gaps ("nobody brings Defense", "zero Fear generation"), so that I can see holes at a
    glance.
33. As a player, I want an optional one-click "tune toward the gaps" action that nudges my
    preference weights toward the team's missing roles, so that I can lean into filling a gap
    without hand-adjusting sliders.

### Browser

34. As a player, I want to browse every spirit as an artwork grid, so that I can explore my
    whole collection visually.
35. As a player, I want a 1–2 sentence "how it plays" summary per spirit, so that I can
    understand a spirit without reading its full panel.
36. As a player, I want to filter and sort the browser (by expansion, complexity, OCFDU,
    tags), so that I can narrow to what I'm curious about.
37. As a player, I want each spirit's aspects visible in the browser, so that I can see the
    variants available.

### Tier list

38. As a player, I want a tier list tab pre-seeded with community-consensus tiers, so that
    the tool is useful immediately with zero setup.
39. As a player, I want to reassign any spirit's tier via a simple per-spirit control, so
    that the ranking reflects *my* opinion of strength.
40. As a player, I want my tier edits to survive a page refresh, so that I don't redo them
    every session.
41. As a player, I want to reset the tier list to the shipped default, so that I can undo my
    edits.
42. As a player, I want spirit artwork shown in the tier list, so that I can recognise
    spirits while ranking them.

### Persistence

43. As a returning user, I want my last questionnaire answers restored, so that I resume
    tweaking rather than starting over.
44. As a returning user, I want my tier-list edits restored, so that my strength opinions
    persist.

### Deployment

45. As the owner, I want the app to build to a static bundle that deploys to GitHub Pages
    under `/spirit-island/` unchanged, so that I can host it for free and share a link.

## Implementation Decisions

### Architecture

- **Stack:** Vite + React + TypeScript, minimal dependencies. Static build, no backend, no
  API keys. Deploys to GitHub Pages unchanged; Vite `base` set to `/spirit-island/` now.
- **Domain layer is framework-free.** All recommendation logic lives in pure TypeScript
  modules (dataset in → result out), which the React app merely calls. This is both the
  architecture principle (*cleverness in the scoring function and data model, not the
  framework*) and what makes the four test seams clean.
- **Hand-maintained data files:** only `spirits.json` and `tiers.json`. Everything else is
  generated code the owner won't touch. Spirit artwork is a one-time asset drop, not ongoing
  data.

### Dataset (`spirits.json`)

Per spirit: `name`, `expansion`, `complexity` (Low | Moderate | High | Very High),
`ratings` `{offense, control, fear, defense, utility}` (printed OCFDU values), `elements`,
`summary` (1–2 sentences), `tags` (playstyle: ramping-economy, board-control, coastal,
token-heavy, incarnate, blight-positive, …), `aspects` `[{name, delta, shiftsToward}]`, and
`notes` (player-count / setup quirks). `shiftsToward` is a lightweight hint (one or two axis
tokens, e.g. `+utility`) derived from the wiki's aspect description — **not** a full OCFDU
delta. Spirit image path is derived from a name slug (`public/spirits/<slug>.webp`); an
optional explicit `image` field overrides for names that don't slugify cleanly.

### Scoring engine (pure module — **Seam 1**)

`recommend(spirits, weights, options) → RankedSpirit[]`.

- **Fit** = weighted dot product over OCFDU: `Σ weight[d] × rating[d]`. Chosen over a
  distance-to-target metric so that surplus capability in un-asked dimensions is *not*
  penalised.
- **Tempo** and **board-control** are two additional preference axes fed by tag boosts
  (OCFDU cannot express "slow snowball" or "positioning puzzle"). All other tags are
  display / team-gap only, not scored.
- **Complexity** is *not* in the weighted sum. In recommender mode it is a **soft penalty**
  scaled by a user-set complexity-importance weight and the spirit's complexity level above
  the stated tolerance (steep enough to bury Very-High when simplicity is wanted, never
  hard-removing them so the wildcard can reach past). In **random chooser** mode complexity
  is a **hard filter** on the pool.
- **Tier prior** blends as a transparent **additive bonus**: `score = normalize(fit) + α ·
  normalize(tierPrior)`, both min-max normalised across the pool. Knob `α ∈ [0, α_max]`:
  `α = 0` ignores tiers entirely ("something fresh"), `α_max` weighs them heavily. Prior is
  additive (fit always counts at weight 1) so max-strength never overrides the questionnaire.
  Explicitly **not** a literal Bayesian posterior — a weighted sum is chosen for
  explainability and debuggability.
- **Output contract:** top-5 shortlist, top 3 emphasised each with a one-line "why you"
  string, plus 1 wildcard (a deliberately off-profile or above-complexity-cap pick) and a
  reroll. Ties broken by tier prior, then stably (e.g. alphabetical).

### Questionnaire → weights (pure module — **Seam 2**)

`answersToWeights(answers) → { weights, tempo, boardControl, complexityImportance,
complexityCeiling, tierKnob, elementAffinity }`.

- **10 single-select questions + player count** (a setup field, not a scored question).
  Each answer contributes a vector of weight deltas; deltas sum across answers. The
  answer→delta mapping is authored config (the one place "cleverness in the data model"
  lives).
- Questions are composite/experiential, not per-axis sliders — the audience includes
  newcomers who don't know the mechanics. Coverage is redundant on purpose (each OCFDU axis
  is touched by ≥2 questions) so single noisy answers average out.
- The 10 questions (final wording refined during data-build):
  1. How you like to beat opponents → O/C/F/D/U spread (main spreader)
  2. Gut reaction to a threat → O/C/F/D/U (reinforce)
  3. One thing brilliantly vs. many options → Utility disambiguation
  4. Huge decisive turns vs. steady pressure → burst (O/F) vs. grind (C/D)
  5. **Early-game or late-game focused** → tempo
  6. Feelings on fiddly positioning puzzles → board-control
  7. How much complexity/bookkeeping you enjoy → complexity-tolerance
  8. How well the player knows Spirit Island → complexity ceiling (newcomer lever)
  9. Drawn to a particular element/theme → element tags (**light weight**, tiebreak/flavour)
  10. Raw power vs. something fresh → sets the strength-vs-novelty tier knob
- Q10 folds the tier knob into the wizard as a question but only sets its *initial*
  position; the live board still exposes it as an adjustable control.

### Team coverage (pure module — **Seam 3**)

`analyzeTeam(chosenSpirits) → { elementCoverage, roleGaps }`. Pure arithmetic over the
teammates' OCFDU vectors and element tags — element spread and role gaps (e.g. "no Defense",
"zero Fear generation"). Powers the coverage panel and the deterministic "tune toward the
gaps" weight-nudge. **No synergy/combo reasoning** — that is judgment, deferred to the v2
Ask-Claude layer.

### Tier store (persistence module — **Seam 4**)

Public API `getTier(spiritId)`, `setTier(spiritId, tier)`, `reset()`, seeded from
`tiers.json` (flat S/A/B/C/D, community-consensus) and overlaid with the user's edits in
`localStorage`. Editing UI is a per-spirit S/A/B/C/D control — **not** drag-and-drop, and a
single list (multi-list is v2).

### Persistence

`localStorage` holds (a) tier-list edits and (b) last questionnaire answers. Nothing else in
v1.

### UI

Three tabs (Recommender / Browser / Tier list). Random chooser is a mode inside Recommender.
Results include an inline-SVG OCFDU radar (~5-axis polygon, no charting dependency). Spirit
art is cropped-illustration WebP thumbnails (uniform aspect), lazy-loaded, shipped in the
public repo. UI is deliberately conventional/boring glue over the domain modules.

## Testing Decisions

**What makes a good test here:** assert *external behaviour* of the pure domain functions —
inputs (fixture spirits + parameters) to outputs (rankings, weight vectors, gaps) — never
implementation details, never the React tree, never `localStorage` internals. Use a small
hand-built fixture set of spirits (not the full dataset) so expected orderings are
hand-verifiable.

Modules under test (the four seams):

1. **Scoring engine** (`recommend`) — the highest-value seam. Example behaviours: high
   Offense weight ranks Lightning above Bringer; cranking novelty (`α = 0`) removes tier
   influence; a first-timer's steep complexity penalty buries Starlight; surplus capability
   does not lower a spirit's score; the wildcard is off-profile relative to the top 3.
2. **Answer→weights mapping** (`answersToWeights`) — the "hit hard and fast" answer yields a
   high Offense weight + fast tempo; the "first time" experience answer caps complexity;
   redundant questions accumulate rather than overwrite.
3. **Team coverage** (`analyzeTeam`) — three offense spirits report a Defense gap and zero
   Fear generation; element coverage is the union of teammates' element tags.
4. **Tier store** — through its public API only: `setTier` then `getTier` round-trips;
   `reset` restores the seeded default; edits survive a simulated reload.

No prior art exists (greenfield repo). Establish these as the first tests. UI is not
unit-tested beyond at most one smoke render — it is boring glue and the logic it wires lives
behind the four seams. No component tests, no e2e in v1.

## Out of Scope

- **LLM integration of any kind** (the v2 "Ask Claude" prompt-copy button, and any real API
  calls). No API keys in a static client.
- **Curated adversary/scenario compatibility matrix** — never (maintenance swamp; judgment
  deferred to the v2 LLM layer).
- **Synergy/combo reasoning** in team play — v1 does factual coverage only.
- **Per-player-count tier lists** — v1 tiers are flat; player count only annotates results
  via `notes`.
- **Drag-and-drop tier building** and **multiple named tier lists** — v2.
- **"Played before" flags** and **personal per-spirit ratings** — v2.
- **Aspects as first-class scored/ranked items** — v1 treats them as nudge annotations only.
- **Reddit-scraped / video-transcribed 4-player tier data** — future exploration.
- **Progressive/composite question refinements beyond the 10-question set** — v1.1 polish.

## Further Notes

- **Data-build is a separate workstream** from app code, sourced from the Spirit Island wiki
  and the owner's YouTube tier-list references: transcribe the 5 missing Horizons spirits'
  OCFDU + complexity; author 1–2 sentence summaries for all spirits (sanity-checking the
  bracketed icon interpretations on the reference sheet); derive each aspect's `shiftsToward`
  hint; seed `tiers.json` with a community-consensus flat list; acquire and crop spirit
  artwork. The OCFDU numbers and complexity already transcribed in the HANDOFF are
  authoritative (from print).
- **Phase 0 (repo bootstrap) is done:** the public repo `AdamKubovic/spirit-island` exists,
  `main` is pushed, git identity is set. Remaining Phase-0-adjacent step: scaffold the Vite
  app and enable GitHub Pages (Settings → Pages → GitHub Actions) once there's something to
  deploy.
- The owner is a senior data scientist (Python-native); keep the TS/React surface
  conventional. The interesting code is the scoring function and data model.
- Full source context: `HANDOFF_spirit_island_recommender.md` at repo root (includes the
  authoritative OCFDU ratings table).
