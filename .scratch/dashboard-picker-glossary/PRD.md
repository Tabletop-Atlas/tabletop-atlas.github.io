# Dashboard element picker + inline glossary

Status: done

## Problem Statement

On the Dashboard's Minor/Major deck view, two element controls sit side by side and share nothing.
The spirit-demand headline ("X% of minors hit 2 or more of what you want") reflects the picked
spirit's whole innate demand set; the separate free-form picker ("at least N of one element") is,
by its own code comment, deliberately independent of any spirit. Picking a spirit tells you nothing
about the free-form picker, so the user must re-derive by hand which element they're short of and
type it back in. The free-form controls are also visually dated: a native `<select>` that can't
show element art, and a bare rectangular number input that clashes with the app's pill controls.

Separately, the Fear and Event views (and, in principle, every surface) are dense with domain terms
the user can't look up in place — impact levels (weak/solid/strong), fear tags
(removal/defensive/weaken/disruption/displacement), event valence (harmful/mixed/beneficial),
event classes — with no way to learn what "removal" or "weak" means without leaving the screen.

## Solution

Keep both element widgets, but make the free-form picker **follow the picked spirit**: when a
spirit is chosen, seed the picker with the demanded element the spirit is least likely to hit and
that element's first-rung demand count. The user still edits it freely to explore; the seed just
removes the manual re-derivation.

Modernise the free-form controls to the app's pill language: elements become a row of eight
icon+name chips (single-select), and the count becomes a 1–6 segmented chip control — no native
`<select>`, no rectangular number box.

Add an inline glossary: defined terms render with a subtle dotted underline and reveal a plain
definition in a popover on hover/tap/focus, backed by one central, provenance-marked map. Wire it
to Fear/Event terms first; the map is structured so any surface can adopt the same term component
later.

## User Stories

1. As a player picking a spirit on the Dashboard, I want the "how many of an element do I want?"
   picker to pre-fill with the element I'm most likely to be short of, so that I don't have to read
   the demand table and re-type it myself.
2. As a player, I want that seeded element to be the demanded element with the **lowest draw odds**,
   so that the picker surfaces my actual problem element, not one I'm already flush with.
3. As a player, I want the seeded count to be that element's **first threshold rung**, so that the
   default answers "what gets this innate online at all".
4. As a player who then edits the element or count by hand, I want my edit to stick until I change
   spirits, so that I can freely explore other elements without the app fighting me.
5. As a player, I want picking a **different spirit** to re-seed the picker to that spirit's problem
   element, so that the picker always reflects the spirit I'm looking at.
6. As a player, I want switching **segment** (Minor↔Major) to leave my picked element alone, so that
   I can compare the same element's odds across both decks.
7. As a player with **no spirit** selected, I want the picker to stay blank, so that nothing is
   implied about a spirit I haven't chosen.
8. As a player, I want to choose an element from a row of **element icons with names**, so that
   picking feels natural and matches the game's own iconography rather than a text dropdown.
9. As a player, I want to pick "at least N" from a **row of number chips (1–6)**, so that the
   control matches the element strip and the modern pill styling of the rest of the app.
10. As a player, I want the free-form odds sentence to keep working off the active pool and draw
    count exactly as before, so that the only change is how I input the element and count.
11. As a player reading the Fear or Event view, I want to hover/tap a term like "removal" or "weak"
    and see a plain-language definition, so that I can learn the vocabulary without leaving the page.
12. As a keyboard or touch user, I want the term definition reachable by tap/click/focus, not
    hover-only, so that the glossary works on my device.
13. As the owner, I want every glossary definition to come from a **cited source** (an existing
    `CONTEXT.md`/data definition, my own authored text, or the wiki), so that the app never invents
    game-rule prose — the repo's documented failure mode.
14. As the owner, I want any term with **no in-repo source** to ship absent with a visible TODO
    rather than a guessed definition, so that a missing definition is honest, not fabricated.
15. As a developer, I want one central glossary map and one term component, so that any future
    surface (Browse, Tier list) can define a term by adding a map entry, not a migration.

## Implementation Decisions

- **Seeding is a pure function over demand data.** Add a domain function (in/near
  `elementDemand.ts`) that takes the `ElementDemandSupply` for a spirit and returns
  `{ element, count } | undefined`: the demanded row with the lowest `odds` (ties broken
  deterministically), with `count` = that element's first-rung demand. No React, no store.
  Returns `undefined` when there is no demand (no spirit / no demanded rows).
- **Seeding wiring in `DashboardTab`.** Re-run the seed when the picked **spiritId** changes (not on
  segment change, not on manual edits). Manual edits to `wantElement`/`wantCount` persist until the
  next spirit change overwrites them — no `touched`/lock flag. No spirit → picker blank (today's
  behaviour). Values remain session-only, never persisted (a reload reverts, as today).
- **Element control** becomes a single-select strip of the 8 `ELEMENTS`, each an `<ElementIcon>` +
  name, click-to-pick / click-again-to-clear. Replaces the native `<select>`.
- **Count control** becomes a 1–6 segmented chip control. Cap is a flat 1–6 (covers the data's real
  first-rung range; a seed above 6 is not expected — if the data ever exceeds it, raise the cap).
- The odds calculation (`probAtLeast` over the active composition) is unchanged; only its inputs'
  UI changes.
- **Glossary map** is one new keyed module: `id -> { text, source }` where `source` is
  `'context' | 'owner' | 'wiki'`. Entries restating `CONTEXT.md`/data definitions are populated
  (`source: 'context'`); terms with no in-repo source are **omitted** and handed to the owner as a
  TODO list, never invented.
- **Term component**: renders its children with a dotted-underline affordance and a
  hover/click/focus-toggled popover showing the definition; a term id absent from the map renders as
  plain text (no broken affordance). Wired into the Fear and Event views first.
- No dedicated Glossary page, no custom image-dropdown widget, no edit-lock flag (see Out of Scope).

## Testing Decisions

Good tests here assert external behaviour at the highest existing seam, not React internals.

- **Seeding function** — a pure domain test alongside `elementDemand.test.ts`: given a spirit whose
  innates demand multiple elements with different supply/odds, it returns the lowest-odds element and
  that element's first-rung count; returns `undefined` for a spirit with no demand. This is the
  behaviour that matters and it needs no component.
- **Glossary tripwire** — a canon test mirroring `aspectCanon.test.ts`/`adversaryCanon.test.ts`:
  every entry in the map has non-empty `text` and a valid `source`; fails the build otherwise. This
  is the guardrail against fabricated/blank definitions.
- **Component smoke** — extend `appSmoke.test.tsx` so the Dashboard renders the element strip, the
  count chips, and a seeded state (via the existing `initialSpiritId` escape hatch) without crashing.
  No assertions on styling.

## Out of Scope

- A dedicated, browsable Glossary **page** (the map is structured to render as one later if wanted).
- A custom image **dropdown** component — the icon strip replaces the dropdown entirely.
- An edit **lock** flag (`touched`) — manual edits are transient by design.
- Authoring the raw-game-term definitions that have no in-repo source — those are an owner TODO,
  delivered as a list, not written by the agent.
- Any change to the "Highlight my spirit" `<select>` (it lists spirits, not elements) or to the odds
  math itself.

## Further Notes

Reading C from the design grill: the two widgets stay separate but the free-form one is seeded from
the spirit, rather than merging into one control. The glossary's provenance discipline is the same
one every dataset in this repo already follows (`ratingsSource`, `shiftsToward`, the canon tests);
`CONTEXT.md` now carries a **Glossary term** entry defining the concept and its `source` field.
