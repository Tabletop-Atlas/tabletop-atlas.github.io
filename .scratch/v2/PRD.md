# PRD: Spirit Island Recommender v2 — configurations, personal complexity, and a game log

Status: done

## Problem Statement

v1 recommends **spirits**. But the thing I actually choose at the table is a **spirit plus
(optionally) one of its aspects** — and my own tier list already says those are different
things. On my TierMaker board, base *Shadows Flicker Like Flame* sits in **F** while its
*Dark Fire* aspect sits in **C**: three tiers apart. v1 throws that away entirely. Aspects
can only ever appear as a passing "you might like this" nudge, never as something the
recommender ranks.

Three further gaps, all discovered while living with v1:

1. **The printed Complexity number is not always right.** Community and designer ratings
   disagree with my experience. I have no way to record my own read, so the complexity
   penalty scores against a number I don't believe.
2. **The aspect cards carry a printed complexity arrow** (24 raise complexity, 4 leave it
   level, 3 *lower* it). v1 doesn't know this exists, so it can hand a first-timer the
   *harder* configuration of a Low-complexity spirit.
3. **Nothing I do in the app survives my browser cache**, and I have no record of what I've
   played. "Something fresh" currently means "ignore the tier list" — it should mean
   "something I have literally never played."

## Solution

v2 changes the **unit of recommendation** from a spirit to a **configuration**: a base spirit,
or that spirit with exactly one aspect applied. Base is the "no aspect" configuration.

- The tier list expands from 37 spirits to **68 configurations** — a faithful reproduction of
  the owner's TierMaker board, which already ranks all 68.
- A configuration's **fit** is inherited from its base spirit's OCFDU. Its **strength** comes
  from its own tier. Neither requires inventing data: aspects have no printed OCFDU, and the
  tier is data the owner authored personally.
- A configuration's **effective complexity** = base complexity + the aspect's printed
  `complexityDelta`, clamped at Very High. A first-timer can now be steered toward
  *Shadows–Reach* (which the card says is **simpler**) and away from *Shadows–Dark Fire*.
- A **personal complexity override** lets the owner correct a printed number they disagree
  with — without corrupting the newcomer safeguard.
- A **game log** records what was played and how it went. Exactly one fact from it —
  `timesPlayed` — feeds scoring, giving the novelty knob a concrete meaning.
- **Export/import** of the whole app state, so none of the above dies with a browser cache.

## User Stories

### Configurations as the unit of recommendation

1. As a player, I want the recommender to consider spirit-plus-aspect combinations, so that a
   strong aspect of a weak spirit can be recommended to me.
