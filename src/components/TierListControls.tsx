import { useEffect, useState } from 'react'
import { tierStore } from '../domain/tierStore'
import { LIST_TYPES, TIER_LIST_SUBJECTS } from '../domain/types'
import type { TierList, TierListSubject, TierListType } from '../domain/types'
import type { TierHeaderVariant } from './TierHeaderVariantRound'

/** Human labels for subject headings (#06: "UI may label subjects in human words"). */
export const SUBJECT_LABEL: Record<TierListSubject, string> = {
  configurations: 'Spirits',
  'minor-powers': 'Minor powers',
  'major-powers': 'Major powers',
}

/** phase-4 #18: the credit for a cited list is author + title + link, straight from the citation
 * fields — a personal list shows its personal origin instead, never a fake one. Shared by every
 * ROUND 07 treatment so the credit text itself never drifts between variants. */
function CitationHeadline({ list }: { list: TierList }) {
  return (
    <p>
      <strong>{list.name}</strong>{' '}
      <span className="meta">
        {list.type} ranking · {list.origin === 'cited' ? 'cited' : 'your list'}
      </span>
      {!list.verified && <span className="badge-unverified"> Unverified</span>}
    </p>
  )
}

/** The "By {author} · {title link}" fragment, shared everywhere the credit appears so the
 * author/link markup can't drift between the full citation and a ROUND 07 compact treatment. */
function CreditLine({ list }: { list: TierList }) {
  return (
    <>
      By {list.source?.author ?? 'you'}
      {list.source && (
        <>
          {' · '}
          <a href={list.source.url} target="_blank" rel="noreferrer">
            {list.source.title}
          </a>
        </>
      )}
    </>
  )
}

function CitationBody({ list, rated, total }: { list: TierList; rated: number; total: number }) {
  return (
    <>
      <p className="meta">
        <CreditLine list={list} />
        {' · '}
        {list.players ? `${list.players} player${list.players === 1 ? '' : 's'}` : 'player count not stated'}
        {list.source?.published && <> · published {list.source.published}</>}
      </p>
      <p className="meta">{list.methodology}</p>
      <p className="meta">
        rated {rated} of {total}
      </p>
    </>
  )
}

/** #07 baseline: unchanged from before the round — always fully expanded. Kept as its own
 * treatment (rather than folded into a variant) so the app renders byte-identical to before the
 * round whenever `?headerVariant=` is absent. */
function TierListCitation({
  list,
  rated,
  total,
  headerVariant,
}: {
  list: TierList
  rated: number
  total: number
  headerVariant?: TierHeaderVariant
}) {
  if (headerVariant === 'A') {
    return (
      <details className="tier-citation tier-citation-a">
        <summary>
          <strong>{list.name}</strong>{' '}
          <span className="meta">
            {list.type} ranking · {list.origin === 'cited' ? 'cited' : 'your list'} · rated {rated} of {total}
          </span>
          {!list.verified && <span className="badge-unverified"> Unverified</span>}
        </summary>
        <CitationBody list={list} rated={rated} total={total} />
      </details>
    )
  }

  if (headerVariant === 'B') {
    return (
      <div className="tier-citation tier-citation-b">
        <CitationHeadline list={list} />
        <p className="meta">
          <CreditLine list={list} />
          {' · '}
          rated {rated} of {total}
        </p>
      </div>
    )
  }

  if (headerVariant === 'C') {
    return (
      <details className="tier-citation tier-citation-c">
        <summary>ⓘ Source</summary>
        <CitationHeadline list={list} />
        <CitationBody list={list} rated={rated} total={total} />
      </details>
    )
  }

  return (
    <div className="tier-citation">
      <CitationHeadline list={list} />
      <CitationBody list={list} rated={rated} total={total} />
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
  headerVariant,
}: {
  viewed: TierList
  /** Size of the viewed list's subject universe (68 configurations, 101 minors, 78 majors). */
  total: number
  onSelect: (list: TierList) => void
  allowCreate?: boolean
  /** #07: throwaway variant-round prop — delete alongside `TierHeaderVariantRound.tsx` on ship. */
  headerVariant?: TierHeaderVariant
}) {
  const [typeFilter, setTypeFilter] = useState<TierListType | ''>('')
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<TierListType>('strength')
  const [newSubject, setNewSubject] = useState<TierListSubject>('configurations')
  const [createOpen, setCreateOpen] = useState(false)

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

      <TierListCitation list={viewed} rated={rated} total={total} headerVariant={headerVariant} />

      {allowCreate &&
        (() => {
          const fields = (
            <>
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
                  setCreateOpen(false)
                  onSelect(created)
                }}
              >
                Create
              </button>
              <p className="meta">Starts fully unrated - not pre-filled from any other list.</p>
            </>
          )

          if (!headerVariant) {
            return (
              <details className="tier-list-create">
                <summary>Create a personal list</summary>
                {fields}
              </details>
            )
          }

          return (
            <div className={`tier-list-create tier-list-create-${headerVariant.toLowerCase()}`}>
              <button type="button" className="deck-ghost-accent tier-list-create-trigger" onClick={() => setCreateOpen((v) => !v)}>
                + Create a personal list
              </button>
              {createOpen && <div className="tier-list-create-panel">{fields}</div>}
            </div>
          )
        })()}
    </div>
  )
}
