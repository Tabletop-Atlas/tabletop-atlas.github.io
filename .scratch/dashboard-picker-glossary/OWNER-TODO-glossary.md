# Owner TODO — glossary terms with no in-repo source

These terms appear on Fear/Event surfaces but have **no in-repo definition** beyond a name or
constructor mapping. Per the glossary discipline (CONTEXT.md "Glossary term", PRD story 14), they
ship **absent** from the map — plain text, no dotted underline — until the owner authors text
(`source: 'owner'`) or cites the wiki (`source: 'wiki'`).

## Event classes (Event view, "By event class" facet)

Upstream source data (`eventClassFromConstructorName` maps ChoiceEventCard / StageEventCard /
TerrorLevelEventCard / HealthyBlightedLandEventCard / AdversaryEvent). The repo records the
bucket names and that they are source data, not judgment — it does **not** define what each class
means for a player.

| Proposed id | Surface label | Notes |
| --- | --- | --- |
| `event-class-choice` | Choice | ChoiceEventCard |
| `event-class-stage` | Stage | StageEventCard |
| `event-class-terrorLevel` | Terror level | TerrorLevelEventCard |
| `event-class-healthyBlightedLand` | Healthy/blighted land | HealthyBlightedLandEventCard |
| `event-class-adversary` | Adversary | AdversaryEvent |

When filled, add entries to `src/domain/glossary.ts`. The Event view already wraps class labels in
`<Term id="event-class-…">`; definitions light up without further wiring.
