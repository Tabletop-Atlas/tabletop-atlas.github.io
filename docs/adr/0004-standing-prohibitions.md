# 0004 — Standing prohibitions: what this app will not compute

Status: accepted
Date: 2026-07-21

## Context

Across v1–v5 the owner and agents repeatedly reached the same conclusion about a tempting feature:
building it would mean stating something no source ever stated. These "we deliberately don't do X"
decisions were scattered through five PRDs' Out-of-Scope sections and one wayfinder map. Scattered,
they get re-proposed every few months. Collected here, a future effort sees the line before
crossing it. Each is an application of ADR 0003.

## Decision

The following are out of scope **permanently** — not deferred, not "not yet". Reversing any of them
means reopening this ADR with a source that removes the objection.

- **No blending or averaging tier lists into a consensus ranking.** Averaging sources with
  different methodologies and coverage produces a number no source ever stated (v3).
- **No authored player-count deltas.** Player count is metadata a cited list declares; deriving a
  solo tier from a four-player tier is inventing data (v3, phase-4). The player-count input that
  did nothing was removed rather than made to fake an effect.
- **No curated adversary/scenario compatibility matrix.** Logging what happened is not predicting
  what will happen; the game log must not become this matrix through the back door (v1, v2).
- **The game log feeds scoring exactly one fact: `timesPlayed`.** Outcomes (win/loss) are recorded
  and displayed but never scored — n is too small, and scoring them would silently corrupt
  owner-authored tiers and weights (v2).
- **No rating, tiering or ranking of cards.** The tier machinery is spirit-shaped and so are its
  sources; ranking 471 cards would be this repo inventing data. Cards may carry *descriptive*
  sub-types (what a card does) but never an *evaluative* axis — the "aggressive/less-aggressive"
  blight axis was dropped for exactly this reason (v4, v5). See CONTEXT.md's "Card sub-type".
- **No adversary subtype axis.** Canon defines none (checked the wiki's Adversary glossary, the
  Category:Adversaries index, and three adversary pages); the premise was mistaken, not a sourcing
  gap. `adversaries.json`'s existing fields are complete (legibility-pass #03).

## Consequences

- A feature request matching one of these has a one-line answer with a citation, not a fresh
  debate.
- The distinction that keeps card sub-typing legal — descriptive vs evaluative — is written down,
  so a future "just rank the fear cards" request is recognisably over the line.

## Left open, deliberately

**Element-threshold card matching** ("I have Sun + Fire + Plant — what can I play?") is *deferred,
not prohibited* — it states nothing unsourced, it is only more machinery. It is the thing that
would make the Cards tab better than SICK rather than a nicer SICK, and it is recorded in the v4
map's *Not yet specified*.
