# TierList schema — contract for the scraping agent

A tier list is a **cited document**, not a table of opinions. The schema's first job is to record
where the tiers came from and what the source never said. Tiers are secondary.

This file is the published contract between the out-of-repo YouTube scraper and this repo.
Settled by `docs/adr/0001-tier-lists-as-cited-documents.md`, which also settles the file layout,
the tripwire test, and the fingerprint migration listed as open below in an earlier draft of this
file.

## The shape

```json
{
  "id": "3mbg-strength-solo-2025",
  "name": "3 Minute Board Games — all official spirits",
  "type": "strength",
  "players": 1,
  "origin": "cited",
  "tierLabels": ["S", "A", "B", "C", "D", "F"],
  "methodology": "Ranks base spirits only; aspects not covered. Solo play assumed throughout.",
  "source": {
    "author": "3 Minute Board Games",
    "title": "Tier ranking all the official spirits in Spirit Island (2025)",
    "url": "https://www.youtube.com/watch?v=d130MTU08fg",
    "published": "2025",
    "retrievedAt": "2026-07-09",
    "method": "llm-transcript-scrape"
  },
  "verified": false,
  "tiers": {
    "lightnings-swift-strike": "C",
    "a-spread-of-rampant-green": "S"
  },
  "uncertain": ["shroud-of-silent-mist"],
  "unresolved": [{ "heard": "the mud one", "at": "12:04" }]
}
```

## Field rules

| Field         | Rule                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | Stable slug. Never reused, never renamed — the app keys personal edits and the active-list selection off it.                      |
| `type`        | `"strength"` or `"fun"`. Closed set. If the source ranks on some other axis, say so and stop — do not force it into one of these. |
| `players`     | Integer 1–6, the player count the source ranked *for*. Absent if the source never says. **Never inferred.**                       |
| `origin`      | `"cited"` (has a source, immutable in-app) or `"personal"` (the owner's own, editable). The scraper only ever emits `"cited"`.   |
| `tierLabels`  | The source's own vocabulary, **strongest first**. Do not map onto another list's labels. A 6-band list stays 6 bands.             |
| `methodology` | Free text, in the source's own framing. Say what it covers and what it excludes.                                                  |
| `source`      | All fields required except `published`. `method` records how the data was obtained, verbatim.                                     |
| `verified`    | `false` until a human has checked the list against the source. The scraper always emits `false`. It never emits `true`.           |
| `tiers`       | `configId -> label`. Every label MUST appear in `tierLabels`.                                                                    |
| `uncertain`   | configIds whose tier the scraper assigned but is not confident in. Optional; an empty array and an absent key mean the same.      |
| `unresolved`  | Spirits the source named that the scraper could not map to a configId. Optional.                                                  |

## The rule that matters more than the rest

**If the source did not rate a configuration, its key is ABSENT from `tiers`.**

Not `null`, not a default, not the middle band, not carried over from another list. The app renders
absent keys in an explicit "unrated" bucket that names the gap. A tier list covering 36 of 68
configurations is a *correct* tier list — the 32 holes are information about the source, and
filling them destroys that information.

This repo has shipped fabricated OCFDU ratings, wrong elements, and five aspects that do not exist,
every time because something wrote a plausible guess where it should have reported a gap. A model
transcribing tiers from a video transcript is exactly that hazard, automated. Prefer `uncertain` and
`unresolved` over a confident wrong letter; prefer omission over both.

## configId

Base spirit: the spirit's `id` from `src/data/spirits.json`.
Aspect: `"<spiritId>::<Aspect Name>"`, e.g. `"lightnings-swift-strike::Pandemonium"`.

Both must already exist in `spirits.json`. The scraper is given the canonical id list; it resolves
spoken names against that list and never invents an id. A name it cannot resolve goes to
`unresolved` with what it heard, so a human can fix it — a dropped spirit is invisible, a listed
one is not.

## Why rank is an index, not a letter

`recommend()` needs a numeric prior, and two lists may use different vocabularies. Rank is the
label's **position** in `tierLabels`, normalised by `index / (tierLabels.length - 1)`. This is
mechanical. No component ever decides whether one list's `S` means the same as another's `X`.

## Settled by the ADR

- **File layout.** One file per list under `src/data/tier-lists/`, e.g.
  `src/data/tier-lists/3mbg-strength-solo-2025.json`.
- **The tripwire test.** `tierListCanon.test.ts`, modelled on `aspectCanon.test.ts`.
- **The fingerprint migration.** The owner's pre-v3 override payload is re-stamped against his
  personal list on first read rather than discarded by the ordinary seed-fingerprint guard.

## Still genuinely open

- **Whether `verified: false` lists may feed `recommend()` at all, or only display.** Left open
  on purpose — see the ADR's "Left open, deliberately" section. It is the owner's call once real
  scraped lists exist and their quality is visible in practice.
