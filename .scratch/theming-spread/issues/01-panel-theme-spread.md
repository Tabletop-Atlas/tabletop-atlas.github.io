# Spread the panel theme (variant C) beyond the spirit detail modal

Status: needs-triage

## Parent

`../README.md`, `panel-theming/MAP.md` (the modal's own effort — complete, shipped variant C)

## Background

`panel-theming` shipped the spirit detail modal in **variant C**: a dark translation of the
printed spirit panels — umber parchment surface, parchment text, #23's vertical OCFDU bars
retinted to match. The palette lives in `PANEL_COLOR` (`src/components/tagColors.ts`), injected
as `--panel-*` CSS variables, with `panel-vibe-sheet.md` recording the prior-art decisions.

At the time, the owner said the aesthetic is wanted on **more surfaces** — Browse tiles, the tier
board, the shell — but that was explicitly out of scope for the modal effort. It was never
chartered as its own work. `phase-4` #23 independently hit the same wall (its bars wanted the
panel look) and also deferred to "the left panel / global theming" conversation.

## What this needs before it's buildable

Not scoped yet. Before this is `ready-for-agent`, an owner conversation needs to settle:

- Which surfaces actually get the parchment treatment — Browse tiles? Tier board? The left
  sidebar shell itself? All of them, or a subset?
- Whether it's a straight reuse of `PANEL_COLOR`/`--panel-*`, or those need extending for
  surfaces the modal effort never touched (e.g. list/grid density, hover states).
- A variant round if the reuse isn't a drop-in fit for a given surface — per this repo's HITL
  rule, any 🎨 decision needs the owner's pick, never an agent's guess.

## Out of scope (for now)

Nothing is chartered yet — this ticket exists to hold the thread, not to define the build.
