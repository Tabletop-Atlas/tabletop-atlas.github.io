// Derives src/data/other-cards.json (fear/event/blight — the 139 cards outside PowerCard) from
// the same upstream source #01/#11 used. Re-run to reproduce: `node scripts/extract-other-cards.mjs`.
//
// These card types carry no elements/cost/speed (#01's finding) — the dataset does not invent
// them. v5 #02/#03 add each card's sub-type: fear/blight get keyword-derived tags (judgment - see
// otherCardClassifier.ts), events carry their upstream class through as-is (source data).
//
// Pass a card name to print the tags it got and which literal phrase triggered each one, for the
// "spot-check a sample by hand" acceptance criterion: `node scripts/extract-other-cards.mjs --explain "Belief Takes Root"`
import { createContext, runInContext } from 'node:vm'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { classifyBlight, classifyFear, eventClassFromConstructorName, explainBlight, explainFear } from '../src/domain/otherCardClassifier.ts'

const CARDS_JS_URL = 'https://sick.oberien.de/cards.js'
const MANIFEST_PATH = new URL('../images/manifest.json', import.meta.url)
const OUT_PATH = new URL('../src/data/other-cards.json', import.meta.url)
// The literal text each fear/blight card was classified from, committed alongside the tags
// themselves so the full-corpus tripwire test (cardCanon.test.ts) can re-run the classifier
// offline and diff against every card, not just a hand-picked sample - #03's acceptance
// criterion: "re-running the classifier over the committed text must reproduce the committed
// tags exactly."
const SOURCE_TEXT_OUT_PATH = new URL('../src/domain/__tests__/fixtures/otherCardSourceText.json', import.meta.url)

const KIND_BY_CLASS = {
  FearCard: 'fear',
  BlightCard: 'blight',
  ChoiceEventCard: 'event',
  StageEventCard: 'event',
  TerrorLevelEventCard: 'event',
  HealthyBlightedLandEventCard: 'event',
  AdversaryEvent: 'event',
}

async function loadDbCards() {
  const res = await fetch(CARDS_JS_URL)
  if (!res.ok) throw new Error(`fetch ${CARDS_JS_URL} failed: ${res.status}`)
  const src = await res.text()
  const sandbox = {
    document: {
      addEventListener() {},
      createElement: () => ({ style: {}, appendChild() {}, setAttribute() {}, classList: { add() {} } }),
      getElementById: () => null,
      body: { appendChild() {} },
      querySelector: () => null,
    },
    navigator: { userAgent: 'node' },
    console,
  }
  sandbox.window = sandbox
  sandbox.self = sandbox
  const ctx = createContext(sandbox)
  runInContext(src, ctx)
  const db = sandbox.DB ?? sandbox.window.DB
  if (!db?.CARDS) throw new Error('cards.js did not expose DB.CARDS in the sandbox')
  return db.CARDS
}

// SICK's own image-naming rule: a multi-name card (event/blighted-land stage titles) files
// under name[0] — see #01's card-data-source.md.
function primaryName(name) {
  return Array.isArray(name) ? name[0] : name
}

/** The fear card's own tiered text, concatenated so a rule matching any level tags the card. */
function fearLevelText(card) {
  return [card.level1, card.level2, card.level3].filter(Boolean).join(' ')
}

function subTypeFields(card, kind) {
  if (kind === 'event') return { eventClass: eventClassFromConstructorName(card.constructor.name) }
  if (kind === 'fear') return { tags: classifyFear(fearLevelText(card)) }
  return { tags: classifyBlight(card.effect ?? ''), tagsSource: 'judgment' }
}

async function explainOne(dbCards, name) {
  const card = dbCards.find((c) => primaryName(c.name) === name)
  if (!card) throw new Error(`no card named "${name}"`)
  const kind = KIND_BY_CLASS[card.constructor?.name]
  if (kind === 'fear') {
    console.log(`${name} (fear):`, explainFear(fearLevelText(card)))
  } else if (kind === 'blight') {
    console.log(`${name} (blight):`, explainBlight(card.effect ?? ''))
  } else {
    console.log(`${name} (event):`, subTypeFields(card, 'event'))
  }
}

async function main() {
  const explainName = process.argv.includes('--explain') ? process.argv[process.argv.indexOf('--explain') + 1] : null

  const [dbCards, manifest] = await Promise.all([
    loadDbCards(),
    import(MANIFEST_PATH, { with: { type: 'json' } }).then((m) => m.default),
  ])

  if (explainName) {
    await explainOne(dbCards, explainName)
    return
  }

  const otherCards = dbCards.filter((c) => KIND_BY_CLASS[c.constructor?.name])

  const manifestByName = new Map(
    manifest.filter((r) => r.asset_type === 'fear' || r.asset_type === 'event' || r.asset_type === 'blight').map((r) => [r.name, r]),
  )

  const out = []
  const sourceText = []
  const misses = []

  for (const card of otherCards) {
    const name = primaryName(card.name)
    const manifestRow = manifestByName.get(name)
    if (!manifestRow) {
      misses.push(name)
      continue
    }
    const kind = KIND_BY_CLASS[card.constructor.name]
    out.push({
      name,
      expansion: card.set,
      kind,
      image: `cards/${manifestRow.asset_type}/${manifestRow.file.split('/').pop()}`,
      ...subTypeFields(card, kind),
    })
    if (kind === 'fear') sourceText.push({ name, kind, text: fearLevelText(card) })
    if (kind === 'blight') sourceText.push({ name, kind, text: card.effect ?? '' })
  }

  if (misses.length > 0) {
    throw new Error(`${misses.length} card(s) with no manifest match: ${misses.join(', ')}`)
  }

  out.sort((a, b) => a.name.localeCompare(b.name))
  writeFileSync(fileURLToPath(OUT_PATH), JSON.stringify(out, null, 2) + '\n')

  sourceText.sort((a, b) => a.name.localeCompare(b.name))
  writeFileSync(fileURLToPath(SOURCE_TEXT_OUT_PATH), JSON.stringify(sourceText, null, 2) + '\n')

  const counts = { fear: 0, event: 0, blight: 0 }
  for (const c of out) counts[c.kind]++
  console.log(`Wrote ${out.length} cards: ${counts.fear} fear / ${counts.event} event / ${counts.blight} blight`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
