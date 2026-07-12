# v4 #01 — Where card data comes from

Parent: [v4 map](MAP.md) · Ticket: [issues/01-where-card-data-comes-from.md](issues/01-where-card-data-comes-from.md)

## 1. The source

`https://sick.oberien.de/cards.js` is compiled output. The **most upstream form** is the
TypeScript source of the same project, on GitHub:

- Repo: [`oberien/spirit-island-card-katalog`](https://github.com/oberien/spirit-island-card-katalog)
- Data: [`src/types.ts`](https://github.com/oberien/spirit-island-card-katalog/blob/master/src/types.ts)
  (the `PowerCard`, `FearCard`, `ChoiceEventCard`, `StageEventCard`, `TerrorLevelEventCard`,
  `HealthyBlightedLandEventCard`, `AdversaryEvent`, `BlightCard` classes and their enums — `Elements`,
  `ProductSet`, `PowerDeckType`, `Unique`, `Speed`, `Land`, `TargetSpirit`, `TargetProperty`) and
  [`src/db.ts`](https://github.com/oberien/spirit-island-card-katalog/blob/master/src/db.ts) (the
  actual catalogue — every `new PowerCard(...)` etc. call, 1677 lines).
- Both files carry the header `// This file contains material owned by Greater Than Games, LLC.`

`db.ts` compiles to `cards.js`'s `DB.CARDS` array. I loaded `cards.js` (the compiled form actually
served to the site — `db.ts`/`types.ts` are TypeScript and would need a compiler) in a sandboxed
Node `vm` context with stubbed `document`/`window`/`navigator` and read `DB.CARDS` directly, rather
than parsing source text by hand. That array **is** the whole catalogue: it constructs every card
the site's UI shows, with no filtering or subsetting applied elsewhere.

`DB.CARDS.length === 471` — the same 471 that mirror to this repo's `images/manifest.json` with
`source_site: sick.oberien.de`. Broken down by JS class:

| Class | Count | Physical cards it represents |
|---|---|---|
| `PowerCard` | 332 | 332 (1 card = 1 object) |
| `FearCard` | 50 | 50 |
| `ChoiceEventCard` | 18 | 18 |
| `StageEventCard` | 9 | 9 (one object holds level1/2/3 text for one physical card) |
| `TerrorLevelEventCard` | 12 | 12 (same shape as StageEventCard) |
| `HealthyBlightedLandEventCard` | 25 | 25 (one object holds both card faces) |
| `AdversaryEvent` | 1 | 1 (wraps a `StageEventCard`, doesn't double-count) |
| `BlightCard` | 24 | 24 |

Event total: 18+9+12+25+1 = **65**. Power total splits 101 minor / 78 major / 153 unique by
`type` (see §2). All six totals (101/78/153/50/65/24 = 471) match the PRD's and the manifest's
counts exactly.

## 2. The field inventory, per card type

Only fields actually present on the constructed objects are listed. Nothing here is inferred from
what a card "ought to" have.

**`PowerCard`** (332 — minor/major/unique):
`set` (expansion — `ProductSet` enum, 7 values: Basegame, Branch & Claw, Jagged Earth, Promo,
Promo2, Horizons of Spirit Island, Nature Incarnate), `type` (either `PowerDeckType.Minor` /
`.Major`, or a `Unique.*` enum whose *value* is the literal string `"Unique Power: <Spirit Name>"`
— see §4 on deriving the spirit), `name`, `cost` (number), `speed` (`Fast`/`Slow`), `range`
(a `Ranges` object: `{from: Source, range: number}`, or `null` for self-targeting powers), `target`
(a `TargetSpirit`/`TargetProperty` enum value, or an array of `Land` values, or the `LandAny`
constant), `elements` (array of 1+ of 8 `Elements` values), `artist`, `description` (the rules
text). No separate `spirit` field on the object — for uniques it's embedded in `type` (§4).

**`FearCard`** (50): `set`, `type` (always the literal `"Fear"`), `name`, `level1`/`level2`/`level3`
(rules text per fear level, strings), `description` (the three levels concatenated — not independent
data). No elements, cost, speed — the ticket's premise is correct that Fear cards carry none of the
owner's named power filters.

**`ChoiceEventCard`** (18): `set`, `type` (`"Choice Event"`), `name`, `description` (flavour text),
`defaultactions` (string array or `null`), `choices` (array of `{name, cost, actions}` — `cost` is
`null` or `{energy, per, aidedBy}`), `tokenevent`/`dahanevent` (string or `null` — the two side
"deck order" events players may add).

**`StageEventCard`** / **`TerrorLevelEventCard`** (9 + 12, same shape): `set`, `type`, `name` (array
of the up-to-3 distinct level names, in printed order — the physical card shows one name if all
three stages share a title, more if they don't), `level1`/`level2`/`level3` (each an `EventDesc`:
`{name, description}`), `tokenevent`/`dahanevent`.

**`HealthyBlightedLandEventCard`** (25): `set`, `type`, `name` (2-element array: healthy-side name,
blighted-side name), `healthy`/`blighted` (each an `EventDesc`), `tokenevent`/`dahanevent`.

**`AdversaryEvent`** (1): wraps an inner `StageEventCard`/etc. Adds `adversary` (the adversary name
this event is only used against) on top of the wrapped card's own fields, plus a `type` that is a
2-element array (`["Adversary Event", <inner type>]`).

**`BlightCard`** (24): `set`, `type` (`"Blighted Island"` or `"Still Healthy Island"`), `name`,
`blightPerPlayer` (number), `effect` (rules text), `description` (effect + boilerplate — derived,
not independent).

None of the six card types carry an expansion-independent "quick/slow" field beyond `PowerCard`'s
`speed`; fear/event/blight simply have no speed, matching what the owner should expect (§4).

## 3. The join

**Perfect, both directions, once event cards are keyed by their *primary* name.** SICK's own image
filename convention (`getImagePath()` in `types.ts`) uses `Array.isArray(name) ? name[0] : name` —
i.e. a multi-stage event/blighted-land card has one printed image, filed under the first of its
2–3 in-object names (the other names are alternate stage titles printed on the *same* card face, not
separate cards).

Using that primary-name key:

- 471 `images/manifest.json` rows with `source_site: sick.oberien.de`
- 471 `DB.CARDS` entries
- **0 manifest rows with no matching card**, **0 cards with no matching manifest row**

A naive join on *every* name in a multi-stage card's `name` array (rather than just the first)
produces 45 apparent "misses" — these are not real: they're the level-2/level-3/blighted-side
titles that don't get their own image. Reported here so a future agent doesn't rediscover this and
conclude the join is broken.

## 4. Which of the owner's named filters are sourceable

| Filter | Sourceable? | Which field, which card types |
|---|---|---|
| Elements | **Yes** — powers only | `PowerCard.elements` (332 of 471 cards). Fear/event/blight have no elements field; the filter does not apply to them, not "shows nothing selected." |
| Cost | **Yes** — powers only | `PowerCard.cost`. Same caveat. |
| Quick/Slow (speed) | **Yes** — powers only | `PowerCard.speed`. Same caveat. |
| Major/Minor (type) | **Yes** | `PowerCard.type` via `PowerDeckType.Minor`/`.Major`; uniques are their own third bucket (`type` starts with `"Unique Power: "`). |
| Expansion | **Yes**, all 471 | `.set` exists on every card class via the shared `Card` base constructor. 7 values (§2). |
| Which spirit a unique belongs to | **Yes, but requires parsing** — no dedicated field. `type` for a unique is the string `"Unique Power: <Spirit Name>"`; the spirit name is the substring after the colon. This is a direct string split of real data, not an inference — the spirit name is literally printed inside the enum value. `manifest.json`'s `spirit` field on unique-power rows already carries the resolved slug for the 153 uniques, so the join to this app's spirit IDs is already done there. |

Terror level (mentioned in the map, not the PRD's owner list): **partially** — `TerrorLevelEventCard`
exists and is a distinct class, so "is this a terror-level event card" is sourceable as a boolean
(card type), but there's no single terror-level *number* field to filter cards by — a terror-level
event applies at a fixed terror stage that isn't itself a card property in this dataset.

No filter the owner named turns out to be unsourceable. The one thing worth flagging: **elements,
cost and speed only exist on `PowerCard`** — a filter bar that shows those controls for the
fear/event/blight segment of the tab would be showing controls the data cannot honour, which the
PRD's "filter or segmented switch" decision (map ticket #03) needs to account for.

## 5. Licensing/attribution of the data

- `spirit-island-card-katalog`'s own code is dual-licensed Apache-2.0 / MIT, **except** files
  containing Greater Than Games material, which carry the header
  `// This file contains material owned by Greater Than Games, LLC.` — `types.ts` and `db.ts` (the
  two files this ticket reads) both carry that header. The repo's `README.md` states plainly: "All
  images and some text belongs to Greater Than Games, LLC. Source code files with material by
  Greater Than Games, LLC are marked as such in the header comment."
- `sick.oberien.de`'s own front page footer: *"This is an unofficial website. 'Spirit Island Card
  Katalog' is not affiliated with Greater Than Games, LLC. All materials belong to Greater Than
  Games, LLC."*
- No separate data-reuse license or permission statement was found beyond the above. Reporting as
  asked, not litigating: this repo's image-hosting risk is already accepted by the owner
  (2026-07-09, settled) and derived card *data* (names, costs, elements, rules text) sits under the
  same "all materials belong to Greater Than Games, LLC" umbrella the images already do.

## What this ticket does not do

Nothing is written to `src/data/` here — that's a separate build ticket (map's #02-successor,
currently folded into #11 "power cards end-to-end" per the map's 2026-07-12 retirement of the
original #02/#05/#06). This is the research answer the build ticket is blocked on.
