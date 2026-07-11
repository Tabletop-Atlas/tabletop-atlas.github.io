# 07 — Panels into the app (closes out v3 #11's panel half)

Status: done
Labels: wayfinder:task
Assignee: agent

## Parent

`.scratch/asset-archive/MAP.md` and [PRD.md](../PRD.md). Also read
`.scratch/v3/issues/11-transcribe-starting-cards.md`
and `12-panel-and-card-images.md` — this is the step they've been waiting on.

## Question

Get the spirit panels rendering in the detail view instead of `PlaceholderArt`.

- From the archive originals (#04), convert to webp (`cwebp -q 85`, matching the cards) at
  `public/panels/<spiritId>-{front,back}.webp` — the exact paths `SpiritDetail.tsx` already
  expects per v3 #12.
- `spiritId` mapping comes from the repo's spirit data in `src/`; a panel that can't be matched
  to a spiritId is skipped and reported, not guessed.
- Extend `dataIntegrity.test.ts`'s asset-existence check to panels (mirroring what it already
  does for cards), tolerating the explicitly-reported gaps from #04 if any.
- Verify in the real app (headless browser, as v3 #12 did): a spirit tile opens with real panel
  images, no horizontal overflow at 375px.
- Record the resolution **also** in v3 #11's Comments (source: the TTS mod, citation from #06's
  manifest work or #01's finding) and update its Status line — it's currently
  `done (cards only — panels remain unsourced)`.

## Acceptance criteria

- [ ] Every spirit with named panels renders real front and lore-back images in the detail view;
      only #04-flagged gaps still show `PlaceholderArt`
- [ ] Derivatives exist at the contract paths the detail view already requests; no component
      changed
- [ ] `dataIntegrity.test.ts` asserts both panel derivatives per spirit, mirroring its card block,
      tolerating only #04's flagged gaps
- [ ] Unmatchable panels are skipped and reported, never guessed onto a spiritId
- [ ] Browser-verified: real panels in the modal, no horizontal overflow at 375px
- [ ] v3 #11's Comments record the panel resolution and its Status line is updated

## Blocked by

- #04 (needs the named panel originals)

## Comments

Converted all 74 archive originals (#04, `images/spirits/<id>/panel_front.png` +
`panel_back_lore.png`) with `cwebp -q 85` — same setting v3 #12 used for cards — to
`public/panels/<spiritId>-{front,back}.webp`, the exact paths `SpiritDetail.tsx` already
requests. No component changed. #04 found zero gaps across all 37 spirits, so all 37 got both
sides; nothing was skipped.

`dataIntegrity.test.ts` gained `'ships a panel front and back for every spirit...'` alongside the
existing card-asset block, unconditional (not gap-tolerant like the optional `startingCards`
check) because #04's resolution recorded no flagged spirits. Full suite: 245 tests pass (up from
244 — one new test), typecheck and oxlint clean.

**Browser-verified**, not just test-covered: dev server + Playwright at a 375px viewport, `Browse`
tab, opened Lightning's Swift Strike's detail modal. Both `panels/lightnings-swift-strike-front.webp`
and `-back.webp` loaded (`naturalWidth: 2697, complete: true` — not falling back to
`PlaceholderArt`), and the panel section visibly renders the real growth/presence/innate-powers
artwork. `document.documentElement.scrollWidth === clientWidth` (375 === 375) — no horizontal
overflow.

Recorded in v3 #11's Comments per this ticket's ask; its Status line updated from
`done (cards only — panels remain unsourced)` to reflect panels landing.
