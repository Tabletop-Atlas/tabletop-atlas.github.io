# v2 — configurations, personal complexity, game log

**Status: shipped.** All 39 user stories in `PRD.md` are implemented. 174 tests pass; `tsc -b` and
`oxlint` are clean. What remains is listed under "Still open" below.

Start here: read `PRD.md`, then `../../CLAUDE.md`. v1 context lives in
`../spirit-recommender/PRD.md` and `../../HANDOFF_spirit_island_recommender.md` (the latter predates
v1 and is marked superseded — read it for the transcribed ratings table, not for its decisions).

Each issue file carries its own `Status:` line and a `## Comments` section recording how it was
resolved. `grep '^Status:' issues/*.md` is the authoritative view of what is left.

## What shipped

Issues **01–09** built v2 (see the PRD). Issues **10–20** fixed what two review passes found:

- **10** the newcomer ceiling was switched off whenever the enjoyment knob read zero — two questions
  about two different people, sharing one multiplier
- **11** export wrote the whole shipped seed, so importing marked an untouched app as customised
- **12** import replaced tiers, overrides and answers without warning
- **13** aspect rows displayed their base spirit's printed complexity
- **14, 19** a malformed log entry imported successfully, then threw on every render of the
  Recommend tab — the default tab, so the app was unrecoverable without clearing storage
- **15** overrides discarded by a seed-fingerprint change vanished silently
- **16** the adversary was free text, fragmenting the win-rate statistic on typos
- **18, 20** cleanups

## ⚠ The sequencing constraint that shaped v2 (historical, now satisfied)

**#01 (export/import) had to land before #02 (68-key tier seed).** Growing `tiers.json` from 37 to
68 keys changes its seed fingerprint, and `tierStore` discards overrides stamped with a stale
fingerprint — deliberately, because that behaviour fixes a real v1 bug where stale browser edits
silently shadowed a new seed. Doing #02 first would have destroyed any tier edits made in a browser.

**This constraint is permanent, not spent.** Any future change to `tiers.json` or to a spirit's
printed `complexity` moves the fingerprint and discards the owner's overrides. Since #15 the app at
least *reports* the loss. v3 should assume it still applies.

## Still open

- **#17 — terror-level range** (`ready-for-human`). The log's terror-level input caps at 3. It may
  need to be 4; reaching Terror Level 4 is believed to be a win condition. Deliberately not handed
  to an agent — see the failure mode below. Needs someone to read the rulebook.
- **#21 — the random drawer still draws base spirits** (`needs-triage`). It filters on printed
  `complexity`, so it cannot see that Shadows–Reach is simpler than base Shadows. A design call:
  no user story covers the drawer.
- **#22 — the aspect nudge and the sibling list overlap** (`needs-triage`). Looks like a cleanup,
  isn't: `findAspectNudge` is the *only* consumer of `shiftsToward`, which the PRD defers to a
  follow-on phase. Deleting the nudge loses the hint.

## Principles (from the PRD and CLAUDE.md)

- Domain logic is framework-free pure TS. React is boring glue. The four v1 seams (`recommend`,
  `answersToWeights`, `analyzeTeam`, `tierStore`) plus the new ones (`configurations`,
  `complexityStore`, `backup`, `gameLog`) are where the tests live.
- Test external behaviour against small fixtures. Never poke `localStorage`. Never assert on the
  React tree. The one UI test is a server-rendered smoke check.
- Only `spirits.json` and `tiers.json` are hand-maintained data.

## ⚠ This repo has a documented failure mode: agents invent data

Three separate times, an agent asked a source for data it did not have, and **wrote a plausible
guess instead of reporting the gap**:

1. **Horizons OCFDU ratings** — invented. No printed source exists; they are now marked
   `ratingsSource: "estimate"`.
2. **Elements** — wrong on 7 of 9 spirits checked. Element affinity is a *scored* input, so this
   silently degraded rankings.
3. **Aspects** — five were fabricated outright (Sunshower, Entangling, Wrath, Reverie) and Regrowth
   was filed under the wrong spirit. The app shipped a nudge recommending an aspect that does not
   exist.

Rules for v2:

- **If a source cannot answer, the field is ABSENT. Never estimated.** `findAspectNudge` no-ops on a
  missing `shiftsToward`; that silence is the correct behaviour.
- **Any new dataset arrives with a tripwire test.** See `aspectCanon.test.ts` — a deliberate
  duplication of canonical data that fails when the dataset drifts.
- **Data whose provenance is judgment must be marked** (`ratingsSource`, `shiftsToward`).
- **The aspect card images are readable.** `WebFetch` renders wiki pages to markdown and throws the
  images away — the rules text lives *in* those images. Download and read them directly. That is how
  all 31 aspect effects were transcribed.

Rules added during v2:

- **The adversary set** (`src/data/adversaries.json`) was transcribed one wiki page at a time and is
  pinned by `adversaryCanon.test.ts`. Note what a tripwire written alongside its data actually
  protects against: drift, not fabrication. Independent verification is still a human job.
- **#17 exists because of this failure mode.** A reviewer was *fairly sure* about a rules detail.
  Fairly sure is how the five fabricated aspects shipped.

## Waiting on the human

- **#17** — read the rulebook, settle the terror-level range.
- **#21, #22** — two design calls, neither urgent.
- Spot-check the 31 aspect tiers in #02 against `my-image.png` when convenient — they were
  transcribed and cross-checked against canon, but they are the owner's own data.
