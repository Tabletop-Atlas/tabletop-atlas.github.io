# PRD — Panel theming for the spirit detail modal

Status: ready-for-agent
Parent map: [Panel theming wayfinder map](MAP.md) — the map's tickets are the work plan; this
spec is the assembled contract they build against.

## Problem Statement

The spirit detail modal is where a player meets a spirit — art, profile, aspects, starting
cards — but it looks like the rest of the app's dark "command deck" chrome, not like Spirit
Island. The owner's words after the phase-4 build: the OCFDU profile "feels a bit out of theme…
I really wanted it to align with what is in the panels." The printed spirit panels have a
strong, recognisable identity — parchment surfaces, dark-brown lettering, figures carried in
round stone-like nodes — and none of it reaches the app. The #23 vertical bars were an explicit
stopgap, shipped with the theming conversation deliberately deferred.

## Solution

Give the spirit detail modal a panel-aligned visual treatment, chosen by the owner from real
rendered candidates rather than argued in the abstract. A variant round presents three coherent
compositions on the live modal — a light true-parchment card, a dark translation of the panel
palette, and a conservative anchor keeping the current bars — built from a vibe sheet of
colours and forms sampled from the panel scans the app already hosts. The owner's pick ships as
the modal's default look. The round may replace the OCFDU bars with panel-style nodes (the
presence-track idiom). Fidelity is vibe, not replica: palette, node idiom, and typographic
hierarchy — never pixel-matched panel chrome. The effort ends with the owner's one-line verdict
on whether the aesthetic spreads further; spreading itself is a future effort.

## User Stories

1. As a player opening a spirit's detail, I want the modal to feel like a Spirit Island panel, so that the app reads as a companion to the game rather than a generic dashboard.
2. As a player, I want the spirit's Offense/Control/Fear/Defense/Utility presented in the panels' visual language, so that the profile feels native to the game I know.
3. As a player, I want the OCFDU figures to stay legible and truthful (a 6 reads "6", unrated stays absent), so that theming never costs me information.
4. As a player on a phone, I want the themed modal to fit a 375px screen without horizontal scrolling, so that the redesign doesn't degrade mobile use.
5. As a player, I want the modal's existing content — art, complexity dots, expansion chip, tag chips, tier chips, aspects, starting cards — to remain present and legible under the new treatment, so that nothing regresses for the sake of looks.
6. As a player with the modal open next to Browse, I want the transition between the dark app and the themed modal to feel deliberate (a panel "card" over the deck), so that the contrast reads as design, not inconsistency.
7. As the owner, I want to react to three real rendered compositions on the live modal, so that I pick a direction by looking, not by imagining.
8. As the owner, I want one candidate to be a true light parchment and one a dark translation, so that the light-vs-dark question is answered by reaction rather than argument.
9. As the owner, I want a conservative anchor variant (current bars, retinted), so that I can judge whether the bolder compositions actually earn their change.
10. As the owner, I want the candidates built from colours sampled off the real panel scans, so that "parchment" means the game's parchment, not a guess.
11. As the owner, I want my pick and my reaction notes (e.g. "A but warmer") recorded on the ticket, so that the shipped version reflects what I actually asked for.
12. As the owner, I want the round to never self-close, so that nothing ships without my pick.
13. As the owner, I want the losing candidates' scaffolding fully deleted after my pick, so that the codebase carries no dead variants.
14. As the owner, I want a recorded verdict step after living with the shipped modal, so that the "does this spread further" decision is made with the result in hand.
15. As a rights-cautious owner, I want the treatment to borrow vibe rather than replicate panel chrome, so that the app avoids the unknown trade-dress territory the licensing research flagged.
16. As a contributor reading the repo later, I want the sampled palette, its provenance, and the pick recorded in the effort's tickets, so that the theme's origins are traceable.
17. As a maintainer, I want the new palette pinned apart from the app's other colour systems by test, so that panel colours can never be confused with tier, tag, expansion, or difficulty-band colours.
18. As a maintainer, I want the treatment expressed through the app's existing colour-home and CSS conventions, so that the theme has one source of truth like every other palette.
19. As a screen-reader or keyboard user, I want the modal's semantics (headings, buttons, close control) unchanged by the retheme, so that accessibility survives the visual pass.
20. As a player who never opens this modal, I want every other surface byte-unchanged, so that the effort's blast radius is exactly one component.

## Implementation Decisions

- **Scope is the spirit detail modal only.** No other surface changes. The spread question is
  answered at the end of the map as a verdict, never as work on this effort.
