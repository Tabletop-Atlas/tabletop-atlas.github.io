# 16 — Card-subject lists end to end

Status: ready-for-agent
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

- [ ] Creating a personal list requires choosing a subject; the picker shows subject-grouped
      headings
- [ ] A personal minor-powers list can be created, cards rated on the board, and everything
      survives reload
- [ ] Card tiles render card art and names; spirit boards are pixel-unchanged
- [ ] Cited-list immutability and canon tests unaffected; no card list ships with the app
- [ ] Browser-verified at 375px + desktop (card tiles fit the board rows)
