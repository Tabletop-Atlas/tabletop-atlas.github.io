# Handoff: Spirit Island Spirit Recommender

> **⚠ Superseded. This document predates v1.** It is preserved for two things that are still
> authoritative: the **transcribed OCFDU ratings table** below (from the owner's printed reference
> sheet) and the **owner profile**. Everything else describes a plan, not the app.
>
> For what the app is now, read `.scratch/v2/PRD.md` and `.scratch/v2/README.md`.
> v1's own record is `.scratch/spirit-recommender/PRD.md`.
>
> **Decisions below that v2 reversed — do not act on them:**
> - *"Aspects … not first-class items."* v2 made the **configuration** (a base spirit, or that
>   spirit with exactly one aspect) the unit of recommendation. The tier list ranks all 68.
> - *"Persistence: any local state … or fully stateless v1."* Settled: `localStorage`, with a seed
>   fingerprint that discards overrides when the shipped data changes, plus versioned export/import.
> - *"LLM layer (v2, not v1): an Ask Claude button."* Deferred again, to v3.
> - The open questions in the final section were all answered by v1's PRD. Read that instead.

**Original next-session purpose (historical):** Grill the owner on remaining open points, produce a PRD, then build v1 of a local web app in Claude Code.

## What this is

A personal tool (sole user, local-first, GitHub Pages later) for Spirit Island with all expansions owned (Base, Branch & Claw, Jagged Earth, Feather & Flame/promos, Nature Incarnate, Horizons). Two capabilities:

1. **Overview browser** — all spirits with 1–2 sentence "how it plays" summaries, filterable/sortable.
2. **Recommender** — short questionnaire → top-3 spirit (or spirit + aspect) recommendations + one wildcard pick + reroll; plus a constrained random chooser.

## Decisions already made (do not re-litigate)