2. As a player, I want a recommendation to name the configuration ("Shadows Flicker Like
   Flame — play the **Dark Fire** aspect"), so that I know exactly what to put on the table.
3. As a player, I want the base spirit treated as a first-class "no aspect" configuration, so
   that "just play it plain" is always an available answer.
4. As a player, I want at most one configuration of a given spirit in my top 3, so that I
   don't burn two of three slots on the same spirit.
5. As a player, I want the other configurations of a recommended spirit listed inside its
   expanded row (with their tiers), so that after choosing the spirit I can choose the aspect.
6. As a player, when nothing in my answers distinguishes a spirit's configurations, I want the
   **base** configuration recommended, so that an aspect is only ever suggested for a reason.
7. As a player, I want a configuration's fit to come from its base spirit's OCFDU, so that the
   recommender never relies on invented aspect ratings.
8. As a player, I want a configuration's strength to come from its own tier, so that my own
   opinion of the aspect drives the ranking.

### Complexity from the aspect cards

9. As a player, I want an aspect's printed complexity arrow to change the configuration's
   effective complexity, so that the complexity penalty scores the thing I'll actually play.
10. As a first-timer's host, I want the recommender to prefer complexity-lowering aspects
    (Reach, Unconstrained, Stranded) for a newcomer, so that a simple spirit stays simple.
11. As a first-timer's host, I want complexity-raising aspects buried for a newcomer, so that
    a Low-complexity spirit isn't handed over in its hardest configuration.
12. As a player, I want effective complexity clamped at Very High, so that an aspect can't push
    a spirit off a scale the game doesn't print.

### Personal complexity override

13. As an experienced player, I want to override a spirit's printed Complexity with my own
    read, so that the penalty scores against a number I actually believe.
14. As a player, I want my override to seed from the printed value, so that the app is correct
    on first launch with no setup.
15. As a player, I want to reset a spirit's complexity back to the printed value, so that I can
    undo my own opinion.
16. As a host, I want the **newcomer ceiling** to always read the **printed** complexity, never
    my override, so that my familiarity with a spirit never lands a stranger with it.
17. As a player, I want my **enjoyment preference** ("how fiddly do I want tonight") to read my
    override, so that my taste is scored against my own read.
18. As a player, I want printed complexity to remain untouched in the dataset, so that fact and
    judgment stay separable — as with `ratings` and `ratingsSource`.

### Game log

19. As a player, I want to record a played game, so that I have a history of what I've played.
20. As a player, I want to record each player's name and the configuration they played, so that
    the log reflects a real table.
21. As a player, I want to record the adversary and its level, so that the game's difficulty is
    captured as a fact rather than typed in as a number.
22. As a player, I want the scenario recorded optionally, so that unusual games are
    distinguishable.
23. As a player, I want to record the outcome (win or loss), so that I can look back at how a
    spirit went.
24. As a player, I want to optionally record terror level and remaining blight, so that a close
    win reads differently from a rout.
25. As a player, I want to browse my logged games, so that I can remember what happened.
26. As a player, I want honest descriptive statistics (games played, win rate by complexity, by
    spirit, by adversary), so that I can draw my own conclusions.
27. As a player, I want the log to **never** silently adjust my tier list or my weights, so that
    the one piece of data I authored personally is not corrupted by a two-game sample.
28. As a player, I want `timesPlayed` per configuration derived from the log, so that "never
    played" is a fact rather than a flag I maintain by hand.
29. As a player, I want the "something fresh" end of the strength↔novelty knob to favour
    configurations I have never played, so that the knob means something concrete.
30. As a player, I want each log entry to carry a stable unique id, so that merging logs from
    two devices doesn't duplicate or lose games.

### Export / import

31. As a player, I want to export my whole app state to a file, so that my tier list, complexity
    overrides and game log survive a cleared browser cache.
32. As a player, I want to import that file, so that I can restore or move to another device.
33. As a player, I want the exported file to be versioned, so that a future app can read an old
    backup.
34. As a player, I want importing to **replace** my tiers, complexity overrides and answers, so
    that a restored opinion is coherent rather than a merge of two opinions nobody holds.
35. As a player, I want importing to **append and de-duplicate** my game log, so that merging
    two devices' histories never destroys a played game.
36. As a player, I want the import to tell me what it could not resolve (unknown ids), so that
    data loss is reported rather than silent.
37. As a player, I want to be warned before any action that discards saved data (resetting
    tiers; a shipped-seed change invalidating my overrides), so that I can export first.
38. As a player, I want a backup taken today to restore losslessly after the tier seed grows
    from 37 to 68 keys, so that the upgrade doesn't cost me my edits.

### Housekeeping

39. As a player, I want the player-count I entered in the wizard to actually do something
    (surface player-count-relevant notes), so that the question isn't a lie.

## Implementation Decisions

### The hard sequencing constraint

**Export/import ships before `tiers.json` grows from 37 to 68 keys.** Bumping the seed changes
its fingerprint, and `tierStore` discards overrides stamped with a stale fingerprint (by
design — see the v1 stale-overrides bug). Without export/import first, the upgrade silently
destroys any tier edits made in the browser. This is an ordering dependency, not a preference.

### Configuration as the unit (new pure module)

- A **configuration** is a base spirit, or a base spirit with exactly one aspect applied.
  37 spirits + 31 aspects = **68 configurations**.
- `configId`: the spirit's id for a base configuration; `"<spiritId>::<Aspect Name>"` for an
  aspect configuration. Ids are stable and are the keys used by `tierStore`, the game log, and
  the backup file.
- `expand(spirits) → Configuration[]` is pure: `{ configId, spirit, aspect?, isBase,
  effectiveComplexity }`.
- **Fit is inherited** from the base spirit's OCFDU, unmodified. Aspects have no printed OCFDU
  and none will be invented. (Bending fit by `shiftsToward` is a deliberate follow-on phase —
  see Out of Scope.)
- **Strength** is the configuration's own tier.

### Effective complexity

`effectiveComplexity = clamp(COMPLEXITY_LEVEL[base] + delta, Low, Very High)` where the aspect's
printed `complexityDelta` maps `up → +1`, `same → 0`, `down → −1`. Clamped at Very High: the game
prints no higher grade. `complexityPenalty()` already takes a level and a ceiling; it is passed the
effective level. No new scoring machinery.

### Dedup and tie-breaking

- The shortlist contains **at most one configuration per base spirit**: the best-scoring one.
- **Ties break toward the base configuration.** Under inherited fit, sibling configurations are
  fit-identical by construction; with the novelty knob at zero and complexity indifference they
  score *exactly* equal. Without this rule the app would recommend an arbitrary aspect for no
  reason. An aspect must **earn** its way past base via tier, complexity fit, or novelty.
- After `isBase`, fall back to a stable order so ranking is deterministic across reloads.
- The expanded row lists the spirit's other configurations with their tiers.

### Personal complexity override (new store, `tierStore` pattern)

- Public API mirrors `tierStore`: get, set, reset, getAll, isCustomised. Seeds from the printed
  value in `spirits.json`; overlays user edits in `localStorage`; stamped with a seed fingerprint
  and discarded when the shipped seed changes.
- Printed `complexity` stays untouched in the dataset — fact and judgment remain separable,
  exactly as `ratings` vs `ratingsSource`.
- **The split rule (load-bearing):**
  - the **newcomer ceiling** (from the *"how well does the player know Spirit Island"* question)
    reads **printed** complexity;
  - the **enjoyment preference** (from the *"how much complexity do you enjoy"* question) reads
    the **override**.
  Rationale: an override encodes *the owner's* familiarity. A stranger at the table does not
  share it, and the newcomer question is the single most valuable safeguard in the questionnaire.
- Aspects are **not** individually overridable; their printed arrow stands.

### Game log (new store)

- Entry shape: `{ id (uuid), date, players: [{ name, configId }], adversary, adversaryLevel,
  scenario?, outcome: 'win' | 'loss', terrorLevel?, blightRemaining? }`.
- **Adversary + level are stored; difficulty is derived.** Storing the fact rather than the
  computed number lets the log answer "how do I do against England?" later.
- Every entry gets `crypto.randomUUID()` at creation. Not for elegance — cross-device dedupe is
  impossible without a stable id.
- **The log feeds exactly one thing into scoring: `timesPlayed(configId)`**, a fact. It is
  consumed by the novelty end of the strength↔novelty knob, so "something fresh" favours
  configurations never played.
- **Outcomes are recorded and displayed, never scored.** With 68 configurations and a weekly game
  night, most sit at zero or one plays for years; a win rate over n=2 is noise. Auto-tuning the
  tier prior from it would silently corrupt the one dataset the owner authored personally.
  Descriptive statistics are shown; the human turns the knobs. Same discipline as the team
  coverage panel.

### Backup file (new pure module)

```jsonc
{
  "schemaVersion": 1,
  "exportedAt": "<iso8601>",
  "tiers":               { "<configId>": "X" },
  "complexityOverrides": { "<spiritId>": "Moderate" },
  "answers":             { "<questionId>": "<value>" },
  "log": [ /* entries as above */ ]
}
```

- **The file carries no seed fingerprint.** The fingerprint is a `localStorage` staleness guard,
  not a file format. An import is a deliberate human act, so imported overrides are stamped with
  the **current** fingerprint and survive.
- Keys are stable ids resolved against the current dataset on import. When the seed grows 37 → 68,
  every existing spirit key still resolves and the 31 new aspect configs fall back to neutral —
  **a backup taken today restores losslessly tomorrow.** This only works because the fingerprint
  is absent from the file.
- **Merge policy differs per section, and the asymmetry is the design:**
  - `tiers`, `complexityOverrides`, `answers` → **replace** (a single coherent opinion; merging
    two tier lists produces one nobody holds).
  - `log` → **append, de-duplicated by entry id** (an accumulating record; replacing destroys
    games).
- Import **reports unresolved ids** rather than throwing or silently dropping them.
- Export is **manual**. The app warns before any action that discards saved data — specifically
  "Reset tiers" and a fingerprint invalidation.

### UI

- Tier list tab renders all 68 configurations grouped by tier — a faithful reproduction of the
  owner's TierMaker board.
- Customise tab gains complexity overrides alongside tier assignment, and Export / Import.
- A new Log tab: record a game, browse history, see descriptive statistics.
- Result rows name the configuration and list sibling configurations when expanded.
- The command-deck shell, sidebar of live controls, and result rows are unchanged in shape.

## Testing Decisions

**What makes a good test here:** assert the *external behaviour* of pure domain functions and of
store public APIs. Never poke `localStorage`, never assert on the React tree. Use small hand-built
fixtures so expected orderings are hand-verifiable. Prior art: `recommend.test.ts` (ranking
behaviour), `tierStore.test.ts` (public API only, including the stale-seed guard),
`aspectCanon.test.ts` (a deliberate duplication of canonical data as a tripwire), and the single
server-rendered `appSmoke.test.tsx`.

Modules under test:

1. **`configurations`** (new pure seam) — 68 configurations produced; base is `isBase`; effective
   complexity applies `up/same/down`; **clamped at Very High** (an `up` aspect on Dances Up
   Earthquakes stays Very High); a `down` aspect on a Low spirit stays Low.
2. **`recommend`** (existing Seam 1, extended) — a high-tier aspect config outranks its low-tier
   base; **at `tierKnob = 0` with complexity indifference, siblings tie and base wins**; a
   complexity-lowering aspect outranks base for a first-timer; a complexity-raising aspect is
   buried for a first-timer; the shortlist never contains two configurations of one spirit.
3. **`complexityStore`** (new seam, public API only) — override round-trips; reset restores the
   printed value; stale-seed overrides are discarded (as `tierStore`). **And the split rule: the
   newcomer ceiling ignores the override while the enjoyment preference honours it** — this is the
   subtlest rule in v2 and gets its own test.
4. **`backup`** (new pure seam) — `serialise` then `parse` round-trips; **tiers replace, log
   appends and de-dupes by id**; unknown config ids are reported, not thrown; a bundle exported
   against a 37-key seed imports losslessly into a 68-key seed; a bundle with a future
   `schemaVersion` is rejected with a clear error.
5. **`gameLog`** (new seam, public API only) — append then list; dedupe by id on merge;
   `timesPlayed(configId)` counts entries; **outcomes never affect any tier or weight** (assert a
   logged loss leaves `recommend`'s output unchanged).
6. **`tierStore`** (existing Seam 4) — unchanged public API, now keyed by `configId`; existing
   tests continue to pass against the enlarged seed (they already read the seed rather than
   hardcoding tiers).

UI remains untested beyond the existing smoke render.

## Out of Scope

- **Bending fit by `shiftsToward`** — deliberately a follow-on phase. All 31 aspects now carry a
  transcribed effect and 27 carry an axis hint, so this is unblocked, but v2.0 ships with fit
  inherited from the base spirit. The tie-break rule above was designed under inherited fit.
- **Aspect OCFDU ratings** — no printed source exists. Will not be invented.
- **`shiftsToward` for Immense, Regrowth, Unconstrained, Spreading Hostility** — their cards change
  economy, setup or growth rather than pointing at an OCFDU axis. A test pins this list.
- **Win rate feeding back into tiers or weights.** Explicitly rejected: the sample is too small and
  the corruption would be invisible.
- **The adversary/scenario compatibility matrix.** Still banned. Logging what happened is not the
  same as predicting what will happen; this line is drawn deliberately so the log does not become
  the matrix through the back door.
- **Aspect-level complexity overrides** — the printed arrow stands.
- **Multiple named tier lists** and **per-player-count tiers** — both deferred again.
- **Automatic export** (download nags, cloud sync). Manual only, with warnings before destructive
  actions.
- **The "Ask Claude" prompt-copy button** — deferred to v3.
- **The prototype's "podium" treatment** for the #1 pick — not adopted.
- **Violence's second complexity arrow** (`↓` for *other* players) — the schema models only the
  self arrow. Known omission, not silently dropped.
- **Sparking and Tangles card 2 of 2** — the wiki hosts only card 1. Their `delta` says so.

## Further Notes

- **Aspect tiers are already known.** The owner's TierMaker board labels all 31 aspect tiles
  legibly; they were transcribed as: X — Regrowth; S — Intensify, Nourishing; A — Travel, Sparking,
  Tangles; B — Encircle, Unconstrained, Transforming, Enticing, Violence, Stranded, Lair, Haven,
  Spreading Hostility; C — Locus, Might, Deeps, Wind, Pandemonium, Mentor, Dark Fire; D — Warrior,
  Tactician, Immense, Resilience, Foreboding; F — Amorphous, Reach, Madness, Sunshine. These seed
  the 31 new `tiers.json` entries. They should be re-verified against the image during
  implementation rather than copied on trust.
- **Three different things are called "difficulty" in this project.** Spirit *Complexity* (printed
  rules load), the personal complexity *override*, and Spirit Island's *difficulty* number
  (adversary + level). The log means the last one. Keep the vocabulary straight in code and UI.
- **This project has a documented failure mode:** when a source cannot answer, an agent guesses
  rather than reports. It has produced fabricated Horizons ratings, fabricated elements, and five
  fabricated aspects that shipped to production. Two guards now exist (`aspectCanon.test.ts`,
  `dataIntegrity.test.ts`). Any new dataset in v2 must arrive with a tripwire test, and any field
  that cannot be sourced must be **absent**, never estimated. Data whose provenance is judgment
  must be marked as such (`ratingsSource`, `shiftsToward`).
- **The aspect card images are readable.** `WebFetch` renders wiki pages to markdown and discards
  images; the aspect rules text lives *in* those images. Download and read them directly.
- v1 context: `.scratch/spirit-recommender/PRD.md` and `HANDOFF_spirit_island_recommender.md`.
