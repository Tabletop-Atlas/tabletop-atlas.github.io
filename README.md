# Spirit Island Spirit Recommender

Local-first Vite + React + TypeScript app for browsing and recommending Spirit Island
spirits. See `HANDOFF_spirit_island_recommender.md` and `.scratch/spirit-recommender/PRD.md`
for full project context.

## Development

```
npm install
npm run dev
npm test
npm run build
```

## Deployment

Pushes to `main` build the app and deploy `dist/` to GitHub Pages via
`.github/workflows/deploy.yml`. `vite.config.ts` sets `base: '/spirit-island/'` so the
built asset URLs resolve correctly under that path.

**One-time human setup (the workflow cannot do this itself):** in the repo, go to
Settings → Pages → Source = "GitHub Actions". Once enabled, every push to `main` deploys
automatically.