- **The work plan is the wayfinder map's four tickets**: vibe sheet (research) → variant round
  (HITL) → ship the winner (execution) → spread verdict (HITL grilling). This spec does not
  replace the map; it pins the contract the tickets share.
- **The vibe sheet is the palette's provenance.** Colours are sampled from the panel scans the
  repo already hosts (named per panel), grouped into surface/text/accent roles, each with a
  proposed dark-translation. Node anatomy and type hierarchy are described as CSS-achievable
  properties. Sampled hexes are design judgment informed by real assets — not game data, so no
  canon tripwire is owed; provenance is recorded on the ticket instead.
- **Three coherent compositions, not a factorial grid**, gated on `?panel=A|B|C` with the
  floating-switcher pattern the repo's rounds already use (namespaced param; byte-identical
  app without it): A = light parchment surface + node-style OCFDU; B = dark translation +
  nodes; C = dark translation + the existing vertical bars retinted (anchor).
- **The OCFDU widget's form is re-opened**: nodes may replace bars. Whatever the form, the
  settled data rules carry over unchanged — the track represents 5, transcribed 6s clamp
  visually while the figure shows the truth, absence means unrated and renders nothing.
- **Fidelity: vibe, not replica.** Palette, node idiom, and typographic hierarchy using the
  shipped OFL faces (Mouse Memoirs display, Reem Kufi body — no new fonts, no new icon or
  texture assets). No pixel-matching of panel chrome, borders, or layout. This is both the
  owner's risk call and pragmatism: the next edition replaces the printed look anyway.
- **The winning palette lands in the app's colour home** (the module where expansion, tag,
  kind/speed, and band palettes live), applied by the same inline-colour-from-map +
  CSS-shape-class idiom the other systems use. CSS cascade hazards found this phase (later
  `font:`/`color` shorthands overriding earlier rules at equal specificity) are checked
  explicitly when the winner ships.
- **Chips on a light surface are mapped fog, not this round's problem.** If a light variant
  wins, variants will have held the existing dark-tuned chips as-is and noted the tension; the
  adaptation becomes its own ticket when the pick makes the question sharp.
- **Process contract per ticket** (inherited from the house pattern): production-build
  verification at 375px + desktop, screenshots kept per round, two-axis code review before
  each commit, one commit per ticket, tickets close with resolution comments; the round ticket
  waits at `needs-info` for the owner and is never closed by an agent.

## Testing Decisions

- **A good test asserts external behaviour at an existing seam** — what renders, never how.
  This effort adds zero new test infrastructure.
- **App smoke (the single UI seam):** SSR assertions that the shipped modal carries the panel
  treatment and that the OCFDU truth rules survive it — the true figure renders for a
  transcribed 6, unrated stays absent. Prior art: the existing #11/#17/#23 smoke assertions on
  the spirit detail.
- **Palette collision test (existing file):** the panel palette is pinned pairwise-distinct
  from the expansion, tag, kind/speed, and scenario-band palettes, byte-for-byte. Prior art:
  the #21 chip-colour test.
- **Domain seam only if the round yields new pure logic** (e.g. a figure→node mapping
  function): tested as a pure function. Prior art: the scenario difficulty-figure tests.
- **Playwright against the production build remains process, not committed tests** — run per
  ticket at 375px + desktop, results recorded in resolution comments.

## Out of Scope

- Retheming any surface beyond the detail modal — Browse, tier board, Archive, the app shell.
  A "yes" spread verdict charters a new effort; it does not extend this one.
- Pixel-faithful recreation of panel chrome, ornate borders, or layout structure.
- New fonts, icons, or texture assets — the OFL font decisions (#22) and the official-assets
  research stand; this effort consumes them.
- Reopening the OCFDU data rules (scale, clamping, absence) — presentation may change; the
  rules may not.
- The light-theme adaptation of chip palettes (fog on the map; becomes a ticket only if a
  light variant wins).

## Further Notes

- The rights posture is recorded: the owner accepted image-hosting risk knowingly (memory +
  phase-4 record), and chose vibe-level fidelity here specifically because trade-dress status
  is unknown and the next edition obsoletes the current look.
- The owner picks treatments, agents build them — the standing HITL rule for every 🎨 round in
  this repo. A future session must never "helpfully" ship a winner from this spec alone; the
  pick lives on the round ticket.
- The verdict ticket closes the map either way. If the verdict is "spread", the new effort
  starts with its own wayfinder charting — this spec deliberately says nothing about what
  spreading would look like.
