# 05 — Name the adversary and scenario panels

Status: done
Labels: wayfinder:task
Assignee: agent

## Parent

`.scratch/asset-archive/MAP.md` and [PRD.md](../PRD.md) — read the map's Notes and
[REFERENCE.md](../REFERENCE.md) (Source C) first.

## Question

Give the adversary and scenario panel downloads their real names in the archive:
`images/adversaries/<slug>.png` and `images/scenarios/<slug>.png` (or front/back pairs if the
inventory shows two-sided objects).

- Work from #01's inventory; `images/Adversary/` (8 files) and `images/Scenarios/` (~32 files)
  already hold raw downloads. Identify via JSON context first, then by reading the images.
- Adversary names cross-check against the repo's adversary canon (`adversaryCanon.test.ts`);
  scenario names against the wiki's List of Scenarios if needed.
- Expected counts: **8 adversaries, 15 scenarios** — the ~32 scenario files suggest fronts+backs
  or extras; the resolution must account for every file, and report any count that doesn't
  reconcile rather than finishing silently.
- Originals stay byte-identical. Emit manifest rows for #06.

## Acceptance criteria

- [ ] 8 adversaries and 15 scenarios named in the scheme; adversary names agree with the repo's
      adversary canon
- [ ] Every raw file in the two directories is accounted for — matched, or explained (back,
      duplicate, extra), or reported as unidentifiable; no silent leftovers
- [ ] Archive files are byte-identical to the downloads
- [ ] Manifest rows emitted for every file landed

## Blocked by

- #01 (works from its URL inventory)

## Comments

**Adversaries — 8/8, named and cross-checked.** The 8 TTS nicknames (Scotland, Russia, France,
Sweden, England, Prussia, Habsburg-Mining, Habsburg-Livestock) are shorthand, not the repo's
canon names — resolved 1:1 against `src/data/adversaries.json` (Prussia → Brandenburg-Prussia,
Habsburg-Mining → Habsburg Mining Expedition, Habsburg-Livestock → Habsburg Monarchy; confirmed
by reading one panel image directly — "THE KINGDOM OF SCOTLAND" — not just trusting the nickname
string). Single file each (the escalation/level table panel is one-sided); landed at
`images/adversaries/<slug>.png`.

**Scenarios — 15/15 canonical scenarios reconcile, all 32 image files accounted for.** #01's 48
"scenario"-classified rows include 15 `Scenario Marker` and 1 `Speed Token` entries that carry no
`on_disk_path` — these are TTS token objects (no image), not scenario panels; excluded, not
counted as missing files. Of the remaining 32 on-disk files: 13 scenarios (Blitz, Guard the
Isle's Heart, Rituals of Terror, Dahan Insurrection, Ward the Shores, Powers Long Forgotten,
Rituals of the Destroying Flame, The Great River, Elemental Invocation, Despicable Theft, A
Diversity of Spirits, Second Wave, Destiny Unfolds) each have exactly 2 files; **Surges of
Colonization** has 4 (two setup variants — Normal/Larger — each itself a front+back pair, still
one scenario per the box); **Varied Terrains** has 1; and **Scenario Pieces** (1 file) is a
shared component board, not a 15th scenario. 13×2 + 4 + 1 + 1 = 32, and distinct scenarios
13 + 1 (Surges, one scenario) + 1 (Varied Terrains) = **15**, matching the PRD's expected count
exactly.

**Front/back determined by reading the images, not by URL order alone.** Read 3 pairs in full
(Blitz, Rituals of Terror, Dahan Insurrection): in all 3, the first-listed file is the rules/setup
page ("SCENARIO — <name>, DIFFICULTY N, RULES CHANGES...") and the second is the flavor-text/art
page. Consistent with #04's panel finding (source JSON lists the "face" URL before the "back"
one) — applied to the remaining 12 pairs on that verified basis, not re-derived from name alone.

**One real gap, flagged not padded: Varied Terrains has only 1 file in the TTS JSON** — no back
side was found anywhere in the inventory. Landed as `images/scenarios/varied-terrains.png`
(rules-page-equivalent, unconfirmed which side); no second file was fabricated or substituted.

Landed under `images/scenarios/<slug>-front.png` / `-back.png` (or `<slug>.png` for the
single-file cases). Note: `images/Scenarios/` and `images/scenarios/` are the same directory on
this (case-insensitive) filesystem, so the raw downloads and the newly named files sit side by
side — harmless, but worth knowing before assuming the raw files were moved. Manifests at
`.scratch/asset-archive/assets/adversaries-manifest.json` (8 rows) and
`.scratch/asset-archive/assets/scenarios-manifest.json` (32 rows) for #06 to merge. All copies
verified byte-identical to source (`cmp`), nothing re-encoded.
