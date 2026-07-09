# 11 — Retrieve panel and card images, transcribe `startingCards` from them

Status: ready-for-agent

## Parent

`.scratch/v3/PRD.md`

## What to build

Two jobs, and they are one ticket because the second is done **by reading the output of the first**.

**Retrieve the images.** Panel front and back for each of the 37 spirits, and the four starting
power cards for each. Assets land at the paths #12 expects:

- `public/panels/<spiritId>-{front,back}.webp`
- `public/cards/<spiritId>-<n>.webp`, where `n` is the index into `startingCards`

**Transcribe the four card names per spirit, in panel order, by reading the panel front you just
downloaded.** Add `startingCards?: string[]` to `Spirit`.

Nothing else. **No cost, speed, range, target, element or effect field is added.** The moment one
is, the fabrication surface returns. Card rules text is legible on the card image (#12). The names
exist for exactly two reasons: four images on one page need four distinct alt texts, and an explicit
list beats an unverifiable filename convention for mapping spirit to card.

## The one rule

**A name you cannot read off an image is absent, and reported. Never recalled, never inferred from a
filename, never completed from a pattern in the other spirits.**

This is not a ceremony. This repo has shipped fabricated OCFDU ratings, elements wrong on seven of
nine spirits checked, and five aspects that do not exist — every time because something asked a
source for data it did not have and wrote a plausible guess. A model asked to name Lightning's Swift
Strike's four starting cards from memory will produce four plausible names, and they will look
exactly like four correct ones.

Reading them off a panel image you fetched is a different operation, and it is the operation that
worked: all 31 aspect effects were transcribed that way in v2. `WebFetch` renders wiki pages to
markdown and **throws the images away** — the text lives *in* those images. Download them and read
them directly.

So: if a panel cannot be retrieved, or its card names cannot be read, that spirit gets **no**
`startingCards` key and goes in the report at the bottom of this file. A spirit with three legible
names and one illegible one gets no key. Partial data here is worse than none — #12 maps card image
`n` to name `n` by index, so a three-name array silently mislabels a card.

## Acceptance criteria

- [ ] `startingCards?: string[]` on `Spirit`; no card attribute beyond the name is added
- [ ] Every name in the repo was read from a panel image present in this repo, not recalled
- [ ] `dataIntegrity.test.ts` asserts the shape **where present**: exactly four entries, each
      non-empty, each unique within its spirit
- [ ] A tripwire test pins the names and fails on drift, per `aspectCanon.test.ts`
- [ ] Spirits whose panel could not be sourced have no `startingCards` key and are listed under
      **Comments** below — an unsourced spirit is visible, not invisible
- [ ] Retrieved assets sit at the paths in #12; a spirit with no assets still renders (#12 covers
      the `PlaceholderArt` fallback, so this ticket may land incomplete without breaking the app)
- [ ] The report below names its image source and states how many of the 37 spirits are complete

## Notes

- **`startingCards` is optional**, deviating from the PRD's "every spirit has exactly four". The PRD
  wrote that criterion assuming a human with the panels in hand. An agent that cannot source one
  panel must be able to say so; a required field would force it to guess, which is the exact
  failure this ticket is written around. The shape test still pins four-or-none.
- **Rights: the owner has decided to proceed (2026-07-09).** This ticket takes the repo's public
  asset exposure from 37 images to roughly 259 — spirit art, plus panel fronts and backs, plus every
  starting card. That is functionally the printed content of the game's spirit components, hosted
  free on a public site, and it is the least comfortable position under copyright's market-effect
  factor. The owner has weighed that and accepted it: personal project, no monetisation, realistic
  worst case is a takedown request rather than a lawsuit, and he will deal with it if it arrives.

  Record what this decision is **not**, so a later reader does not mistake it for a legal finding:
  Greater Than Games' actual policy has never been read. Attribution is not a licence, and a
  trademark notice addresses a different body of law from the one that governs the images. Nobody
  has established that this is permitted; the owner has established that he is willing to proceed
  without knowing. **Do not go looking for reassurance in this note, and do not invent GTG's terms
  to fill the gap.** If the question ever needs a real answer, it is a research job against GTG's
  published community-content policy, not a recollection.

  Proceed with retrieval. Do not block on this.

## Comments

<!-- The implementing agent records here: the image source used, how many spirits were completed,
     and every spirit whose panel or card names could not be read. -->
