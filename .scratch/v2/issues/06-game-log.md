# 06 — Game log: record and browse played games

Status: ready-for-agent

## Parent

`.scratch/v2/PRD.md`

## What to build

A record of what was actually played. **A journal, not a feedback loop.**

- A `gameLog` store: append an entry, list entries, and derive `timesPlayed(configId)`.
- Entry shape:

```jsonc
{
  "id": "<uuid>",                 // crypto.randomUUID() at creation
  "date": "<iso8601>",
  "players": [ { "name": "…", "configId": "shadows-flicker-like-flame::Dark Fire" } ],
  "adversary": "England",
  "adversaryLevel": 4,
  "scenario": "…",                // optional
  "outcome": "win",               // "win" | "loss"
  "terrorLevel": 3,               // optional
  "blightRemaining": 2            // optional
}
```

- **Store adversary + level; derive difficulty.** Difficulty is a computed number, not a typed
  one. Storing the fact lets the log later answer "how do I do against England?".
- **Every entry needs a stable `id`.** Cross-device de-duplication on import is impossible
  without it — this is not decoration.
- A **Log tab**: record a game, browse the history.
- `timesPlayed(configId)` is exported for #07. It is the **only** thing the log feeds into
  scoring, and it is a fact.

### Hard constraint

**Outcomes are recorded and displayed, never scored.** Nothing in the log may adjust a tier, a
weight, or a complexity override. With 68 configurations and a weekly game night, most sit at
zero or one plays for years; a win rate over n=2 is noise, and auto-tuning the tier prior from
it would silently corrupt the one dataset the owner authored personally.

Note: three different things are called "difficulty" in this project — printed Complexity, the
personal complexity override, and Spirit Island's adversary-derived difficulty number. This
issue means the last one. Keep the vocabulary straight in code and UI.

## Acceptance criteria

- [ ] A game can be recorded with players + configIds, adversary, level, and outcome
- [ ] Scenario, terror level and blight remaining are optional
- [ ] Every entry gets a unique `id` at creation
- [ ] Entries persist across reload and are exported/imported via the `log` section
- [ ] On import, log entries **append and de-duplicate by id** (never replace)
- [ ] `timesPlayed(configId)` counts entries containing that configuration
- [ ] **A logged loss leaves `recommend()`'s output byte-identical** — assert this explicitly
- [ ] The Log tab records a game and browses history
- [ ] The store is tested through its public API only, never by poking `localStorage`

## Blocked by

- #01 (backup schema declares `log`, and defines append/dedupe merge)
- #02 (entries reference `configId`)
