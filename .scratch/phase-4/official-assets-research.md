# Official Spirit Island assets — feasibility & licensing (phase-4 #05)

Date: 2026-07-13

**Verdict.** Technically feasible, legally unpermissioned. The community has identified the game's
fonts and hosts usable icon files, so everything the app might want exists somewhere — but no
explicit permission covers any of it. The game's display font (Fling-a-Ling) is a commercial
MyFonts family whose own license must be bought regardless of what the publisher allows; the body
font (Reem Kufi) and the community's lookalikes are mostly free (OFL). Element and Fast/Slow icons
exist only as small PNGs (wiki-derived, ~26–80px), not official SVGs. The publisher's only known
fan-content statement (Greater Than Games era, recorded in the community FAQ) permits free,
non-commercial fan content and never mentions fonts, icons, or layout. Meanwhile the rights
situation is in flux: designer R. Eric Reuss declined to renew Flat River Group's license in June
2026, says ownership of the art/graphical assets is "less crystal-clear", and is commissioning
completely new art — so nobody can currently grant clean permission for the existing look, and it
may be superseded anyway.

## 1. Fonts

**What the game reportedly uses** (fan identification on BGG, not publisher-confirmed; the thread
itself blocks fetching — see dead ends — so this rests on search-result excerpts of it):

- Titles (cards, spirit panels, rulebook): **Fling-a-Ling**; body text: **Reem Kufi**.
  Source: BGG thread "Fonts used in component text" (Jan 2024),
  https://boardgamegeek.com/thread/3223503/fonts-used-in-component-text
