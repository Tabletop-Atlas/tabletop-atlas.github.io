# 03 — Adversary subtype: does canon define one?

Status: ready-for-agent
Label: wayfinder:research (AFK)
Parent: [Legibility-pass map](../MAP.md)

## Blocked by

_(nothing — can run in parallel with 01/02)_

## Question

The owner listed adversaries among the card types that "have identified subtypes" to show in the
rows view. But `adversaries.json` carries **no subtype field** — only `name`, `expansion`,
`minLevel`, `maxLevel` (8 records). Blight/fear (`tags`) and events (`eventClass`) genuinely have
subtypes in the data; adversaries do **not**.

Resolve the premise from canon, **without inventing one**: does Spirit Island define a canonical
*classification / subtype* for adversaries (e.g. a thematic grouping, a mechanical family) that we
could source and display — or do adversaries only have levels + escalation, in which case there is
no subtype to show?

- **If a canonical subtype exists:** source it for all 8 adversaries (high-trust source), record the
  URLs, and note that a display ticket should be charted (mirrors ticket [04](04-subtypes-in-rows.md)).
- **If none exists:** say so plainly. Adversary subtype display then does **not** happen (honest
  absence) and moves to the map's Out of scope — the owner's premise was mistaken, not a gap to fill
  with a guess.

Resolution = the canon finding (subtype exists / doesn't), sources, and the recommended next step.

## Acceptance criteria

- [ ] A clear, sourced answer to "does canon define an adversary subtype?"
- [ ] If yes: the subtype per adversary + source URLs (feeds a new display ticket)
- [ ] If no: recorded as honest absence; the map's fog item is closed to Out of scope, nothing built
- [ ] No estimated/invented subtype under any circumstance

> Resolves the map fog item **"adversary subtype display in rows."**
