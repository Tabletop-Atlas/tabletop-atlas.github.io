# Spirit Recommender — build issues

Start here: read `PRD.md`, `../../HANDOFF_spirit_island_recommender.md`, and `../../CLAUDE.md`.

Work issues in `issues/` in dependency order. Each issue's `Blocked by` names its prerequisites.

## Pickup order (overnight AFK chain)

1. **01 — walking skeleton** (start here; establishes schema, scoring seam, test harness)
2. **02 — populate spirits.json** · **03 — seed tiers.json** (data; can run after 01)
3. **04 — questionnaire → weights → board** (core recommender; needs 01)
4. Then, in any order after 04: **05** complexity+tier prior · **06** results polish · **07** random chooser · **10** team coverage · **11** aspect nudge
5. Independent of 04 (need only 01): **08** browser tab · **09** tier list + store · **12** deploy workflow

## Waiting on the human (morning)

- **13 — artwork** (`ready-for-human`): source/crop art. App uses element-colored placeholder tiles until then.
- **02**: review the flagged uncertain summaries.
- **03**: refine provisional tiers against the owner's YouTube sources.
- **12**: enable Pages in repo Settings → Pages → Source = GitHub Actions.

## Principles (from PRD / CLAUDE.md)

- Domain logic = framework-free pure TS modules (the four seams); React is boring glue.
- Test external behavior of the seams against small fixtures, not the React tree.
- Only `spirits.json` and `tiers.json` are hand-maintained data.