- An older thread exists ("Odd Question: What Fonts does the game use?",
  https://boardgamegeek.com/thread/1958538/) — inaccessible, contents unknown.

**Each font's own license** (separate from anything the publisher permits):

| Font | Role | License | Source |
|---|---|---|---|
| Fling-a-Ling (TypeArt Foundry) | title/display | **Commercial** — MyFonts, from ~$45/style; webfont license sold separately | https://www.myfonts.com/collections/fling-a-ling-font-typeart-foundry |
| Reem Kufi | body text | SIL OFL — free to self-host | https://fonts.google.com/specimen/Reem+Kufi |
| DK Snemand (Hanoded/David Kerkhoff) | community lookalike for titles | Free for **personal** use; donation for commercial; license text explicitly forbids use "in games, apps, or software" without contacting the author | https://www.dafont.com/dk-snemand.font |
| Gobold (Situjuh Nazara) | community lookalike (energy/headings) | Free personal; commercial = min $10 donation or Creative Fabrica license | https://www.dafont.com/gobold.font |
| Mouse Memoirs, Josefin Sans, Lato, Noto Sans | community lookalikes for headings/rules text | SIL OFL (OFL.txt bundled in the builder repo) | https://github.com/spirit-island-builder/spirit-island-builder (static/template/_global/fonts/) |

**Lookalike font files in the wild:** the Spirit Island Builder repo bundles DK Snemand and Gobold
OTFs (apparently sourced from ffonts.net, per bundled `ffonts.net.txt`) alongside the OFL fonts —
that repo has **no license file** (GitHub API reports `license: null`). The older
Gudradain/spirit-island-template (MIT for code) uses Mouse Memoirs and recommends DK Snemand /
Gobold Extra2 but excludes them "due to licensing".
Sources: https://github.com/spirit-island-builder/spirit-island-builder ,
https://github.com/Gudradain/spirit-island-template

## 2. Icons (elements, Fast/Slow)

- **Spirit Island Wiki** hosts the element icons as PNGs — `Esun.png`, `Emoon.png`, `Efire.png`,
  `Eair.png`, `Ewater.png`, `Eearth.png`, `Eplant.png`, `Eanimal.png` (~26px) plus "simple"
  variants, used via https://spiritislandwiki.com/index.php?title=Template:Element . Some wiki
  files are SVG (e.g. https://spiritislandwiki.com/index.php?title=File%3AExplorer.svg ) but the
  element icons found are raster.
- **spirit-island-builder repo** carries the same wiki-derived PNGs at multiple sizes
  (`25px-Fasticon.png`, `50px-Slowicon.png`, `35px-`/`80px-*element.png`, `Anyelement.png`,
  `element_simple_*.png`, `fast_power.png`, `slow_power.png`) under
  `static/template/_global/images/`. Filenames match MediaWiki thumbnail conventions — i.e. pulled
  from the wiki. https://github.com/spirit-island-builder/spirit-island-builder
- **oberien/spirit-island-card-katalog** (sick.oberien.de) hosts full card scans (webp/jpg via
  git-lfs), not standalone icon files. https://github.com/oberien/spirit-island-card-katalog
- A fan-made **icon font for Spirit Island symbols** exists on BGG (filepage 167450,
  https://boardgamegeek.com/filepage/167450/font-for-spirit-island-symbols ) — download requires a
  BGG login; format/quality/license: unknown.
- **No official vector (SVG) element or speed icons were found anywhere.** Quality ceiling is
  ~80px PNG unless someone traces them.

## 3. Panel formatting / trade dress

No source found that addresses Spirit Island's trade dress or whether replicating the panel layout
is permitted or restricted: **unknown**. The closest primary statement is Reuss's June 2026 post
distinguishing the layers: game mechanics and names are not copyrightable, while ownership of the
"art & graphical assets" is "less crystal-clear" (contested with Flat River Group) —
https://rericreuss.com/2026/06/26/spirit-island-update-june-2026/ . Whether a CSS re-creation of
the panel *layout* (no copied artwork) infringes anything: unknown.

## 4. The publisher's policy

**No standalone fan-content/IP policy page exists on greaterthangames.com** (searched the site,
their shop, and the forums; only a generic forum ToS surfaced — see dead ends).

The recorded position lives in the community-maintained official FAQ (on Querki, whose fan-content
terms Reuss has personally endorsed in BGG threads), section "Creating your own game elements",
https://querki.net/raw/darker/spirit-island-faq/Creating-your-own-game-elements — close paraphrase:

> The publisher (Greater Than Games) allows fan-created content as long as it doesn't involve
> (a) charging money for it, (b) portraying it as an official Spirit Island product, or
> (c) posting it on the official greaterthangames.com forums. The designer (R. Eric Reuss) asks
> that players respect the publisher's wishes; anyone sending him ideas must accept that he has no
> obligation to look or reply, that no credit or compensation is owed, and that all rights to
> Spirit Island ideas are assigned to him.

The FAQ says nothing about fonts, icons, scans, or layout. Whether this GTG-era statement binds
the current/next rights holder: **unknown**.

**Current rights holder (in flux):**
- Flat River Group (FRG) acquired Greater Than Games ~2021–22
  ( https://icv2.com/articles/news/view/49904/flat-river-group-gets-greater-than-games ).
- April 2025: FRG laid off nearly all GTG staff and suspended new projects
  ( https://www.gamesradar.com/games/board-games/publisher-behind-beloved-board-game-spirit-island-shuts-but-the-designer-is-certainly-not-done-with-the-game/ ).
- April 2026: FRG sold the GTG brand and Sentinels to Handelabra
  ( https://boardgamewire.com/index.php/2026/04/15/flat-river-sells-greater-than-games-brand-sentinels-of-the-multiverse-to-digital-developer-handelabra/ );
  May 2026: GTG brand back with its founders
  ( https://boardgamewire.com/index.php/2026/05/12/greater-than-games-back-in-hands-of-founders-christopher-badell-paul-bender-has-multiple-games-in-development/ ).
- June 2026 (primary): Reuss owns Spirit Island via Lightning Heart Games LLC, declined FRG
  renewal, claims senior common-law trademark rights though FRG holds the registration, calls art
  ownership "less crystal-clear", and is commissioning "completely new non-derivative art,
  graphical assets, etc." for the next edition
  ( https://rericreuss.com/2026/06/26/spirit-island-update-june-2026/ ;
  https://boardgamewire.com/index.php/2026/06/26/spirit-island-set-for-new-publisher-as-designer-declines-flat-river-renewal-plans-complete-art-overhaul/ ).

## 5. Community precedent (evidence, not permission)

- **spiritislandwiki.com** hosts element icons and hundreds of game images; footer: "Content is
  available under Creative Commons Attribution-NonCommercial-ShareAlike unless otherwise noted."
  No permission statement from GTG appears, and the wiki cannot relicense artwork it doesn't own —
  the CC license credibly covers only wiki-authored content.
  https://spiritislandwiki.com/index.php?title=Main_Page
- **oberien/spirit-island-card-katalog** hosts complete card scans publicly at sick.oberien.de;
  its README states: "Licensed under either of Apache License, Version 2.0 [or] MIT license … with
  parts copyrighted by Greater Than Games, LLC. All images and some text belongs to Greater Than
  Games, LLC." Its image pipeline used PDFs/webps "provided by Dylan Thurston" and notes "GtG can
  pdf-dump the card-pdfs" — suggestive of cooperation, but no license grant is documented.
  https://github.com/oberien/spirit-island-card-katalog
- **spirit-island-builder** (spiritislandbuilder.com) publicly ships wiki-derived icons plus
  DK Snemand and Gobold font binaries, with no repo license.
  https://github.com/spirit-island-builder/spirit-island-builder
- Years of fan content (Steam Workshop mods, BGG uploads) circulate under the FAQ terms without
  reported takedowns — tolerance, not permission.

## 6. Recommendation

- **Safe:** self-host the OFL fonts — Reem Kufi for body (reportedly the actual game body font)
  and an OFL heading font (Mouse Memoirs, Josefin Sans); reproduce the general look with CSS.
  These licenses permit web embedding outright.
- **Risky but same risk-class as what you already host:** the wiki's element/speed PNG icons.
  Same provenance as the 259 images already hosted; strong community precedent, zero documented
  permission. Quality caps at ~80px PNG.
- **Do NOT assume your image-risk acceptance covers fonts.** Font files are separately licensed
  software with their own owners: Fling-a-Ling requires a paid MyFonts webfont license (that
  purchase is the one *clean* way to get the real title font); DK Snemand's free version forbids
  use in apps/software without contacting the author; Gobold wants a donation for commercial use
  and it's unknown whether a free fan site counts as personal use. Using any of these unpaid is a
  new, separate infringement against the *foundry*, not GTG.
- **Unknowns to accept:** no GTG policy page exists; whether the FAQ statement binds FRG or the
  next publisher is unknown; trade-dress status of a CSS layout clone is unknown.
- **Strategic note:** the next edition will have entirely new art and graphical assets. Effort
  invested in pixel-matching the current (FRG-era, ownership-disputed) look may be obsolete within
  a publishing cycle.

## Sources — everything consulted

- https://boardgamegeek.com/thread/3223503/fonts-used-in-component-text (font IDs; page 403s, XML API 401s — content via search excerpts only)
- https://boardgamegeek.com/thread/1958538/odd-question-what-fonts-does-the-game-use (dead end: 403/401, content unknown)
- https://boardgamegeek.com/filepage/167450/font-for-spirit-island-symbols (fan icon font; login-gated, unverified)
- https://www.myfonts.com/collections/fling-a-ling-font-typeart-foundry · https://fonts.google.com/specimen/Reem+Kufi · https://www.dafont.com/dk-snemand.font · https://www.dafont.com/gobold.font (font licenses)
- https://github.com/Gudradain/spirit-island-template · https://github.com/spirit-island-builder/spirit-island-builder · https://github.com/oberien/spirit-island-card-katalog (fan repos: fonts, icons, licenses)
- https://spiritislandwiki.com/index.php?title=Main_Page (CC footer) · …?title=Template:Element (icon files) · …?title=File%3AExplorer.svg (SVG exists) · …?title=Spirit_Island_Wiki:Copyrights (dead end: 404)
- https://querki.net/raw/darker/spirit-island-faq/Creating-your-own-game-elements (fan-content terms; the JS app URL https://querki.net/u/darker/spirit-island-faq/ doesn't render for fetchers)
- https://rericreuss.com/2026/06/26/spirit-island-update-june-2026/ (primary: rights situation)
- https://boardgamewire.com/index.php/2026/06/26/spirit-island-set-for-new-publisher-as-designer-declines-flat-river-renewal-plans-complete-art-overhaul/ · …/2026/04/15/flat-river-sells-greater-than-games-brand-sentinels-of-the-multiverse-to-digital-developer-handelabra/ · …/2026/05/12/greater-than-games-back-in-hands-of-founders-christopher-badell-paul-bender-has-multiple-games-in-development/
- https://icv2.com/articles/news/view/49904/flat-river-group-gets-greater-than-games · https://www.gamesradar.com/games/board-games/publisher-behind-beloved-board-game-spirit-island-shuts-but-the-designer-is-certainly-not-done-with-the-game/
- greaterthangames.com site search for fan/IP policy (dead end: only forum ToS at https://forums.greaterthangames.com/tos ; no policy page found)
- web.archive.org (dead end: fetch blocked in this environment)
