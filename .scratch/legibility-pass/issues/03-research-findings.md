# 03 — Research findings: adversary subtype canon

## Finding

**No.** Spirit Island canon does not define a classification/subtype for adversaries analogous to
Blight/Fear `tags` or Event `eventClass`. Adversaries are organized only by name (nation/entity),
expansion of origin, and base-difficulty/escalation level (0-6). Each adversary's mechanical identity
(escalation track, special/loss-condition rules) is bespoke text — not a member of any named subtype
group shared across the set.

## Sources checked

1. `https://spiritislandwiki.com/index.php/Adversary` — general glossary page. Describes adversaries
   as offering "multiple increased difficulty levels, indicated by the number on the left." No
   type/subtype/classification field mentioned.
2. `https://spiritislandwiki.com/index.php/England` — expansion (Base Game), base difficulty (1),
   escalation mechanic ("Building Boom"), additional loss condition ("Proud & Mighty Capital"). No
   subtype field.
3. `https://spiritislandwiki.com/index.php/Sweden` — expansion (Base Game), wiki nav categories
   "Adversary"/"Adversaries" (site navigation, not an in-game classification). No subtype field.
4. `https://spiritislandwiki.com/index.php/France` — base difficulty 2, expansion. No subtype field.
5. `https://spiritislandwiki.com/index.php/Category:Adversaries` — the wiki's own category-listing
   page groups all adversaries in a flat alphabetical list by name/nation initial only — no thematic
   or mechanical subcategories.
6. Web search for `spiritislandwiki.com Adversary subtype OR classification OR "adversary type"` —
   no relevant hits from the wiki.

Checked against all 8 adversaries in the closed set: Brandenburg-Prussia, England, Sweden, France,
Habsburg Monarchy, Russia, Scotland, Habsburg Mining Expedition — the general page and category index
cover all 8 by name; individual spot-checks (England, Sweden, France) confirm the pattern holds at
the per-adversary page level too.

## Resolution

The owner's premise — that adversaries "have identified subtypes" the way Blight/Fear and Events do —
was mistaken, not a sourcing gap. `adversaries.json`'s existing fields (`name`, `expansion`,
`minLevel`, `maxLevel`) are already the complete canonical set for this card type. No new field is
added, no display is built.

**Recommended next step:** close the map's fog item "adversary subtype display in rows" to Out of
scope. Ticket [04](04-subtypes-in-rows.md) proceeds for Blight/Fear (`tags`) and Events (`eventClass`)
only — adversaries are excluded from that ticket's scope, not folded in.
