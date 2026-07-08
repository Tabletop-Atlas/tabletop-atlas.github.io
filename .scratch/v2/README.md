# v2 — configurations, personal complexity, game log

Start here: read `PRD.md`, then `../../CLAUDE.md`. v1 context lives in
`../spirit-recommender/PRD.md` and `../../HANDOFF_spirit_island_recommender.md`.

Work issues in `issues/` in dependency order. Each issue's `Blocked by` names its prerequisites.

## ⚠ Hard sequencing constraint

**#01 (export/import) must land before #02 (68-key tier seed).**

Growing `tiers.json` from 37 to 68 keys changes its seed fingerprint, and `tierStore` discards
overrides stamped with a stale fingerprint — deliberately, because that behaviour fixes a real bug
where stale browser edits silently shadowed a new seed. Do #02 first and you destroy any tier edits
made in a browser, permanently. This is not a preference.

## Pickup order

```
01 export/import backup        (blocks everything that touches the seed)
        │
        ├── 02 configurations + 68-key tier seed
        │        ├── 03 effective complexity (aspect arrows)
        │        │        └── 05 personal complexity override + split rule
        │        ├── 04 dedup + base-wins tie-break
        │        └── 06 game log ──┬── 07 timesPlayed -> novelty knob
        │                          └── 08 log statistics
        └── (05 also needs 01 for the backup schema)

09 playerCount surfaces notes   (independent — grab any time)
```

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

## Waiting on the human

Nothing blocks. Spot-check the 31 aspect tiers in #02 against `my-image.png` when convenient — they
were transcribed and cross-checked against canon, but they are the owner's own data.
