import { useState, type ReactNode } from 'react'
import powerCardsData from '../data/power-cards.json'
import spiritsData from '../data/spirits.json'
import { collectionStore, filterOwnedConfigurations, isConfigurationOwned } from '../domain/collectionStore'
import { expand, type Configuration } from '../domain/configurations'
import { groupByTier, tierStore } from '../domain/tierStore'
import type { PowerCard, Spirit, TierList, TierListSubject } from '../domain/types'
import { SpiritArt } from './SpiritArt'
import { SpiritDetail } from './SpiritDetail'
import { tierColor } from './tierColors'
import { TierListControls } from './TierListControls'

const spirits = spiritsData as Spirit[]
const configurations = expand(spirits)
const powerCards = powerCardsData as PowerCard[]

/** The rateable universe per card subject, keyed by card name (#12/ADR 0002: the power-card
 * dataset carries no other id). */
const CARD_POOLS: Record<'minor-powers' | 'major-powers', PowerCard[]> = {
  'minor-powers': powerCards.filter((c) => c.kind === 'minor'),
  'major-powers': powerCards.filter((c) => c.kind === 'major'),
}

function subjectTotal(subject: TierListSubject): number {
  return subject === 'configurations' ? configurations.length : CARD_POOLS[subject].length
}

/** Edit-mode controls for one tile (#15): reassign its tier, or send it to Unrated. Rendered
 * only when the viewed list is personal — the store refuses cited edits, the UI never offers
 * them. Note for #17: while edit mode is active it owns tile interaction; the view-mode
 * click-to-detail behaviour must never fire during editing. */
function TierTileEdit({
  name,
  current,
  labels,
  onAssign,
}: {
  name: string
  current: string
  labels: string[]
  onAssign: (label: string) => void
}) {
  return (
    <label className="tier-tile-edit">
      <span className="visually-hidden">Tier for {name}</span>
      <select value={current} onChange={(e) => onAssign(e.target.value)}>
        {labels.map((label) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
        <option value="">Unrated</option>
      </select>
    </label>
  )
}

/** v5 #06: a configuration outside the collection stays in its rated tier row - a tier is
 * "how good," not "do you own it," so it's dimmed and badged in place, never regrouped.
 * #17: in view mode the tile opens the spirit detail (`onOpen`); in edit mode `onOpen` is
 * absent and only the tier select responds — the modal never opens while editing. */
function TierTile({
  config,
  owned,
  edit,
  onOpen,
}: {
  config: Configuration
  owned: boolean
  edit?: ReactNode
  onOpen?: () => void
}) {
  return (
    <figure
      className={owned ? 'tier-tile' : 'tier-tile tier-tile-unowned'}
      title={
        (config.aspect ? `${config.spirit.name} — ${config.aspect.name} aspect` : config.spirit.name) +
        (owned ? '' : ' (not in your collection)')
      }
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={
        onOpen
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen()
              }
            }
          : undefined
      }
    >
      <SpiritArt spirit={config.spirit} className="tier-tile-art" />
      {config.aspect ? (
        <figcaption className="tier-tile-aspect">
          <span className="tier-tile-aspect-name">{config.aspect.name}</span>
          <span className="tier-tile-spirit-name">{config.spirit.name}</span>
        </figcaption>
      ) : (
        <figcaption>{config.spirit.name}</figcaption>
      )}
      {edit}
      {!owned && (
        <span className="unowned-badge" aria-hidden="true">
          ⊘
        </span>
      )}
      {!owned && <span className="visually-hidden"> — not in your collection</span>}
    </figure>
  )
}

/** Card art with the same missing-file posture as the rest of the app: a plain placeholder,
 * never a broken image. Card lists are ungated by the collection (#16) — like the Archive,
 * browsing the full pool is the point. */
