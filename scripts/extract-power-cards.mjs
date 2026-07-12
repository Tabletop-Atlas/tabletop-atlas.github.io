// Derives src/data/power-cards.json from the upstream card source #01 identified
// (github.com/oberien/spirit-island-card-katalog, served compiled at sick.oberien.de/cards.js).
// Re-run to reproduce the committed dataset: `node scripts/extract-power-cards.mjs`.
//
// A field this source cannot supply is absent from the output, never estimated (CLAUDE.md).
import { createContext, runInContext } from 'node:vm'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const CARDS_JS_URL = 'https://sick.oberien.de/cards.js'
const MANIFEST_PATH = new URL('../images/manifest.json', import.meta.url)
const SPIRITS_PATH = new URL('../src/data/spirits.json', import.meta.url)
const OUT_PATH = new URL('../src/data/power-cards.json', import.meta.url)

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

// SICK's own image-naming rule (types.ts's getImagePath): a multi-name card files under
// name[0]. Power cards only ever have a single string name, so this is a no-op for them,
// but the join below re-derives it uniformly rather than special-casing power cards.
function primaryName(name) {
  return Array.isArray(name) ? name[0] : name
}

async function main() {
  const [dbCards, manifest, spirits] = await Promise.all([
    loadDbCards(),
    import(MANIFEST_PATH, { with: { type: 'json' } }).then((m) => m.default),
    import(SPIRITS_PATH, { with: { type: 'json' } }).then((m) => m.default),
  ])

  const powerCards = dbCards.filter((c) => c.constructor?.name === 'PowerCard')

  const manifestByName = new Map(manifest.filter((r) => r.asset_type.endsWith('_power')).map((r) => [r.name, r]))
  const spiritNameById = new Map(spirits.map((s) => [s.id, s.name]))
  const startingIndexBySpirit = new Map(spirits.map((s) => [s.id, new Map(s.startingCards.map((n, i) => [n, i]))]))

  const out = []
  const misses = []

  for (const card of powerCards) {
    const name = primaryName(card.name)
    const manifestRow = manifestByName.get(name)
    if (!manifestRow) {
      misses.push(name)
      continue
    }

    const base = {
      name,
      expansion: card.set,
      cost: card.cost,
      speed: card.speed,
      elements: card.elements,
    }

    if (card.type === 'Minor Power') {
      out.push({ ...base, kind: 'minor', image: `cards/minor/${manifestRow.file.split('/').pop()}` })
    } else if (card.type === 'Major Power') {
      out.push({ ...base, kind: 'major', image: `cards/major/${manifestRow.file.split('/').pop()}` })
    } else if (typeof card.type === 'string' && card.type.startsWith('Unique Power: ')) {
      const spiritName = card.type.slice('Unique Power: '.length)
      const spiritId = manifestRow.spirit
      if (!spiritId) throw new Error(`unique "${name}" has no spirit in the manifest`)
      const startingIndex = startingIndexBySpirit.get(spiritId)?.get(name)
      const image =
        startingIndex !== undefined
          ? `cards/${spiritId}-${startingIndex}.webp`
          : `cards/unique/${manifestRow.file.split('/').pop()}`
      out.push({
        ...base,
        kind: 'unique',
        spirit: spiritId,
        spiritName: spiritNameById.get(spiritId) ?? spiritName,
        image,
      })
    } else {
      throw new Error(`unrecognised PowerCard.type "${card.type}" on "${name}"`)
    }
  }

  if (misses.length > 0) {
    throw new Error(`${misses.length} power card(s) with no manifest match: ${misses.join(', ')}`)
  }

  out.sort((a, b) => a.name.localeCompare(b.name))

  writeFileSync(fileURLToPath(OUT_PATH), JSON.stringify(out, null, 2) + '\n')

  const counts = { minor: 0, major: 0, unique: 0 }
  for (const c of out) counts[c.kind]++
  console.log(`Wrote ${out.length} power cards: ${counts.minor} minor / ${counts.major} major / ${counts.unique} unique`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
