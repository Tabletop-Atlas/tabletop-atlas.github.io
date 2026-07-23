# 01 — Per-game note + form/shell restyle

Status: done
Parent: ../PRD.md

## What to build

Give a logged game a free-text note, and re-skin the record-a-game form and stats onto the app's
design system.

- Add optional `notes?: string` to `LogEntry`. Being optional, existing stored entries and existing
  backups parse untouched — no schema-version bump, no migration.
- Add a note textarea to the record-a-game form; store `notes.trim() || undefined` (never an empty
  string), matching the existing optional-field discipline.
- Re-skin the record-a-game form and the Statistics section from the current `<p>`-stack / bare
  inputs to the app's panel + `selectpill` pill language (tokens from `deck.css`). No change to which
  fields are collected beyond the new note; stats content is unchanged, only restyled.
- Confirm `backup.parse` accepts entries with and without `notes` (does not reject the extra key).

## Acceptance criteria

- [ ] A game can be recorded with an optional note; an empty note stores as `undefined`, not `""`.
- [ ] The record-a-game form and stats wear the panel/pill styling used elsewhere; no bare `<p>`-stacked inputs remain.
- [ ] `backup.test.ts` proves an entry **with** `notes` round-trips export→import intact, and an entry **without** `notes` still parses and is unaffected; dedupe-by-`id` unchanged.
- [ ] Existing logged games continue to load and display unchanged.

## Blocked by

- None — can start immediately.
