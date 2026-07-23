# Log modernization

Status: done

## Problem Statement

The Game log is the app's least-designed surface. Its record-a-game form is a vertical stack of
`<p>`-wrapped bare inputs and native `<select>`s, and its history is nested `<ul>` bullet lists —
neither wears the panel/pill design language the rest of the app uses, so the Log reads as
out-of-place. The history is hard to scan (each game is a bullet with a sub-bullet per player, no
columns), carries no free-text recap of how a game went, shows spirits/adversaries/scenarios as
plain text rather than their art, and offers no way to delete a mistaken entry — let alone undo a
misclick.

## Solution

Rebuild the Log on the app's design system as one coherent surface: a panelled record-a-game form
with pill controls, an optional free-text note per game, and a scannable **table** history with one
row per game. Spirits, adversaries and scenarios render as **circular avatar chips with names**,
reusing the real artwork. Each history row can be deleted, with an instant "Undo" toast covering
the misclick; durable recovery remains the existing backup export. The Log stays strictly
local-first — no accounts, no sync (see the `login-sync` backlog note).

## User Stories

1. As a player, I want the record-a-game form to wear the same panelled, pill-styled look as the
   Dashboard, so that the Log no longer feels like a different, unfinished app.
2. As a player, I want to add a free-text **note** to a game ("close game, blight cascade turn 5"),
   so that I can remember how it actually went, not just its result.
3. As a player, I want the note to be **per game** (one field), so that I record the game I remember,
   not a note per seat I don't.
4. As a player, I want my history shown as a **table** with columns (date, outcome, spirits,
   adversary+level, scenario, notes), so that I can scan my games top to bottom.
5. As a player, I want **one row per game**, with all the game's spirits shown together in that row,
   so that the table matches how I think about a game (one adversary, one result, one date).
6. As a player, I want each spirit shown as a **circular portrait chip with its name**, so that I
   recognise the spirits at a glance instead of reading a list.
7. As a player, I want the **adversary and scenario** shown as the same circular-avatar-with-name
   chips, so that the whole row reads visually and consistently.
8. As a player, I want a **missing** spirit/adversary/scenario image to fall back gracefully (the
   existing placeholder), so that a missing asset never breaks the row.
9. As a player, I want to **delete** a game from my history, so that I can remove a mistaken entry.
10. As a player who deleted a game by mistake, I want an instant **"Undo"** affordance for a few
    seconds, so that a misclick is trivially reversible.
11. As a player, I want to understand that my log lives **only in this browser** and that the real
    durable backup is the export file, so that I have correct expectations about what "delete" and
    "undo" can guarantee.
12. As a player, I want my existing logged games to keep working unchanged after this update, so
    that adding notes/columns never loses or corrupts history I already have.
13. As a player, I want my backup export/import to keep working, including the new note field, so
    that my data round-trips.
14. As a player on a phone, I want the modernised Log to remain usable at small widths, so that the
    table and chips don't overflow the screen.

## Implementation Decisions

- **Notes: schema.** Add optional `notes?: string` to `LogEntry`. Being optional, existing stored
  entries and existing backups parse untouched — no schema-version bump, no migration. `backup.parse`
  must continue to accept entries with and without the field (confirm it does not reject the extra
  key). The form trims and stores `notes || undefined` (never an empty string), consistent with the
  existing optional-field discipline (`clampOptionalInt` returns `undefined`, never a fabricated 0).
- **Delete + undo: store.** Add `remove(id)` to the `gameLog` store. Undo is implemented by
  re-`append`ing the removed entry (its stable `id` preserved) — no new persisted state, no
  `deletedAt`, no trash collection. The undo affordance is an ephemeral in-memory toast (~10s) in the
  component; once it lapses, deletion is final and recovery is via backup import. Soft-delete/7-day
  window explicitly not built (see Out of Scope).
- **Tabular history.** Replace the nested `<ul>` with a table (or CSS-grid table) rendering one row
  per `LogEntry`: Date · Outcome · Spirits (chip cluster) · Adversary + level · Scenario · Notes,
  with terror/blight folded in as today. Notes cell truncates with full text on hover/expand. Must
  degrade to a usable narrow-width layout.
- **Avatar chip component.** One reusable component: a circular (center-cropped) avatar + a visible
  name, used for spirits, adversaries and scenarios alike. Spirit art resolves as `SpiritArt` does
  (`spirits/<image ?? id>.webp`) and reuses its `PlaceholderArt` fallback; adversary/scenario art
  resolves via `slugify(name)` → `public/adversaries|scenarios/<slug>.webp` with an equivalent
  graceful fallback. Accepts the 480×218 landscape art being center-cropped to a circle.
- **Form + shell.** Re-skin the record-a-game form and stats into the app's panel/`selectpill`
  language (tokens from `deck.css`); no change to what fields are collected beyond the new note. The
  Statistics section is restyled to match but keeps its current content.
- **Local-first, unchanged.** No backend, no accounts, no sync. The `login-sync` backlog note records
  the future direction; nothing here forecloses it (entry `id`s stay stable and serialisable).

## Testing Decisions

Good tests assert external behaviour at the existing store/serialisation seams, not component
markup.

- **`gameLog` store** — extend `gameLog.test.ts`: `remove(id)` drops exactly that entry and leaves
  others; re-`append` of a removed entry (undo) restores it with its original `id`; `timesPlayed`
  reflects removal. This is the delete/undo behaviour that matters.
- **Backup round-trip** — extend `backup.test.ts`: an entry with `notes` exports and re-imports
  intact; an entry **without** `notes` (an old entry) still parses and is unaffected; the dedupe-by-
  `id` merge is unchanged. This guards story 12/13.
- **Component smoke** — extend `appSmoke.test.tsx` so the modernised Log renders the panelled form,
  the table history with avatar chips, and the delete control without crashing. No styling assertions.
- Prior art: `gameLog.test.ts`, `backup.test.ts`, `logStats.test.ts`, `appSmoke.test.tsx`.

## Out of Scope

- **Soft-delete / 7-day trash / `deletedAt`** — delete is immediate with an ephemeral undo toast;
  durable recovery is the backup export. A days-later reversal is not built.
- **Accounts, login, cross-device sync** — filed in `.scratch/login-sync/README.md`; not part of
  this effort.
- **Per-player notes** — the note is per game; per-seat notes are deferred.
- Editing a game's *fields* after the fact (only add and delete are in scope); changing the set of
  logged fields beyond adding the note.

## Further Notes

From the design grill: delivered as one effort (form → table → chips → delete), not a separate
"modernize first" checkpoint, because the tabular history and chips *are* the bulk of the
modernization. The infrastructure reality (local-first `localStorage`, GitHub Pages static hosting,
no per-user server storage) is what bounds delete/undo to a client-side toast and defers real
sync to `login-sync`.
