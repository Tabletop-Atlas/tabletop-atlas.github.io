import { useMemo, useState } from 'react'
import spiritsData from '../data/spirits.json'
import type { Complexity, OCFDU, Spirit } from '../domain/types'
import { SpiritTile } from './SpiritTile'

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

  const shown = useMemo(() => {
    const filtered = spirits.filter(
      (s) =>
        (!expansion || s.expansion === expansion) &&
        (!complexity || s.complexity === complexity) &&
        (!tag || s.tags.includes(tag)),
    )
    return [...filtered].sort((a, b) =>
      sortKey === 'name' ? a.name.localeCompare(b.name) : b.ratings[sortKey] - a.ratings[sortKey],
    )
  }, [expansion, complexity, tag, sortKey])

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

      <p>
        {shown.length} of {spirits.length} spirits
      </p>

      <ul className="spirit-grid">
        {shown.map((spirit) => (
          <SpiritTile key={spirit.id} spirit={spirit} />
        ))}
      </ul>
    </section>
  )
}
