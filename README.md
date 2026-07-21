# Spirit Island Knowledge Base

A local-first web app for browsing, understanding, and choosing among the spirits and cards of
[Spirit Island](https://spiritisland.com). It runs entirely in the browser — no backend, no
accounts, no API keys — and deploys as a static site.

The unit it reasons about is the **configuration**: a base spirit, or that spirit with exactly one
aspect applied (37 spirits + 31 aspects = 68 configurations).

## What's in it

- **Browse** — every spirit as an art grid, filterable by expansion, complexity, OCFDU and tags,
  each opening a detail view with its panel, starting cards, aspects and tier.
- **Recommend** — a jargon-free questionnaire that translates a plain-language playstyle into a
  ranked shortlist, with a deliberately off-profile *wildcard* and a random-chooser mode.
- **Archive** — a browser for the rest of the game: power, fear, event and blight cards, plus
  adversaries and scenarios, behind closed-vocabulary filters.
- **Dashboard** — power-deck composition and element-gap draw odds (exact hypergeometric), fear
  impact and event valence.
- **Tier list** — multiple cited or personal tier lists per subject, each shown in its own
  vocabulary, with an explicit *unrated* bucket rather than invented ratings.
- **Log** — a game log, and **Settings** — backup/restore, your collection, and complexity
  overrides.

## What makes it different: honesty about data

Spirit Island has a large, precise body of information, and the tempting failure mode for a project
like this is to *fill in* whatever a source doesn't say. This repo refuses to, on principle:

- **A field a source cannot answer is absent, never estimated.** Coverage that looks incomplete is
  correct; fabricated completeness is a bug.
- **Fact is separated from judgment, in the data itself.** Printed numbers are facts; a human's
  read (an aspect's lean, a blight card's bucket, a fear card's impact) is marked as judgment
  (`ratingsSource`, `shiftsToward`, `tagsSource`, `impactSource`, `valenceSource`).
- **Every dataset is guarded by a canon tripwire test** that fails loudly if the data drifts or a
  count moves.
- **Ambiguity escalates to a human, never gets guessed.**

This discipline is the project's backbone — it is stated in [`CLAUDE.md`](CLAUDE.md) and recorded as
[ADR 0003](docs/adr/0003-data-provenance-discipline.md). It exists because the repo has shipped
fabricated data before, and these rules are what stop it recurring.

## Architecture

- **Vite + React + TypeScript**, static build, deployable to GitHub Pages unchanged.
- **A framework-free domain layer.** All recommendation, filtering and scoring logic lives in pure
  TypeScript modules (`src/domain/`); React is deliberately boring glue over them. The interesting
  code is the data model and the scoring function, not the framework —
  *deterministic where facts live, stochastic only where judgment lives* (no LLM).
- **Tests are tripwires.** The suite pins external behaviour of the pure modules and the shape and
  counts of every dataset, so a change that would fabricate or drift fails CI.

## Repository map

| Path | What lives there |
|---|---|
| `src/domain/` | Pure logic: scoring, filtering, stores, datasets' types |
| `src/data/` | The hand- and machine-maintained datasets (spirits, cards, tier lists, …) |
| `src/components/` | React UI — glue over the domain layer |
| `CONTEXT.md` | The domain glossary (the project's ubiquitous language) |
| `docs/adr/` | Architecture Decision Records (0001–0012) |
| `.scratch/<effort>/` | Per-effort specs, wayfinder maps and history (preserved, not live docs) |

Start with `CONTEXT.md` for the vocabulary and `docs/adr/` for the decisions.

## Development

```
npm install
npm run dev
npm test
npm run build
```

## Deployment

Pushes to `main` build the app and deploy `dist/` to GitHub Pages via
`.github/workflows/deploy.yml`. Served from the `Tabletop-Atlas` organisation's root Pages site
(`tabletop-atlas.github.io`), so `vite.config.ts` sets `base: '/'`.

**One-time human setup (the workflow cannot do this itself):** in the repo, go to
Settings → Pages → Source = "GitHub Actions". Once enabled, every push to `main` deploys
automatically.

## Attribution

This is an unofficial fan project and is not affiliated with Greater Than Games, LLC. Spirit Island,
and all card text and artwork, are © Greater Than Games, LLC. Card data is derived from the
community [Spirit Island Card Katalog](https://github.com/oberien/spirit-island-card-katalog).