- **Platform:** Web app, Vite + React + TypeScript, minimal dependencies. Static build so it deploys to GitHub Pages unchanged. (A Claude Skill / prompt-pack approach was considered and explicitly dropped when scope narrowed to sole user.)
- **Architecture principle:** *Deterministic where facts live, stochastic only where judgment lives.* The recommender core is a rule-based weighted scoring function over a static dataset — no LLM in v1.
- **Hand-maintained files:** only `spirits.json` and `tiers.json`. Everything else is generated code the owner won't touch.
- **Tag backbone:** the officially printed per-spirit ratings — Complexity + Offense/Control/Fear/Defense/Utility (OCFDU) — transcribed below from the owner's reference sheet. These define the questionnaire dimensions.
- **Aspects:** in scope as collapsible "variants" under each spirit with one-line deltas; recommended only on strong questionnaire match (e.g., Lightning but supportive → Wind aspect). Not first-class items.
- **Tier prior:** `tiers.json` is a hand-editable S/A/B/C/D list (optionally per player count) treated as a Bayesian prior over the questionnaire-fit likelihood. A UI knob slides between "strength-seeking" (prior weighted heavily) and "try something new" (prior ignored). Ship pre-filled with community-consensus tiers, clearly marked as editable.
- **Adversary/scenario fit and team synergy:** NOT a curated matrix in v1 (maintenance swamp). Team synergy v1 = mechanically derive element coverage and role gaps (nobody has Defense, no Fear generation, etc.) from the dataset tags.
- **LLM layer (v2, not v1):** an "Ask Claude" button that assembles current context (filters, other players' chosen spirits, adversary/scenario, relevant `spirits.json` slice) into a structured prompt copied to clipboard for pasting into Claude. No API keys in a static client. Real API integration only if a backend is ever added.
- **Output contract:** top 3 recommendations each with a one-line "why you specifically," + 1 deliberately spicy wildcard, + reroll. Random mode = uniform draw filtered by stated constraints ("random but low complexity").

## Owner profile (relevant to code style)

Senior data scientist, Python-native (polars, vectorized-over-loops, clean class structure, uv, marimo). Not a frontend dev — keep the TS/React surface conventional and boring; cleverness goes in the scoring function and data model, not the framework usage.

## Dataset schema (agreed)

Per spirit in `spirits.json`:

- `name`, `expansion`, `complexity` (Low | Moderate | High | Very High)
- `ratings`: `{ offense, control, fear, defense, utility }` (printed values, see table below)
- `elements` (primary element profile)
- `summary` (1–2 sentence how-it-plays)
- `tags` (playstyle: ramping-economy, board-control, blight-positive, token-heavy, incarnate, coastal, etc.)
- `aspects`: `[{ name, delta }]` one-line description of how each aspect changes play
- `notes` (player-count / setup quirks)

## Transcribed ratings (from owner's reference sheet image)

Numbers below are O C F D U. **Numbers and complexity are authoritative** (transcribed from print). Playstyle notes used icons; bracketed interpretations should be sanity-checked against the wiki when writing summaries.

| Spirit | Complexity | O C F D U | Playstyle note |
|---|---|---|---|
| Lightning's Swift Strike | Low | 5 2 3 1 2 | Full attack and swiftness |
| River Surges in Sunlight | Low | 4 5 1 1 4 | Synergy with [Dahan], repels invaders |
| Vital Strength of the Earth | Low | 2 3 1 5 3 | Slow growth, defensive, few playable Powers at start |
| Shadows Flicker Like Flame | Low | 4 3 5 1 1 | Plays with [Fear], useful against [Explorers], low damage |
| Thunderspeaker | Moderate | 4 5 3 2 1 | Heavily uses [Dahan] |
| A Spread of Rampant Green | Moderate | 4 3 2 5 4 | Useful against [Towns], fast growth, good defender |
| Ocean's Hungry Grasp | High | 5 4 4 3 2 | Strong coastal, weak inland; deals [Fear], damages [Towns]/[Cities] |
| Bringer of Dreams and Nightmares | High | 1 2 5 2 2 | Transforms damage into [Fear]; plays on terror level |
| Sharp Fangs Behind the Leaves | Moderate | 3 3 4 2 1 | Relies on [Beasts], weakens with [Blight] |
| Keeper of the Forbidden Wilds | Moderate | 5 2 1 4 3 | Uses [Wilds], slows [Explorer] progression |
| Heart of the Wildfire | High | 5 3 4 1 2 | Uses [Blight] to develop itself; offensive |
| Serpent Slumbering Beneath the Island | High | 2 2 2 4 5 | Slow-growing, becomes powerful |
| Stone's Unyielding Defiance | Moderate | 4 2 1 5 2 | [Badlands] tokens, strong in [mountain] lands, fights [Blight] effects |
| Shifting Memory of Ages | Moderate | 1 2 2 4 5 | Gains Powers (esp. Major), defensive, elemental tokens |
| Grinning Trickster Stirs Up Trouble | Moderate | 4 3 2 5 4 | [Strife] and [Beast] tokens, exploits Minor Power randomness |
| Lure of the Deep Wilderness | Moderate | 4 4 4 2 1 | [Beasts]/[Disease]/[Wilds]/[Badlands] tokens; good inland, anti-[Explorer] |
| Many Minds Move as One | Moderate | 1 5 5 5 1 | Heavy [Beast] tokens, good defender, generates [Fear] |
| Volcano Looming High | Moderate* | 5 1 2 1 3 | Strong in [mountain] lands, heavy [Presence] use, needs tempo (*complexity cell blank on sheet — verify) |
| Shroud of Silent Mist | High | 4 4 5 2 1 | [Presence] placement; strains Invaders, prevents healing |
| Vengeance as a Burning Plague | High | 5 2 3 1 1 | [Disease]/[Badlands]; exploits [Blight]; offensive vs [Towns]/[Cities] |
| Starlight Seeks Its Form | Very High | 1 1 1 2 2 | Sandbox spirit, very open-ended |
| Fractured Days Split the Sky | Very High | 1 2 1 3 5 | Few [Presence] tokens (blight-sensitive); plays with Powers + Presence track |
| Downpour Drenches the World | High | 2 1 3 5 3 | Anti-[Blight], defensive; repeats same power multiple times per turn |
| Finder of Paths Unseen | Very High | 1 5 1 2 2 | Positioning of Invaders/[Dahan]/tokens; isolates lands |
| Hearth-Vigil | Moderate | 3 2 3 4 4 | Boosts [Dahan] |
| Towering Roots of the Jungle | Moderate | 1 3 3 5 2 | Protects land, uses [Vitality?], Incarnate |
| Ember-Eyed Behemoth | Moderate | 6 1 1 1 2 | [Wilds?] tokens, very mobile [Presence], Incarnate |
| Relentless Gaze of the Sun | High | 6 1 4 2 4 | Aggressive; plays on lands with 3+ [Presence] |
| Wandering Voice Keens Delirium | High | 3 5 4 2 3 | Mobility and [Strife] tokens, Incarnate |
| Wounded Waters Bleeding | High | 4 6 2 1 1 | Movement and [Beast] tokens |
| Breath of Darkness Down Your Spine | High | 2 4 5 1 2 | Capture / Endless Dark zone, strong vs [Explorers], Incarnate |
| Dances Up Earthquakes | Very High | 4 1 1 2 3 | Anticipation and [Quake?] tokens |

**Missing from the sheet — must be pulled from the Spirit Island wiki (agreed task):** the 5 Horizons spirits — Devouring Teeth Lurk Underfoot, Eyes Watch From the Trees, Fathomless Mud of the Swamp, Rising Heat of Stone and Sand, Sun-Bright Whirlwind — printed OCFDU + complexity (all expected Low). Also compile the aspects list (Branch & Claw, Jagged Earth, Feather & Flame, Nature Incarnate aspects) with one-line deltas, and verify the bracketed icon interpretations above while writing summaries.

## Open questions for the grilling / PRD session

- Questionnaire design: how many questions, which dimensions map to OCFDU vs tags vs complexity, single-select vs sliders, tie-breaking (random vs show top-3 already covers this?).
- Scoring function: distance metric over the OCFDU vector vs weighted dot product; how tags enter (hard filters vs soft boosts); exact math of the tier-prior blend knob.
- Tier list source: which community tier list seeds `tiers.json`; per-player-count tiers in v1 or flat.
- Aspect recommendation trigger: what counts as a "strong match."
- Multi-player flow in v1: does the UI support "3 friends already picked X, Y, Z" gap analysis, or is that v2 with the Ask-Claude button?
- Persistence: any local state (played-before flags, personal ratings) via localStorage, or fully stateless v1.
- GH Pages: repo name / base path config now or later.

## Suggested skills for the next session

- **grill-me** — the owner explicitly wants to be grilled into a PRD before any code is written. Start here with the open questions above.
- **ponytail** — apply when scaffolding: the owner dislikes messy/bloated code; keep dependencies minimal and resist over-engineering the v1 scoring function.
- **frontend-design** (or local equivalent) — when building the UI, so the overview/recommender doesn't look like a default template.

## Out of scope / explicitly deferred

- LLM API integration, backend, auth — v2+.
- Curated adversary/scenario compatibility matrix — never (LLM judgment via prompt-copy instead).
- Multi-user distribution (skill packaging, friend sharing) — scrapped.
