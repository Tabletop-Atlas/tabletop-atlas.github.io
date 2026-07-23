# login-sync — accounts & cross-device sync (future)

Status: backlog

Raised while grilling the Log modernization (2026-07-23): the owner asked whether logged games
could survive a login and follow them across devices. Filed so the idea isn't lost — **not
chartered, not ready to build.**

## The constraint that forces this note

The app is local-first: the game log lives only in the browser's `localStorage`
(`spirit-island:game-log`, see `src/domain/gameLog.ts`). It never leaves the browser. GitHub
Pages serves static assets only — no server, no database, no runtime — so it **cannot** host
authentication or per-user storage. Every visitor reads their own browser's storage; nobody
browsing the Pages site can see another user's log. The only durable/cross-device copy today is
the manual backup export/import (`src/domain/backup.ts`).

So "log in and sync my games" is impossible on Pages *alone* — it needs a backend. Two paths, when
someone charters this:

- **Keep Pages, add a backend-as-a-service.** The static app calls **Supabase** (Postgres + auth)
  or **Firebase** (Auth + Firestore) from the browser. Auth + sync of the log as a thin layer over
  today's local-first store; zero hosting migration. Likely the lazy path.
- **Migrate hosting to a functions platform** — Vercel / Netlify / Cloudflare Pages. Same static
  Vite build plus serverless functions under one roof. More moving parts than login alone needs.

Either way the auth itself comes from a provider (Supabase Auth / Clerk / Auth0) — no hand-rolled
password storage.

## Why the current work already helps

The Log's entries carry stable `id`s (`crypto.randomUUID()` at append) and `backup.parse` already
does append-and-dedupe merges by `id` — the exact shape a "push local → remote, pull remote →
local" sync needs. Keep entry `id`s stable and keep the log a plain serialisable array and this
stays cheap to bolt on later.

## Out of scope for the Log modernization effort

The Log work (form/table/chips/notes/undo) stays purely local-first. This note only records the
sync direction so those decisions don't accidentally close it off.
