import { useMemo, useState } from 'react'
import spiritsData from '../data/spirits.json'
import { collectionStore } from '../domain/collectionStore'
import { toConfigId } from '../domain/configurations'
import { tierStore } from '../domain/tierStore'
import { EXPANSIONS as EXPANSION_ORDER, type Complexity, type OCFDU, type Spirit } from '../domain/types'
import { SpiritDetail } from './SpiritDetail'
import { SpiritTile } from './SpiritTile'

const spirits = spiritsData as Spirit[]

const COMPLEXITIES: Complexity[] = ['Low', 'Moderate', 'High', 'Very High']
const RATING_AXES: (keyof OCFDU)[] = ['offense', 'control', 'fear', 'defense', 'utility']
// A spirit counts as "strong in" an axis at 4+ on the 1–6 OCFDU scale (owner's call, grill 2026-07-23).
const STRONG_IN_THRESHOLD = 4

const EXPANSIONS = [...new Set(spirits.map((s) => s.expansion))].sort()
const TAGS = [...new Set(spirits.flatMap((s) => s.tags))].sort()

// OCFDU is a filter axis, not a sort axis (nobody lands on Browse and sorts by Offense).
type SortKey = 'name' | 'tier' | 'expansion'

export function Browser() {
  const [expansion, setExpansion] = useState('')
  const [complexity, setComplexity] = useState('')
  const [tag, setTag] = useState('')
  const [strongIn, setStrongIn] = useState<'' | keyof OCFDU>('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [selected, setSelected] = useState<Spirit | null>(null)
  // The active configurations tier list's ranks (0 strongest .. 1 weakest), keyed by configId;
  // unrated spirits are absent, so they sort last. Read once — a view preference, like the rest.
  const rankPrior = useMemo(() => tierStore.getRankPrior(), [])
  // v5 #07c: session-only, like the tier board's and the Recommender's - a view preference, not
  // collection data. #06 named Browse as a surface that respects the collection; Cards does not.
  const [hardFilter, setHardFilter] = useState(false)
  // Read once per render, not once per spirit/aspect - collectionStore.getExcluded() does a
  // storage read + JSON.parse + Set rebuild, and the earlier version called it per tile.
  const excluded = useMemo(() => new Set(collectionStore.getExcluded()), [])

  const shown = useMemo(() => {
    const filtered = spirits.filter(
      (s) =>
        (!expansion || s.expansion === expansion) &&
        (!complexity || s.complexity === complexity) &&
        (!tag || s.tags.includes(tag)) &&
        (!strongIn || s.ratings[strongIn] >= STRONG_IN_THRESHOLD) &&
        (!hardFilter || !excluded.has(s.expansion)),
    )
    const byName = (a: Spirit, b: Spirit) => a.name.localeCompare(b.name)
    const order = EXPANSION_ORDER as readonly string[]
    return [...filtered].sort((a, b) => {
      if (sortKey === 'tier') {
        const ra = rankPrior[toConfigId(a.id)] ?? Infinity
        const rb = rankPrior[toConfigId(b.id)] ?? Infinity
        return ra - rb || byName(a, b)
      }
      if (sortKey === 'expansion') {
        return order.indexOf(a.expansion) - order.indexOf(b.expansion) || byName(a, b)
      }
      return byName(a, b)
    })
  }, [expansion, complexity, tag, strongIn, sortKey, hardFilter, excluded, rankPrior])

  return (
    <section>
      <h2>Browse spirits</h2>
      <div className="filters">
        <label>
          Expansion
          <select value={expansion} onChange={(e) => setExpansion(e.target.value)}>
            <option value="">All</option>
            {EXPANSIONS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
        <label>
          Complexity
          <select value={complexity} onChange={(e) => setComplexity(e.target.value)}>
            <option value="">All</option>
            {COMPLEXITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tag
          <select value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">All</option>
            {TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          Strong in
          <select value={strongIn} onChange={(e) => setStrongIn(e.target.value as '' | keyof OCFDU)}>
            <option value="">Any</option>
            {RATING_AXES.map((axis) => (
              <option key={axis} value={axis}>
                {axis[0].toUpperCase() + axis.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort by
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="name">Name</option>
            <option value="tier">Tier</option>
            <option value="expansion">Expansion</option>
          </select>
        </label>
      </div>
      <label className="deck-field-inline">
        <input type="checkbox" checked={hardFilter} onChange={(e) => setHardFilter(e.target.checked)} />
        Only show spirits I own
      </label>

      <p>
        {shown.length} of {spirits.length} spirits
      </p>

      <ul className="spirit-grid">
        {shown.map((spirit) => (
          <SpiritTile
            key={spirit.id}
            spirit={spirit}
            onSelect={setSelected}
            owned={!excluded.has(spirit.expansion)}
            excluded={excluded}
          />
        ))}
      </ul>

      {selected && <SpiritDetail spirit={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