function CardTile({
  card,
  edit,
}: {
  card: PowerCard
  edit?: ReactNode
}) {
  const [failed, setFailed] = useState(false)
  return (
    <figure className="tier-tile" title={card.name}>
      {failed ? (
        <span className="tier-tile-card-art tier-tile-card-missing" aria-hidden="true" />
      ) : (
        <img
          className="tier-tile-card-art"
          src={`${import.meta.env.BASE_URL}${card.image}`}
          alt={card.name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
      <figcaption>{card.name}</figcaption>
      {edit}
    </figure>
  )
}

/** The tier board. One tab serves every subject (#16): spirit tiles for configurations lists,
 * card tiles for card lists, same tier rows. Editing is a mode on this board (#15) —
 * personal-origin lists only, persisting through the same override machinery everywhere. */
export function TierBoard({ initialSubject }: { initialSubject?: TierListSubject } = {}) {
  const [, setVersion] = useState(0)
  const [hardFilter, setHardFilter] = useState(false)
  const [editing, setEditing] = useState(false)
  // The board tracks which SUBJECT is on display; the list shown is always that subject's
  // active list, so the board and the store can never disagree about whose ratings render.
  const [viewedSubject, setViewedSubject] = useState<TierListSubject>(initialSubject ?? 'configurations')
  // #17: board → detail. An aspect tile opens the base spirit's modal scrolled to that aspect.
  const [detail, setDetail] = useState<{ spirit: Spirit; aspect?: string } | null>(null)
  const bump = () => setVersion((v) => v + 1)

  const viewed: TierList = tierStore.getActiveListFor(viewedSubject) ?? tierStore.getActiveList()
  const subject = viewed.subject
  const customised = tierStore.isCustomised(subject)
  const excluded = new Set(collectionStore.getExcluded())
  // The store refuses cited edits; the UI must not offer them (#15). `editing` may survive a
  // list switch, so the affordance is gated on the *current* list's origin, not the toggle.
  const canEdit = viewed.origin === 'personal'
  const editingHere = editing && canEdit
  const tiers = tierStore.getAll(subject)

  const assign = (key: string) => (label: string) => {
    if (label === '') tierStore.clearTier(key, subject)
    else tierStore.setTier(key, label, subject)
    bump()
  }

  const editControl = (key: string, name: string, current: string) =>
    editingHere ? (
      <TierTileEdit name={name} current={current} labels={viewed.tierLabels} onAssign={assign(key)} />
    ) : undefined

  const configTiles = (items: Configuration[], current: string) =>
    items.map((config) => (
      <TierTile
        key={config.configId}
        config={config}
        owned={isConfigurationOwned(config, excluded)}
        edit={editControl(
          config.configId,
          config.aspect ? `${config.spirit.name} — ${config.aspect.name}` : config.spirit.name,
          current,
        )}
        onOpen={
          editingHere ? undefined : () => setDetail({ spirit: config.spirit, aspect: config.aspect?.name })
        }
      />
    ))
  const cardTiles = (items: PowerCard[], current: string) =>
    items.map((card) => (
      <CardTile key={card.name} card={card} edit={editControl(card.name, card.name, current)} />
    ))

  // Hard-filter (#06's opt-in): excluded exactly as if annotation had removed them first, rather
  // than dimmed in place. Session-only - a view preference, not collection data, so it isn't
  // persisted or exported like the collection itself. Configurations boards only (#16): card
  // lists are ungated, matching the Archive's exemption.
  const visibleConfigurations = hardFilter ? filterOwnedConfigurations(configurations, excluded) : configurations
  const groups =
    subject === 'configurations'
      ? groupByTier(visibleConfigurations, (c) => c.configId, tiers, viewed.tierLabels)
      : groupByTier(CARD_POOLS[subject], (c) => c.name, tiers, viewed.tierLabels)
  const tilesFor = (items: (Configuration | PowerCard)[], current: string) =>
    subject === 'configurations'
      ? configTiles(items as Configuration[], current)
      : cardTiles(items as PowerCard[], current)

  return (
    <section>
      <h2>Tier list</h2>
      <TierListControls
        viewed={viewed}
        total={subjectTotal(subject)}
        allowCreate
        onSelect={(list) => {
          tierStore.setActiveListId(list.id)
          setViewedSubject(list.subject)
          bump()
        }}
      />
      <details className="tier-explainer">
        <summary>How this list works</summary>
        <p>
          {customised ? 'Your customised tier list' : 'The shipped tier list'} — <strong>{viewed.tierLabels[0]}</strong>{' '}
          is strongest, <strong>{viewed.tierLabels[viewed.tierLabels.length - 1]}</strong> weakest.{' '}
          {subject === 'configurations' && (
            <>
              This ordering feeds the recommender: the <em>raw power ↔ something fresh</em> slider decides how
              heavily a spirit's tier counts toward its score.{' '}
            </>
          )}
          {canEdit ? (
            <>
              Toggle <strong>Edit tiers</strong> to reassign {subject === 'configurations' ? 'spirits' : 'cards'} right
              here.
            </>
          ) : (
            <>A cited list can't be edited — switch to a personal list to make changes.</>
          )}
        </p>
      </details>
      {subject === 'configurations' && (
        <label className="deck-field-inline">
          <input type="checkbox" checked={hardFilter} onChange={(e) => setHardFilter(e.target.checked)} />
          Only show spirits I own
        </label>
      )}
      {canEdit && (
        <label className="deck-field-inline">
          <input type="checkbox" checked={editing} onChange={(e) => setEditing(e.target.checked)} />
          Edit tiers
        </label>
      )}
      {tierStore.wasDiscarded(subject) && (
        <p className="notice">
          Your saved tier edits were discarded because the shipped tier list has changed since you
          made them. Export a backup from Settings next time to avoid losing edits like this.{' '}
          <button
            type="button"
            onClick={() => {
              tierStore.dismissDiscardNotice(subject)
              bump()
            }}
          >
            Dismiss
          </button>
        </p>
      )}
      {editingHere && (
        <p>
          <button
            type="button"
            disabled={!customised}
            onClick={() => {
              if (!customised) return
              const ok = window.confirm(
                'This discards your tier edits and cannot be undone. Export a backup from Settings first?\n\n' +
                  'Choose Cancel to go export, or OK to reset anyway.',
              )
              if (!ok) return
              tierStore.reset(subject)
              bump()
            }}
          >
            Reset to the shipped tier list
          </button>{' '}
          {customised ? <span className="meta">You have unsaved-to-repo edits.</span> : null}
        </p>
      )}

      <div className="tier-board">
        {viewed.tierLabels.map((label, i) => (
          <div className="tier-row" key={label}>
            <div className="tier-label" style={{ backgroundColor: tierColor(i) }}>
              {label}
            </div>
            <div className="tier-tiles">
              {groups.labeled[label].length === 0 ? (
                <p className="tier-empty">
                  {subject === 'configurations' ? 'No spirits in this tier' : 'No cards in this tier'}
                </p>
              ) : (
                tilesFor(groups.labeled[label], label)
              )}
            </div>
          </div>
        ))}

        <div className="tier-row tier-row-unrated">
          <div className="tier-label tier-label-unrated">Unrated</div>
          <div className="tier-tiles">
            <p className="tier-empty meta">
              Not rated by this source — different from rated badly. {groups.unrated.length} of{' '}
              {subjectTotal(subject)} {subject === 'configurations' ? 'configurations' : 'cards'} here.
            </p>
            {tilesFor(groups.unrated, '')}
          </div>
        </div>
      </div>

      {detail && (
        <SpiritDetail spirit={detail.spirit} highlightAspect={detail.aspect} onClose={() => setDetail(null)} />
      )}
    </section>
  )
}
