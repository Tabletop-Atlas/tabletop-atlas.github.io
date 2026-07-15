import { useMemo, useState } from 'react'
import spiritsData from '../data/spirits.json'
import { collectionStore } from '../domain/collectionStore'
import type { Complexity, OCFDU, Spirit } from '../domain/types'
import { SpiritDetail } from './SpiritDetail'
import { SpiritTile } from './SpiritTile'
import { readTierBadgeVariant, TierBadgeVariantSwitcher } from './TierBadgeVariantRound'

const spirits = spiritsData as Spirit[]

const COMPLEXITIES: Complexity[] = ['Low', 'Moderate', 'High', 'Very High']
const RATING_AXES: (keyof OCFDU)[] = ['offense', 'control', 'fear', 'defense', 'utility']

const EXPANSIONS = [...new Set(spirits.map((s) => s.expansion))].sort()
const TAGS = [...new Set(spirits.flatMap((s) => s.tags))].sort()

type SortKey = 'name' | keyof OCFDU

export function Browser() {
  const [expansion, setExpansion] = useState('')
  const [complexity, setComplexity] = useState('')
  const [tag, setTag] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [selected, setSelected] = useState<Spirit | null>(null)
  // v5 #07c: session-only, like the tier board's and the Recommender's - a view preference, not
  // collection data. #06 named Browse as a surface that respects the collection; Cards does not.
  const [hardFilter, setHardFilter] = useState(false)
  // Read once per render, not once per spirit/aspect - collectionStore.getExcluded() does a
  // storage read + JSON.parse + Set rebuild, and the earlier version called it per tile.
  const excluded = useMemo(() => new Set(collectionStore.getExcluded()), [])
  // ROUND 06 scaffolding — delete this state + readTierBadgeVariant/TierBadgeVariantSwitcher and
  // the `tierVariant={tierBadgeVariant}` prop below on ship (see TierBadgeVariantRound.tsx).
  const [tierBadgeVariant, setTierBadgeVariant] = useState(readTierBadgeVariant)

  const shown = useMemo(() => {
    const filtered = spirits.filter(
      (s) =>
        (!expansion || s.expansion === expansion) &&
        (!complexity || s.complexity === complexity) &&
        (!tag || s.tags.includes(tag)) &&
        (!hardFilter || !excluded.has(s.expansion)),
    )
    return [...filtered].sort((a, b) =>
      sortKey === 'name' ? a.name.localeCompare(b.name) : b.ratings[sortKey] - a.ratings[sortKey],
    )
  }, [expansion, complexity, tag, sortKey, hardFilter, excluded])

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
          Sort by
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="name">Name</option>
            {RATING_AXES.map((axis) => (
              <option key={axis} value={axis}>
                {axis[0].toUpperCase() + axis.slice(1)}
              </option>
            ))}
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
            tierVariant={tierBadgeVariant ?? undefined}
          />
        ))}
      </ul>

      {tierBadgeVariant && <TierBadgeVariantSwitcher current={tierBadgeVariant} onPick={setTierBadgeVariant} />}

      {selected && <SpiritDetail spirit={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
