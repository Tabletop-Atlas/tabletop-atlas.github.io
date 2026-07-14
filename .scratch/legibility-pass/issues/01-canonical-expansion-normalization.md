# 01 — Canonical expansion normalisation

Status: done
Label: wayfinder:task (AFK)
Parent: [Legibility-pass map](../MAP.md)

## Blocked by

_(nothing — foundational; run first)_

## Question

`EXPANSION_COLOR` in [`tagColors.ts`](../../src/components/tagColors.ts) keys off the 7 canonical
`ExpansionName` values (`Base`, `Branch & Claw`, `Feather & Flame`, `Horizons`, `Jagged Earth`,
`Nature Incarnate`, `Promo`). But the Archive card data uses **different raw strings** and colour
will silently fail to resolve for them:

- `other-cards.json`: `Basegame`, `Promo2` (+ `Branch & Claw`, `Jagged Earth`, `Nature Incarnate`)
- `power-cards.json`: `Basegame`, `Horizons of Spirit Island`, `Promo2` (+ canonical-ish others)
- `adversaries.json`: `Base`, `Branch and Claw`, `Promo Pack 2 / Feather and Flame`

**How do we make every card's expansion resolve to a colour** so ticket
[05](05-expansion-colour-archive.md) can colour all surfaces from the one map — without corrupting
transcribed data or inventing an expansion?

Deliver a **normalisation** from raw expansion string → canonical `ExpansionName`, plus a **tripwire
test** asserting every card in every dataset maps to a known `EXPANSION_COLOR` key (fails loudly if
a future record introduces an unmapped string). Recommended shape: a display-time
`normalizeExpansion()` beside `EXPANSION_COLOR` rather than rewriting the raw JSON, so transcribed
provenance is untouched — but the implementer decides; note the choice.

⚠ Some raw strings are **ambiguous, not just cosmetic** — e.g. `Promo2` and
`Promo Pack 2 / Feather and Flame` may be Promo *or* Feather & Flame content. Where the canonical
mapping isn't a clean rename, **stop and surface it** rather than guessing (the fabrication rule);
that ambiguity may itself be a small decision for the owner.

## Acceptance criteria

- [ ] A single normalisation maps every raw expansion string in `other-cards`, `power-cards`,
      `adversaries` (and `spirits`, already canonical) to a canonical `ExpansionName`
- [ ] A tripwire test fails if any dataset record's expansion doesn't resolve to an `EXPANSION_COLOR` key
- [ ] Ambiguous `Promo2` / `Promo Pack 2 / Feather and Flame` cases resolved or escalated to the owner (not guessed)
- [x] `tsc -b`, `oxlint`, and the full test suite stay green

## Comments

`normalizeExpansion()` + `EXPANSION_ALIASES` land in [`tagColors.ts`](../../../src/components/tagColors.ts),
display-time only — the transcribed JSON is untouched. Tripwire lives at
[`expansionCanon.test.ts`](../../../src/components/__tests__/expansionCanon.test.ts); it pins the
exact raw-string → canonical mapping seen in each dataset today (not just "resolves to something"),
so a wrong alias is caught the same as a missing one.

Most raw strings were a clean rename (`Basegame` → `Base`, `Branch and Claw` → `Branch & Claw`,
`Horizons of Spirit Island` → `Horizons`). `Promo2` was the flagged ambiguity: `adversaries.json`
ties Promo Pack 2 to Feather & Flame directly ("Scotland"), but `spirits.json` tags Downpour
Drenches the World's own record `Promo` while every one of its power cards is `Promo2` in
`power-cards.json` — the data disagreeing with itself, not resolvable from the data alone. Escalated
to the owner rather than guessed; **owner call (2026-07-14): `Promo2` always resolves to
`Feather & Flame`**, Downpour's own `Promo` tag notwithstanding.

No consumer wired up yet — `SpiritTile`/`SpiritDetail` still read `EXPANSION_COLOR` directly for
spirits (already canonical). Ticket [05](05-expansion-colour-archive.md) is where `normalizeExpansion`
gets called for cards/adversaries across Browse, Archive and Powers.
