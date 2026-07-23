import { useEffect, useMemo, useState } from 'react'
import spiritsData from '../data/spirits.json'
import { filterSpirits } from '../domain/browserFilter'
import { collectionStore } from '../domain/collectionStore'
import { toConfigId } from '../domain/configurations'
import { tierStore } from '../domain/tierStore'
import { EXPANSIONS as EXPANSION_ORDER, type Complexity, type OCFDU, type Spirit } from '../domain/types'
import { SpiritDetail } from './SpiritDetail'
import { SpiritTile } from './SpiritTile'

const spirits = spiritsData as Spirit[]

const COMPLEXITIES: Complexity[] = ['Low', 'Moderate', 'High', 'Very High']
const RATING_AXES: (keyof OCFDU)[] = ['offense', 'control', 'fear', 'defense', 'utility']

const EXPANSIONS = [...new Set(spirits.map((s) => s.expansion))].sort()
const TAGS = [...new Set(spirits.flatMap((s) => s.tags))].sort()

// OCFDU is a filter axis, not a sort axis (nobody lands on Browse and sorts by Offense).
type SortKey = 'name' | 'tier' | 'expansion'

export function Browser({
  initialTarget,
  onTargetConsumed,
}: {
  /** Set by a Recommend-result click (#02 deep link); seeds `selected`/`highlightAspect` on
   * arrival instead of requiring the owner to find the spirit themselves. */
  initialTarget?: { spiritId: string; aspectName?: string } | null
  onTargetConsumed?: () => void
} = {}) {
  const [expansion, setExpansion] = useState('')
  const [complexity, setComplexity] = useState('')
  const [tag, setTag] = useState('')
  const [strongIn, setStrongIn] = useState<'' | keyof OCFDU>('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  // Lazy initializers, not a useEffect: App unmounts Browser on every tab switch away (App.tsx
  // conditionally renders it), so a fresh mount is exactly the "arrival" #02 asks for - reading
  // the prop once at construction seeds `selected` before the first paint instead of flashing
  // an empty grid first.
  const [selected, setSelected] = useState<Spirit | null>(
    () => spirits.find((s) => s.id === initialTarget?.spiritId) ?? null,
  )
  const [highlightAspect, setHighlightAspect] = useState<string | undefined>(() => initialTarget?.aspectName)

  useEffect(() => {
    if (initialTarget) onTargetConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- consumed once per mount, not per render of onTargetConsumed
  }, [])
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
    const filtered = filterSpirits(spirits, { expansion, complexity, tag, strongIn, search, hardFilter }, excluded)
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
  }, [expansion, complexity, tag, strongIn, search, sortKey, hardFilter, excluded, rankPrior])

  return (
    <section>
      <h2>Browse spirits</h2>
      <div className="filters">
        <label className="search-field-label">
          Search by name
          <span className="search-field">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Spirit or aspect name…"
            />
          </span>
        </label>
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
            onSelect={(s) => {
              setSelected(s)
              setHighlightAspect(undefined)
            }}
            owned={!excluded.has(spirit.expansion)}
            excluded={excluded}
          />
        ))}
      </ul>

      {selected && (
        <SpiritDetail
          spirit={selected}
          highlightAspect={highlightAspect}
          onClose={() => {
            setSelected(null)
            setHighlightAspect(undefined)
          }}
        />
      )}
    </section>
  )
}
