# Spirit Island Spirit Recommender

Local-first web app (Vite + React + TypeScript) for browsing and recommending Spirit Island spirits.

The unit of recommendation is a **configuration**: a base spirit, or that spirit with exactly one
aspect applied. 37 spirits + 31 aspects = 68 configurations.

Current state: `.scratch/v2/README.md` (shipped, three items open). Design rationale:
`.scratch/v2/PRD.md`. `HANDOFF_spirit_island_recommender.md` predates v1 — read it only for the
transcribed ratings table; its decisions about aspects and persistence have been reversed.

**This repo has a documented failure mode: agents invent data when a source cannot answer.** It has
shipped fabricated OCFDU ratings, wrong elements, and five aspects that do not exist. A field that
cannot be sourced must be **absent**, never estimated. Any new dataset arrives with a tripwire test
(`aspectCanon.test.ts`, `adversaryCanon.test.ts`). Data whose provenance is judgment is marked as
such (`ratingsSource`, `shiftsToward`).

## Agent skills

### Issue tracker

Issues and PRDs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles, recorded as a `Status:` line on each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
