# 12 — Deploy pipeline to GitHub Pages

Status: ready-for-agent

## Parent

`.scratch/spirit-recommender/PRD.md`

## What to build

Automated static deploy of the app to GitHub Pages under `/spirit-island/`. Proving the
`base`-path/asset-URL wiring is the point — do it early against the #01 skeleton so a broken
deploy is caught before the app is fully built.

- **GitHub Actions workflow** (AFK): on push to `main`, `npm ci && npm run build`, then
  deploy `dist/` to Pages via the official Pages actions.
- Verify built asset URLs resolve under the `/spirit-island/` base (no root-absolute paths).
- **Human follow-up (HITL, morning):** enable Pages in the repo — Settings → Pages → Source =
  GitHub Actions. Note this clearly; the workflow can't self-enable Pages.

## Acceptance criteria

- [ ] A Pages deploy workflow exists and runs on push to `main`
- [ ] `npm run build` produces a `dist/` that references assets under `/spirit-island/`
- [ ] Workflow uploads and deploys the build artifact
- [ ] A note documents the one-time human step to enable Pages in repo settings

## Blocked by

- #01 (a buildable app to deploy)
