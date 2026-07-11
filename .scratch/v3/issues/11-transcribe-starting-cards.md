# 11 — Retrieve panel and card images, transcribe `startingCards` from them

Status: done (cards and panels both landed, see Comments)

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

**Cards: completed 2026-07-09, all 37 spirits.** Source: `spiritislandwiki.com`'s "Unique Power
Cards" section per spirit page — the same site used for v2's aspect transcriptions. Every name
was read from the `title` attribute on that section's card links (the clean, canonical name;
not the alt text, which carries a filename-derived origin tag like "(base).png"), verified
against the real fetched markup, never recalled. Images are the full-resolution originals
(`/images/X/YY/Name.png`), not the wiki's thumbnail variants. Converted to webp (`cwebp -q 85`)
at `public/cards/<spiritId>-<n>.webp`. Pinned by `startingCardsCanon.test.ts` (all 37, all 4 per
spirit, in the order the wiki's Unique Power Cards section lists them) and by
`dataIntegrity.test.ts`'s asset-existence and shape checks. Paced at 2.5–3.5s between requests
after the CAPTCHA gate cleared; one image (Volcano Looming High's first card) needed a solo
retry after a single transient failure, everything else succeeded on the first pass.

One name worth flagging so a future reader doesn't mistake it for a transcription error:
Relentless Gaze of the Sun's fourth card is genuinely titled "Wither Bodies, Scar Stones" (comma
included) — verified against the raw wiki markup and the image filename
(`Wither_Bodies%2C_Scar_Stones`), not a parsing artifact.

**Panels: new source incoming (2026-07-11).** The owner has a Tabletop Simulator mod containing
the panel images, already downloaded locally. He will upload them to the repository and provide
the mod's website and repository for the source citation. **Deferred until that upload lands** —
do not attempt the `spirit-island-builder` browser-automation route in the meantime. When the
files arrive: convert to webp at `public/panels/<spiritId>-{front,back}.webp` (the paths #12
expects), record the mod as the source here, and wire them into the detail view.

**Panels: still not sourced.** Checked two spirits from different expansions (Lightning's Swift
Strike, Starlight Seeks Its Form) after the CAPTCHA cleared — same result as the first pass,
confirmed rather than re-guessed: the wiki's Gallery section holds only a small "Home" icon per
spirit, no board/panel scan under any of the naming conventions checked. Not re-attempted this
pass. The `spirit-island-builder` lead from the first pass (real official per-spirit layout data,
but needs actual browser automation to export a PNG) is still the most promising lead; unattempted.

---

**Earlier pass (2026-07-09, superseded above for cards):**

**Not completed this session — research done, zero assets landed, nothing in the repo touched.**
Status left as `ready-for-agent`. Findings, so the next attempt doesn't re-derive them:

**Starting cards: sourceable, blocked mid-session by rate limiting, not by data availability.**
`spiritislandwiki.com` has a "Unique Power Cards" section per spirit page (MediaWiki, page title
= spirit name with `'` percent-encoded as `%27`) containing exactly the four starting cards'
names (as the `title` attribute on each card's `<a>`) and full-resolution images (`/images/X/YY/
Name.png`, not the `/images/thumb/...` variant). Confirmed end-to-end for Lightning's Swift
Strike: Harbingers of the Lightning, Lightning's Boon, Raging Storm, Shatter Homesteads. After
~5 automated requests the site started returning a CAPTCHA challenge
(`/.well-known/sgcaptcha/...`) for *every* request, including plain image URLs - not just page
fetches. Did not attempt to work around it. Next attempt: space requests several seconds apart
from the start, expect to need multiple sessions across several days if the block re-triggers,
and stop immediately (don't retry-loop) if the captcha page reappears.

**Panels: no static images exist on spiritislandwiki.com at all** (checked before hitting the
rate limit) - no Gallery entry, no `File:<Spirit>_Panel.png`/`_Board.png` naming, nothing under
`Special:ListFiles` beyond a couple of generic component templates. Do not re-check this; it was
verified absent, not merely unfound.

**A second, promising source for panels: github.com/spirit-island-builder/spirit-island-builder**
(spiritislandbuilder.com's repo) ships an "OFFICIAL_<spirit name>.html" file for every one of the
37 spirits under `static/template/MyCustomContent/MySpirit/` - real official panel data (growth
track, presence track, innate power text), not a fabrication risk. **But it is not a static
image**: each file is a `<board spirit-image="data:...">` custom element meant to be rendered by
the site's own SvelteKit client JS (there's a client-side screenshot tool at
`src/lib/preview-frame/take-screenshot.js`, no server-side image export API). Getting a PNG out
of it requires either (a) running their dev server locally and driving a real browser through
their UI to trigger the export, or (b) the owner exporting the 37 panels himself via
spiritislandbuilder.com's built-in tool and handing the files over. Neither was attempted this
session - (a) needs browser-automation tooling this session didn't have; (b) is the owner's call
on his own time, not something to delegate back silently.

**Recommendation for the next attempt:** land cards first (bounded, already half-verified, just
needs pacing). Treat panels as a separate hand-off: ask the owner to export via
spiritislandbuilder.com, or equip a future session with real browser automation before attempting
route (a).

**Panels landed 2026-07-12**, via a third source neither of the two above: the owner supplied a
Tabletop Simulator workshop mod JSON (`.scratch/asset-archive/`, PRD + tickets #01–#07) containing
Steam-hosted panel scans for all 37 spirits. `.scratch/asset-archive/issues/01-inventory-tts-json.md`
found and deduplicated the URLs from the JSON's raw text (`FaceURL`/`BackURL` fields); `04-name-spirit-panels.md`
matched all 74 files to spirits via `Nickname` context and determined front-vs-back by directly
opening and reading every one of the 74 images (not inferred from filenames); `06-unify-manifest-verify-counts.md`
recorded them in the committed `images/manifest.json` with source URLs, citing the mod's own
`SaveName` ("Spirit Island - [By MJ & iakona]") since no Workshop URL string exists anywhere in
the JSON (one remaining owner ask: which Workshop listing this was subscribed from);
`07-panels-into-app.md` converted the originals to `public/panels/<spiritId>-{front,back}.webp`
(`cwebp -q 85`, same as the cards) and browser-verified them rendering in the detail modal at
375px with no horizontal overflow. `dataIntegrity.test.ts` now asserts both panel files exist for
every spirit, unconditionally (#04 found zero gaps). The github.com/spirit-island-builder route
above was never revisited — the TTS mod turned out to be the faster path.
