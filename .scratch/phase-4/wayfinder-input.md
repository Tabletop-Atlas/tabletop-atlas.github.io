# /wayfinder input — Spirit Island App, Phase 4

## Proposed destination (challenge me on this)
A locked set of decisions + spec for Phase 4: app restructure (homepage,
Settings tab, nav), Browse/Archive/Grid UX fixes, tier-list↔browser
interconnection, and a scoped-down recommender — ready to hand to
/to-spec → /to-tickets → /implement.

## Already decided — do not re-open, ticket directly for build
- Spirit Island font for spirit names in Browse.
- Consistent expansion colors across Browse, Tier List, and all views.
- Scenario grid view: add a difficulty indicator.
- Grid tags: differentiate Major/Unique/Minor tag colors; Fast = red,
  Slow = blue (or official icons).
- Archive: Minor/Major power cards sortable/groupable by cost, elements,
  and speed; Fear (and similar) stay alphabetical/by-type.
- Tier list attribution: default list is from
  https://www.youtube.com/watch?v=LoP2T4GO4xo&list=PLN_f1BRMAaFA&index=2
  (not mine) — must be credited.
- Spirit Island logo becomes clickable → homepage. Homepage is a priority.
- "Recommended" loses its pinned top spot in nav.

## Open decisions — grill me on these
1. **Homepage**: content, purpose framing, what it links to.
2. **Settings/Customization tab**: exactly what moves there (ownership,
   custom tiers, recommendation prefs?) and how it interacts with
   Browse/Recommend views.
3. **Radar chart replacement**: fix coloring for dark theme vs. fully
   replace with the spirit's composition styled like the original game
   panels. What's feasible?
4. **Archive structure**: card-type tabs on top vs. subfolders per type.
   I don't know the backend implications — I want the agent's counsel here.
5. **Official assets/formatting**: can we plug in Spirit Island's
   fonts/icons/formatting? Includes a feasibility AND licensing question.
   (candidate: research ticket)
6. **Tier list ↔ Browser interconnect**: clicking a spirit in the tier
   list shows the same detail view as Browse (ideally without leaving the
   tier list — modal? shared component?); Browse detail shows the
   spirit's tier + aspects with matching tier colors.
7. **Multi-tier-list architecture**: support additional lists (e.g.
   Minor/Major power card tier lists from other channels). Design should
   not paint us into a corner for future multi-game support.
8. **Recommender short-term**: player-count input currently affects
   nothing (misleading). Option A: strip to a plain "start recommendation"
   button. Option B: expand the questionnaire using backend player data
   (e.g. gamer vs non-gamer with branching questions for a broad audience).

## Not yet specified (fog — don't ticket yet)
- Left panel / global theming overhaul toward a floral/island Spirit
  Island aesthetic. Direction is felt but not specifiable.
- Multi-game platform vision (users swapping between games).

## Out of scope for this map
- The full AI composition-based recommender in the backend. Exists, but
  explicitly not this phase — do not route the map toward it.

## Notes / standing preferences
- Theme fidelity to Spirit Island matters throughout.
- Audience is broad (gamers and non-gamers) — UX decisions should
  accommodate both.
- I want counsel on backend/architecture questions, not just execution
  of my ideas.