# 03 — The recommender scores on normalised rank

Status: done

## Parent

`.scratch/v3/PRD.md`

## What to build

`recommend` currently owns a `TIER_VALUE` table mapping the letters `X`..`F` to numbers. That table
is a judgment about one list's vocabulary, baked into the scoring module. Two lists with different
vocabularies cannot both be right about it.

Rank becomes a **position**, computed against each list's own `tierLabels`:
`rank = index / (tierLabels.length - 1)`, giving `0` for the strongest band and `1` for the weakest.
A single-band list ranks everything `0`.

- `recommend` takes `tierPrior?: Record<string, number>` — normalised rank, not a `Tier`.
- `TIER_VALUE` is **deleted**. `recommend` no longer imports `Tier` and no longer knows what a tier
  letter is.
- `NEUTRAL_TIER_VALUE` stays. A configuration missing from `tierPrior` scores mid-scale: an explicit
  refusal to move the score, not an invented tier. Unrated is a display concern, and this module
  does not display.
- `tierStore` exposes the ranks for the active list.
- The recommender's result rows keep showing a tier letter; they read it from `tierStore`, which
  knows the vocabulary, rather than from anything `recommend` returns.

## Acceptance criteria

- [ ] `TIER_VALUE` does not appear anywhere in the source; `recommend.ts` does not import `Tier`
- [ ] A configuration absent from `tierPrior` scores identically to one sitting at the neutral rank
- [ ] Two lists with different `tierLabels` but the same *position* for a spirit produce the same
      prior for it
- [ ] A single-band list (`tierLabels.length === 1`) ranks every rated configuration `0` without
      dividing by zero
- [ ] The existing `ALPHA_MAX` assertion still holds: the prior can never fully override fit
- [ ] Result rows still show a tier letter, and an unrated configuration's row does not show one
- [ ] `recommend.test.ts` and `tierStore.test.ts` pass

## Blocked by

- #02 (`getTier` must be able to return `undefined` before "absent scores neutral" means anything)

## Comments

Resolved. `TIER_VALUE` deleted; `recommend.ts` no longer imports `Tier`. `tierPrior` is now
`Record<string, number>` (normalised rank, 0 strongest). `NEUTRAL_TIER_VALUE = 0.5`. Fixed a
latent truthiness bug while doing this: a rank of `0` (the strongest band) is a legal, common,
falsy value, so the "missing entry" check now uses `!== undefined`, not truthiness — pinned by a
new recommend.test.ts case. `tierStore.getRankPrior()` computes the rank; result rows still read
a tier letter from `tierStore`, not from `recommend`'s return value.
