import { useEffect, useState } from 'react'
import { tierStore } from '../domain/tierStore'
import { LIST_TYPES, TIER_LIST_SUBJECTS } from '../domain/types'
import type { TierList, TierListSubject, TierListType } from '../domain/types'

/** Human labels for subject headings (#06: "UI may label subjects in human words"). */
const SUBJECT_LABEL: Record<TierListSubject, string> = {
  configurations: 'Spirits',
  'minor-powers': 'Minor powers',
  'major-powers': 'Major powers',
}

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
 * The list picker (#04), its type filter (#09) and its citation panel (#05). #16: the picker
 * groups lists under subject headings and the parent owns which list is being viewed — the
 * controls report a selection, the board decides what activating it means.
 * `allowCreate` gates the "new personal list" form, shown on the tier board (#15).
 */
export function TierListControls({
  viewed,
  total,
  onSelect,
  allowCreate,
}: {
  viewed: TierList
  /** Size of the viewed list's subject universe (68 configurations, 101 minors, 78 majors). */
  total: number
  onSelect: (list: TierList) => void
  allowCreate?: boolean
}) {
  const [typeFilter, setTypeFilter] = useState<TierListType | ''>('')
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<TierListType>('strength')
  const [newSubject, setNewSubject] = useState<TierListSubject>('configurations')

  const lists = tierStore.getLists()
  const eligible = lists.filter((l) => !typeFilter || l.type === typeFilter)
  const subjectsWithLists = TIER_LIST_SUBJECTS.filter((subject) => eligible.some((l) => l.subject === subject))

  // If the viewed list no longer matches the chosen type filter, fall forward to the first list
  // that does rather than silently continuing to show a list the picker no longer offers.
  useEffect(() => {
    if (eligible.length > 0 && !eligible.some((l) => l.id === viewed.id)) {
      onSelect(eligible[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, viewed.id])

  const rated = Object.keys(tierStore.getAll(viewed.subject)).length

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
            value={viewed.id}
            onChange={(e) => {
              const list = lists.find((l) => l.id === e.target.value)
              if (list) onSelect(list)
            }}
          >
            {subjectsWithLists.map((subject) => (
              <optgroup key={subject} label={SUBJECT_LABEL[subject]}>
                {eligible
                  .filter((l) => l.subject === subject)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
      )}

      <TierListCitation list={viewed} rated={rated} total={total} />

      {allowCreate && (
        <details className="tier-list-create">
          <summary>Create a personal list</summary>
          <label className="deck-field">
            <span>Name</span>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. My fun list" />
          </label>
          <label className="deck-field">
            <span>Subject</span>
            <select value={newSubject} onChange={(e) => setNewSubject(e.target.value as TierListSubject)}>
              {TIER_LIST_SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {SUBJECT_LABEL[subject]}
                </option>
              ))}
            </select>
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
              const created = tierStore.createList({ name: newName.trim(), type: newType, subject: newSubject })
              setNewName('')
              onSelect(created)
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
