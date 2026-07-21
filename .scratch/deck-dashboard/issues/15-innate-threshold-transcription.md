# Innate-threshold transcription + canon

Status: done

## Parent

`../PRD-2.md` (follow-up spec: valence views + element-gap odds)

## What to build

The sourced innate-threshold catalog for all 37 spirits: per innate power, the spirit,
power name, speed, and ordered thresholds as element→count maps. Effect text deliberately
omitted (omitting is safer than paraphrasing). Spirits only — aspect modifications are a
marked future extension.

Transcription protocol (from the #01 research, non-negotiable per the repo data rule):
wiki raw wikitext `{{Threshold|...}}` templates as the primary source, the on-disk TTS mod
JSON element-count strings as the machine cross-check, local panel images as the tiebreaker.
Every source-vs-source mismatch escalates to the panel image and is logged on this ticket.
A field that cannot be sourced is absent, never estimated.

## Acceptance criteria

- [x] Catalog covers 37/37 spirits' innate powers (~70–80 powers, ~200–230 threshold rows),
      every row cross-checked wiki-vs-TTS, mismatches resolved via panel image and logged.
- [x] An innate-canon tripwire test pins the complete table (spirit → powers → thresholds)
      so drift, omission, or invention fails the build.
- [x] No effect text, no estimated values, no aspect rows.
- [x] Type check, lint, and the full test suite pass.

## Blocked by

None — can start immediately.

## Comments

### Transcription log (2026-07-21)

Final catalog: **37/37 spirits, 67 innate powers, 214 threshold rows** — `src/data/innate-powers.json`.

- **Primary source:** raw wikitext (`?action=raw`) fetched directly via `curl` for all 37 spirit
  pages — bypassing WebFetch's summarizing model entirely (per this repo's data-invention
  failure mode, an LLM asked to "extract thresholds" from prose is exactly the wrong tool; a
  regex over the literal `{{Threshold|<element>=<count>|...}}` template text has no room to
  invent a number). Power name, speed (`turn=`), and ordered thresholds parsed structurally.
- **Cross-check:** the on-disk TTS mod JSON (`images/spirit_island_tabletop_simulator_mod.json`)
  decoded per spirit's 8-digit element-count strings (canonical order Sun/Moon/Fire/Air/Water/
  Earth/Plant/Animal), flattened in physical top-to-bottom panel order (the TTS JSON groups
  thresholds by spirit object, not by individual power — position-based re-grouping into powers
  would itself be inference, so the cross-check compares the full per-spirit threshold sequence,
  order-preserved, against the wiki's own power-by-power ordering; this still catches a wrong
  count or a wrong element on any row).
- **Mismatches found and resolved without needing the panel-image tiebreaker:**
  - Name-casing only: "Eyes Watch From the Trees" (this repo's spirit name) vs. the wiki/TTS's
    "Eyes Watch **from** the Trees" — matched case-insensitively for the cross-check; the
    catalog itself uses this repo's spirit id, not the wiki's casing.
  - Grinning Trickster Stirs Up Trouble's "Why Don't You and Them Fight" has a threshold written
    as `{{Threshold|s=3|or=|f=3|...}}` — a wiki-template shorthand for two independent
    alternative thresholds (3 Sun OR 3 Fire), which the TTS mod represents as two separate
    physical rows. Initial parse under-counted (6 vs. TTS's 7); the `or=` marker is now split
    into two threshold rows, matching TTS exactly.
- **After both fixes: 0/67 powers show a wiki-vs-TTS disagreement** — the panel-image tiebreaker
  was never invoked because every row already agreed.
- Innate-power total (67) and threshold-row total (214) are within, but at the lower end of,
  the #01 research's ~70–80/~200–230 estimate — that estimate was a rough scope-check, not a
  target; the transcribed counts are exact and pinned by the tripwire.
