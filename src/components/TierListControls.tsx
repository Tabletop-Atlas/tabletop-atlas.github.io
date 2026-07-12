import { useEffect, useState } from 'react'
import { tierStore } from '../domain/tierStore'
import { LIST_TYPES } from '../domain/types'
import type { TierList, TierListType } from '../domain/types'

function TierListCitation({ list, rated, total }: { list: TierList; rated: number; total: number }) {
  return (
    <div className="tier-citation">
      <p>
        <strong>{list.name}</strong>{' '}
        <span className="meta">
          {list.type} ranking · {list.origin === 'cited' ? 'cited' : 'your list'}
        </span>
        {!list.verified && <span className="badge-unverified"> Unverified</span>}
      </p>
      <p className="meta">
        By {list.source?.author ?? 'you'}
        {list.source && (
          <>
            {' · '}
            <a href={list.source.url} target="_blank" rel="noreferrer">
              source
            </a>
          </>
        )}
        {' · '}
        {list.players ? `${list.players} player${list.players === 1 ? '' : 's'}` : 'player count not stated'}
        {list.source?.published && <> · published {list.source.published}</>}
      </p>
      <p className="meta">{list.methodology}</p>
      <p className="meta">
        rated {rated} of {total}
      </p>
    </div>
  )
}

/**
 * The list picker (#04), its type filter (#09) and its citation panel (#05), shared by the
 * read-only board and the editor so they can never disagree about which list is active.
 * `allowCreate` gates the "new personal list" form, shown only from the editor.
 */
export function TierListControls({
  totalConfigs,
  allowCreate,
  onChange,
}: {
  totalConfigs: number
  allowCreate?: boolean
  onChange: () => void
}) {
  const [typeFilter, setTypeFilter] = useState<TierListType | ''>('')
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<TierListType>('strength')

  const lists = tierStore.getLists()
  const active = tierStore.getActiveList()
  const eligible = lists.filter((l) => !typeFilter || l.type === typeFilter)

  // If the active list no longer matches the chosen type filter, fall forward to the first list
  // that does rather than silently continuing to score against a list the picker no longer shows.
  useEffect(() => {
    if (eligible.length > 0 && !eligible.some((l) => l.id === active.id)) {
      tierStore.setActiveListId(eligible[0].id)
      onChange()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, active.id])

  const rated = Object.keys(tierStore.getAll()).length

  return (
    <div className="tier-list-controls">
      <label className="deck-field">
        <span>Filter by type</span>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TierListType | '')}>
          <option value="">All types</option>
          {LIST_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      {eligible.length === 0 ? (
        <p className="notice">No tier list exists for type "{typeFilter}".</p>
      ) : (
        <label className="deck-field">
          <span>Tier list</span>
          <select
            value={active.id}
            onChange={(e) => {
              tierStore.setActiveListId(e.target.value)
              onChange()
            }}
          >
            {eligible.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <TierListCitation list={active} rated={rated} total={totalConfigs} />

      {allowCreate && (
        <details className="tier-list-create">
          <summary>Create a personal list</summary>
          <label className="deck-field">
            <span>Name</span>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. My fun list" />
          </label>
          <label className="deck-field">
            <span>Type</span>
            <select value={newType} onChange={(e) => setNewType(e.target.value as TierListType)}>
              {LIST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!newName.trim()}
            onClick={() => {
              const created = tierStore.createList({ name: newName.trim(), type: newType })
              tierStore.setActiveListId(created.id)
              setNewName('')
              onChange()
            }}
          >
            Create
          </button>
          <p className="meta">Starts fully unrated - not pre-filled from any other list.</p>
        </details>
      )}
    </div>
  )
}
