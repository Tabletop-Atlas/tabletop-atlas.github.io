# 05 — Official assets: feasibility and licensing

Status: done
Type: wayfinder:research (AFK)
Parent: [phase-4 map](../MAP.md)

## Blocked by

_(nothing)_

## Question

Can the app plug in Spirit Island's official fonts, icons, and formatting? Two halves, both
required:

1. **Feasibility.** Do usable assets actually exist — the display font(s) used for spirit names,
   the element/speed icon set, the panel layout conventions? Where would they come from (fan
   wikis, community repos, extracted PDFs), in what formats, and at what quality?
2. **Licensing.** What does Greater Than Games' fan-content / asset policy actually permit for a
   publicly hosted fan site? Cite the policy text. Community precedent (what the established fan
   sites do, e.g. the card katalog this repo already sources data from) is evidence worth
   recording, but is not itself permission.

CLAUDE.md's fabrication rule binds hardest here: every claim cites a source or says **unknown**.
No confident guesses about what a publisher permits.

Context: the owner has already accepted hosting risk for ~259 game images knowingly — but that
was images. Fonts/icons/formatting is a separate call, and the owner makes it on this ticket's
findings, not by extension. Note the locked decision "Spirit Island font for spirit names in
Browse" is **contingent** on this ticket: if the answer is no, that decision returns to the owner.

Deliverable: a markdown summary in `.scratch/phase-4/` (assets found, formats, licensing findings
with citations, a recommendation), linked from this ticket. Feeds
[#03](03-the-radar-chart-fix-or-replace.md)'s official-styling seam, the locked grid-tag icon
option, and the theming fog on the map.

## Comments

**Resolution (2026-07-13, AFK research agent; full findings with citations in
[official-assets-research.md](../official-assets-research.md)):**

**Verdict: technically feasible, legally unpermissioned — and the rights are actively in flux.**

- **Fonts are a separate, new risk — the image-risk acceptance does not cover them.** The game's
  title font is reportedly **Fling-a-Ling** (commercial, MyFonts, ~$45/style + separate webfont
  license — buying it is the one *clean* path); the body font **Reem Kufi** is OFL and free to
  self-host. The community's free title lookalike (DK Snemand) explicitly forbids use in
  apps/software; Gobold is donation-ware. OFL approximations exist (Mouse Memoirs, Josefin Sans).
- **No official vector icons exist.** Element and Fast/Slow icons are wiki-derived PNGs capped at
  ~80px — same provenance/risk class as the 259 images already hosted.
- **No publisher fan policy page exists.** The only recorded position (GTG-era, in the
  community FAQ Reuss has endorsed): fan content is fine if free, not portrayed as official, and
  not posted on their forums. Whether it binds the current rights holder: **unknown.**
- **Rights are contested (June 2026, primary source rericreuss.com):** Reuss owns the game via
  Lightning Heart Games, declined Flat River's renewal, calls art-asset ownership "less
  crystal-clear", and is commissioning **entirely new art** — pixel-matching the current look may
  be obsolete within a publishing cycle.
- **Fallout for the locked calls** (returned to the owner, per this ticket's contingency rule,
  and settled at spec assembly): the spirit-name font call needs an owner pick (buy real /
  OFL approximation / skip); the grid-tag "or official icons" option is 80px-PNG-capped; the
  homepage disclaimer wording can simply satisfy the FAQ terms (unofficial, fan-made,
  non-commercial).
