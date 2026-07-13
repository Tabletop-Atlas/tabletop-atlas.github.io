# 16 — Card-subject lists end to end

Status: done
Parent: [Phase 4 PRD](../PRD.md) · cluster 4 (tier UX)

## Blocked by

- [#12 the subject axis](12-the-subject-axis.md) — the domain seams this UI calls
- [#15 edit mode and the dissolution](15-edit-mode-and-the-dissolution.md) — rating a new card
  list happens through edit mode

## What to build

The tracer bullet through the whole multi-subject model, demoable as: *create a personal
minor-powers list, rate some cards on the board, reload, it's all still there.*

- The existing create-list flow gains a subject pick (configurations / minor-powers /
  major-powers).
- The list picker groups lists under subject headings ("Spirits", "Minor powers",
  "Major powers" — human labels, per the [architecture resolution](06-multi-tier-list-architecture.md)).
- The board renders **card tiles** for card-subject lists (card art via the existing card image
  conventions), spirit tiles for configurations lists — subject-appropriate, same tier rows.
- Edit mode works on personal card lists exactly as on the owner's board.
- Honest defaults: no shipped card list arrives with this ticket (a cited import is future work
  under ADR 0001's citation rules), and the collection's dimming/hard-filter applies to
  configurations boards only — card lists are ungated, matching the Archive's exemption.

## Acceptance criteria

- [x] Creating a personal list requires choosing a subject; the picker shows subject-grouped
      headings
- [x] A personal minor-powers list can be created, cards rated on the board, and everything
      survives reload
- [x] Card tiles render card art and names; spirit boards are pixel-unchanged
- [x] Cited-list immutability and canon tests unaffected; no card list ships with the app
- [x] Browser-verified at 375px + desktop (card tiles fit the board rows)

## Comments

**Resolved (2026-07-13).** The tracer bullet works: create a personal minor-powers list, rate
cards on the board through edit mode, reload, re-pick — all still there. Store: the editing
seams (`getTier/setTier/clearTier/getAll/reset/isCustomised/wasDiscarded/dismissDiscardNotice`)
take an optional `subject` defaulting `'configurations'` (every pre-#16 caller unchanged; empty
subjects read empty and swallow writes); `groupByTier` generalised with an `idOf` extractor.
UI: the create form gains a Subject pick (human labels), the picker groups by subject via
`optgroup`, the board renders portrait card tiles (existing `card.image` convention, placeholder
on missing file) for card lists and tracks a **viewed subject** whose list is always that
subject's active list — board and store cannot disagree by construction. Card boards are
collection-ungated (no dimming, no hard-filter checkbox), matching the Archive's exemption.
No card list ships; recommender prior stays configurations-only.

Code review fixed three real findings before commit: the spirit board's empty-tier copy had
changed ("pixel-unchanged" violated — now branched per subject), aspect tiles' edit-mode
accessible labels had lost their aspect names, and a viewed/active desync hazard behind a
test-only list-id prop (redesigned to subject-keyed viewing). Known edge, recorded not fixed:
`setTier` with a forgotten subject arg writes the key into the configurations list silently —
overrides are user-local, canon covers shipped data. 357/357; production build verified at
375px + 1280px (screenshots in `../screenshots-16/`).
