# Image retrieval reference for Spirit Island assets

Provided by the owner 2026-07-11, verbatim. These are verified sources and methods. Use real
digital source files at original quality, never screenshots or Google Images.

## Source A — SICK card catalog, https://sick.oberien.de/

Use it for all standard cards: unique powers, minor powers, major powers, events, fear cards,
blight cards. It is a static community site with no bot protection and no auth. Fetch `cards.js`
from the site root once. It serves two purposes: it is the index of every image path, and it is a
machine-readable database of every card with name, type, cost, elements and spirit association.
Extract every `imgs/` path referenced in it (jpg, png, webp) and download each one relative to the
site root. The folder `imgs/powers/` holds unique plus minor plus major power cards, and
`imgs/events/`, `imgs/fears/`, `imgs/blights/` are what they sound like. To map a unique power
card to its spirit, use the cards.js entries whose type reads `Unique Power:` followed by the
spirit name. Never infer the spirit from a filename and never assume 4 uniques per spirit — some
spirits have more. Do not use the GitHub repo oberien/spirit-island-card-katalog for images; the
images there are git-LFS files and public bandwidth quotas make downloads fail unpredictably. SICK
contains no aspect cards and no spirit panels; do not look for them there.

## Source B — Spirit Island Wiki MediaWiki API, https://spiritislandwiki.com/api.php

Use it for the aspect cards; exactly 31 exist. Query with `action=query`, `generator=images`,
`titles=List of Aspect Cards`, `prop=imageinfo`, `iiprop=url`, `format=json`, `gimlimit=500`, and
follow the continue token until exhausted. The `url` field returned in imageinfo points to the
full-resolution original. Never download from any path containing `/images/thumb/` — those are
shrunk previews. Aspect scans follow the filename pattern `Spirit Name (Aspect Name).png`. Discard
any result whose name contains box or flag. Expect exactly 31 files and report any other count.
Filenames include apostrophes and parentheses, so URL-encode them carefully. The same
`generator=images` technique works on any other wiki page title, such as List of Adversaries,
List of Scenarios, or an individual spirit page, if a gap ever needs filling.

**IMPORTANT — the CAPTCHA issue is not a captcha.** Reading this wiki API requires no login and
has no captcha. Earlier failures were the server rejecting default HTTP library user agents.
Rules: always send a descriptive User-Agent header such as
`SpiritIslandArchiver/1.0 (personal use, contact myemail@example.com)`. Reuse one HTTP session and
wait about 1 second between requests. If a request is still challenged, switch to a
Cloudflare-tolerant HTTP client. Never retry aggressively and never attempt captcha solving or any
login flow.

## Source C — Tabletop Simulator workshop JSON, provided in the workspace

Located at `images/spirit_island_tabletop_simulator_mod.json`. Use it for spirit panel boards
(play side and lore back), and for any adversary or scenario panels not handed over directly. The
file is plain JSON from the Steam Workshop Spirit Island mod. Search the entire file as raw text,
not only structured fields, because this mod is heavily scripted and some URLs live inside Lua
script strings. Collect every value of `FaceURL`, `BackURL`, `ImageURL`, `ImageSecondaryURL` and
any other http image URL found in the text. These resolve to public image hosts, mostly Steam user
content, and can be downloaded directly with a normal User-Agent. Deduplicate the URL list before
downloading. Match each downloaded image to its object by the `Nickname` or `Description` fields
near the URL in the JSON, which usually carry the spirit, adversary or scenario name. Panel fronts
show the spirit name in large lettering; panel backs show artwork with lore text. Watch out for
sprite sheets: some card decks are stored as one large grid image (deck atlas) rather than
individual cards — prefer the per-card sources from SICK and use the atlas only for things SICK
lacks. If a lore back cannot be found anywhere, flag it explicitly for the owner to scan manually
instead of substituting anything.

## Quality and handling rules

Download original files only; never re-encode, resize or compress (app-facing webp derivatives in
`public/` are a separate, downstream copy — the archive keeps originals). Renaming is encouraged:
convert everything to a clean, consistent, human-readable scheme keyed to spirit and card names,
for example `spirits/river_surges_in_sunlight/panel_front.png` and `panel_back_lore.png`. Maintain
a manifest file (JSON or CSV) mapping new filename → source URL → asset type → associated spirit,
derived from cards.js, wiki filenames, or the TTS Nickname fields. The canonical spirit name list
is on the wiki page All Spirits. Make all downloads resumable, skip files that already exist, and
be polite to these small community-run sites.

## Sanity counts

Report mismatches instead of finishing silently.

- Aspects: 31
- Event cards: about 64 (Branch and Claw 25, Jagged Earth 30, Nature Incarnate 9)
- Adversaries: 8
- Scenarios: 15
- Fear, blight and power card counts: derive from cards.js rather than hard-coding
