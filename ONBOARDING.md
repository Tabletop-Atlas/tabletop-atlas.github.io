# Onboarding — Spirit Island Knowledge Base

Welcome. This guide gets you productive on this repo — where things are, the one rule that
overrides everything, and how work actually gets done here. For *what the app is*, read
[`README.md`](README.md); for the domain vocabulary, [`CONTEXT.md`](CONTEXT.md).

## First 15 minutes

```
npm install
npm run dev      # local dev server
npm test         # vitest — the real guard; run this before and after any change
npm run build    # tsc -b && vite build — must be green before you ship
```

It's a local-first Vite + React + TypeScript app. No backend, no API keys, no accounts — it builds
to a static bundle and deploys to GitHub Pages.

## The one rule that matters most

**This repo has a documented failure mode: it invents data when a source cannot answer.** It has
shipped fabricated OCFDU ratings, wrong elements, and aspects that do not exist. The entire data
discipline exists to stop that, and it is non-negotiable:

- **A field a source cannot answer is absent — never estimated.** Not null, not a default, not the
  middle band, not inherited. Coverage that looks incomplete is *correct*.
- **Fact and judgment are separated in the data itself** (`ratingsSource`, `shiftsToward`,
  `tagsSource`, `impactSource`, `valenceSource`, `source`).
- **Every dataset ships with a canon tripwire test** (`aspectCanon.test.ts`, `cardCanon.test.ts`, …)
  that fails loudly on drift.
- **When a source is ambiguous, stop and ask the owner. Never guess.**

If you take one thing from this guide, it is this. Read
[ADR 0003](docs/adr/0003-data-provenance-discipline.md) in full.

## How the codebase is organized

| Path | What it is |
|---|---|
| `src/domain/` | **The interesting code.** Pure TypeScript — scoring, filtering, stores, dataset types. No React. This is where logic and cleverness live. |
| `src/data/` | The datasets (spirits, cards, tier lists, innate powers, …), each pinned by a canon test. |
| `src/components/` | React UI — deliberately boring glue over the domain layer. |
| `src/domain/__tests__/` | The test suite: behaviour tests of pure modules + canon tripwires. |

Architecture principle: *deterministic where facts live, stochastic only where judgment lives* — no
LLM in the app. Keep the React surface conventional; put the thought into the data model and the
pure functions behind clean seams.

## Where the knowledge lives

- **[`CONTEXT.md`](CONTEXT.md)** — the domain glossary (ubiquitous language). Use these exact terms;
  don't drift to synonyms it says to avoid. Read it before naming anything.
- **[`docs/adr/`](docs/adr/)** — Architecture Decision Records (0001–0012). Read the ones touching
  your area before you change it; if your change contradicts one, surface it, don't silently
  override.
- **`.scratch/<effort>/`** — per-effort specs, wayfinder maps, and history. **These are a record,
  not live docs** — preserved so decisions are traceable. Don't treat an old ticket as a to-do.
- **[`CLAUDE.md`](CLAUDE.md)** — the rules an agent must follow; read it first if you're an agent.

Start-here ADRs: **0003** (provenance discipline), **0004** (standing prohibitions — what the app
will never compute), **0007** (the scoring model).

## How work gets done here

The project runs on the Matt-Pocock skill workflow (`docs/agents/`):

1. **Idea → spec** — `/grill-with-docs` (or `/wayfinder` for a foggy, multi-session effort) to
   sharpen the idea, then `/to-spec` → `/to-tickets`.
2. **Build** — `/implement` per ticket, which drives `/tdd` (red-green) and closes with
   `/code-review`. Clear context between tickets.
3. **Issue tracker** — issues live as markdown under `.scratch/<effort>/issues/`, each with a
   `Status:` line (`ready-for-agent` → `done`; `ready-for-human`, `wontfix`). A shipped ticket left
   on `ready-for-agent` will send the next agent to reimplement it — flip it to `done` when it
   merges. See `docs/agents/issue-tracker.md` and `triage-labels.md`.

## Conventions & gotchas

- **Tests are tripwires, not afterthoughts.** New/changed data ships with a canon test in the same
  change. Test external behaviour of pure modules, never React internals or `localStorage` guts.
- **UI isn't "done" until it's been driven in a real browser** at 375px and desktop. The v3 lesson:
  a fully test-covered tier board shipped completely invisible because the CSS was missing and
  nobody opened it. Playwright against the production build is the check.
- **Theming goes through `--deck-*` tokens** in `src/deck.css` — a hardcoded hex in chrome is a
  regression (ADR 0011). Categorical palettes (`tagColors.ts`/`tierColors.ts`) are a separate
  system, pinned by `cardChipColors.test.ts`.
- **Expansions have a canonical 6-key set** and are normalized through `EXPANSION_ALIASES`
  (ADR 0008). Don't add a raw expansion string without mapping it.
- **The `tsconfig` trio at root is the idiomatic Vite layout** — leave it. `index.html`,
  `vite.config.ts`, `package.json` are root-by-contract.

## Deploy

Every push to `main` builds and deploys `dist/` to GitHub Pages via `.github/workflows/deploy.yml`,
served from the `Tabletop-Atlas` org root site (`tabletop-atlas.github.io`, so `base: '/'`). The
one manual step (already done): repo Settings → Pages → Source = "GitHub Actions".

## Attribution

Unofficial fan project, not affiliated with Greater Than Games, LLC; Spirit Island content is
theirs. Card data derives from the community Spirit Island Card Katalog.
