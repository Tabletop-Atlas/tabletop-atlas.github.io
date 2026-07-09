# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual strings used in this repo's issue tracker. Since issues live as local markdown (see `issue-tracker.md`), the "label" is the value written on the `Status:` line at the top of an issue file.

| Canonical role    | Status string in our tracker | Meaning                                  |
| ----------------- | ---------------------------- | ---------------------------------------- |
| `needs-triage`    | `needs-triage`               | Maintainer needs to evaluate this issue  |
| `needs-info`      | `needs-info`                 | Waiting on reporter for more information |
| `ready-for-agent` | `ready-for-agent`            | Fully specified, ready for an AFK agent  |
| `ready-for-human` | `ready-for-human`            | Requires human implementation            |
| `wontfix`         | `wontfix`                    | Will not be actioned                     |

One local addition, outside the five canonical roles:

| Status string | Meaning                                                     |
| ------------- | ----------------------------------------------------------- |
| `done`        | Implemented and merged. Keep the file; the `## Comments` section records how it was resolved. |

Whoever implements an issue flips its `Status:` line to `done`. An issue left on
`ready-for-agent` after its work has merged will send the next AFK agent to reimplement it.

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), write the corresponding string on the issue file's `Status:` line.

Edit the right-hand column to match whatever vocabulary you actually use.
