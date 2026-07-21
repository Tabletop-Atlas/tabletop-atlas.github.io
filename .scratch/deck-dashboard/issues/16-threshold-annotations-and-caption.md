# Spirit threshold annotations + aspect caption

Status: done

## Parent

`../PRD-2.md` (follow-up spec: valence views + element-gap odds)

## What to build

Picking a spirit on the Dashboard makes the gap-odds block spirit-aware: the spirit's
transcribed innate-threshold requirements annotate the relevant element rows (e.g.
"Massive Flooding II wants 3 Water"), so the player sees which gaps matter. For spirits
with aspects that modify their innates, a caption states the shown thresholds are the base
spirit's. With no spirit picked, the block reads unchanged.

## Acceptance criteria

- [ ] One new pure domain module: spirit id → innate powers with ordered element
      requirements, plus whether any aspect of that spirit modifies innates.
- [ ] Picking a spirit annotates the gap-odds element rows with its threshold requirements;
      clearing the pick removes them; no-spirit state is fully useful.
- [ ] Aspect-modified spirits show the base-thresholds caption; unmodified spirits show none.
- [ ] No joint multi-element probabilities anywhere (rejected at #05).
- [ ] Smoke test covers annotated and captioned states; type check, lint, full suite pass.

## Blocked by

- [14-element-gap-odds-block.md](14-element-gap-odds-block.md)
- [15-innate-threshold-transcription.md](15-innate-threshold-transcription.md)
