# 15 — Report overrides discarded by a seed-fingerprint change

Status: ready-for-agent

## Parent

`.scratch/v2/PRD.md`

## What to build

`tierStore` and `complexityStore` both stamp saved overrides with a fingerprint of the shipped
seed, and both discard those overrides when the fingerprint moves. That guard is correct and
deliberate — an override edited against a since-changed printed value would misjudge the
newcomer ceiling.

But they discard **silently**: `removeItem`, return `{}`, say nothing. The user's tier edits
vanish on an app update and nothing ever tells them. Story 37 names this case explicitly
("a shipped-seed change invalidating my overrides") alongside "Reset tiers" as something the
user must be warned about.

It cannot be warned about *before* the fact — the discard happens on load, before any UI
exists. So report it *after*: the stores should make the discard observable rather than
swallowing it, and the Customise tab should render a one-line notice when it has happened.

Keep this small. A flag the store exposes, a banner the tab renders, and a way to dismiss it
so it does not nag forever. This is a report, not a recovery mechanism — the data is already
gone, and the point is that the user learns to export next time.

## Acceptance criteria

- [ ] A store that discards overrides on a fingerprint mismatch exposes that it did so
- [ ] A store that finds no stored overrides at all does **not** report a discard — a fresh install is not data loss
- [ ] The Customise tab shows a notice when overrides were discarded, naming which store lost them
- [ ] The notice can be dismissed and does not reappear for that same seed
- [ ] The discard behaviour itself is unchanged; stale overrides are still dropped, never migrated
- [ ] Store tests continue to assert the guard through the public API only

## Blocked by

- None — can start immediately

## Comments

Resolved: both stores now close over a `discardedOnLoad` flag, set only in the fingerprint-
mismatch branch of `readOverrides` (never on the fresh-install `!raw` path), exposed as
`wasDiscarded()` and cleared by `dismissDiscardNotice()`. The flag is sticky for the store's
lifetime (one page load) since the stale entry is gone from storage after the first read, so
it can't be re-detected. `TierEditor` renders a dismissible one-line notice per store. Tests
added in `tierStore.test.ts` / `complexityStore.test.ts`.
