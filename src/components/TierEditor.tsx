import { useRef, useState } from 'react'
import spiritsData from '../data/spirits.json'
import { answersStore } from '../domain/answersStore'
import { parse, serialise } from '../domain/backup'
import type { KnownIds } from '../domain/backup'
import { complexityStore } from '../domain/complexityStore'
import { expand } from '../domain/configurations'
import { gameLog } from '../domain/gameLog'
import { QUESTIONS } from '../domain/questionnaire'
import { groupByTier, tierStore } from '../domain/tierStore'
import { COMPLEXITIES } from '../domain/types'
import type { Complexity, Spirit } from '../domain/types'
import { SpiritArt } from './SpiritArt'
import { tierColor } from './tierColors'
import { TierListControls } from './TierListControls'

const spirits = spiritsData as Spirit[]
const configurations = expand(spirits)

// A function, not a module-level constant: list ids grow at runtime (#09's created lists), so
// this must re-read tierStore on every import rather than freezing the set at module load.
function knownIds(): KnownIds {
  return {
    tierIds: new Set(configurations.map((c) => c.configId)),
    listIds: new Set(tierStore.getLists().map((l) => l.id)),
    complexityIds: new Set(spirits.map((s) => s.id)),
    questionIds: new Set(QUESTIONS.map((q) => q.id)),
  }
}

function ownersListId(): string {
  return tierStore.getLists().find((l) => l.origin === 'personal')?.id ?? ''
}

function downloadBackup(json: string) {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `spirit-island-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** Editable tier list. The read-only visual board lives in the Tier list tab. */
export function TierEditor() {
  const [, setVersion] = useState(0)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const bump = () => setVersion((v) => v + 1)
  const active = tierStore.getActiveList()
  const cited = active.origin === 'cited'
  const grouped = groupByTier(configurations, tierStore.getAll(), active.tierLabels)
  const customised = tierStore.isCustomised()
  const complexityOverrides = complexityStore.getAll()
  const complexityCustomised = complexityStore.isCustomised()
  const tierDiscarded = tierStore.wasDiscarded()
  const complexityDiscarded = complexityStore.wasDiscarded()

  const handleDismissDiscardNotice = (store: 'tiers' | 'complexity overrides') => {
    if (store === 'tiers') tierStore.dismissDiscardNotice()
    else complexityStore.dismissDiscardNotice()
    bump()
  }

  const handleSetTier = (id: string, tier: string) => {
    tierStore.setTier(id, tier)
    bump()
  }

  const handleSetComplexity = (spiritId: string, complexity: Complexity) => {
    complexityStore.setComplexity(spiritId, complexity)
    bump()
  }

  const handleResetComplexity = (spiritId: string) => {
    complexityStore.reset(spiritId)
    bump()
  }

  const handleReset = () => {
    if (!customised) return
    const ok = window.confirm(
      'This discards your tier edits and cannot be undone. Export a backup first?\n\n' +
        'Choose Cancel to go export, or OK to reset anyway.',
    )
    if (!ok) return
    tierStore.reset()
    bump()
  }

  const handleExport = () => {
    const tiers: Record<string, Record<string, string>> = {}
    for (const list of tierStore.getPersonalLists()) {
      const overrides = tierStore.getOverridesForList(list.id)
      if (Object.keys(overrides).length > 0) tiers[list.id] = overrides
    }
    const json = serialise({
      tiers,
      complexityOverrides: complexityStore.getOverrides(),
      answers: answersStore.load() ?? {},
      log: gameLog.list(),
    })
    downloadBackup(json)
  }

  const handleImportFile = async (file: File) => {
    setImportMessage(null)
    let result
    try {
      result = parse(await file.text(), knownIds(), gameLog.list(), ownersListId())
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : 'Could not read that backup file.')
      return
    }

    const hasExistingData =
      tierStore.hasAnyPersonalEdits() ||
      complexityStore.isCustomised() ||
      Object.keys(answersStore.load() ?? {}).length > 0 ||
      gameLog.list().length > 0
    if (hasExistingData) {
      const ok = window.confirm(
        'Importing will replace your tiers, complexity overrides and answers with the ones in ' +
          'this file. Your game log is merged instead - entries are appended and de-duplicated ' +
          'by id, so nothing already logged is lost.\n\nExport a backup first if you want to keep ' +
          'what you have now?\n\nChoose Cancel to go export, or OK to import anyway.',
      )
      if (!ok) return
    }

    for (const list of tierStore.getPersonalLists()) {
      tierStore.resetList(list.id)
    }
    tierStore.importOverrides(result.state.tiers)
    complexityStore.resetAll()
    for (const [spiritId, complexity] of Object.entries(result.state.complexityOverrides)) {
      complexityStore.setComplexity(spiritId, complexity as Complexity)
    }
    answersStore.save(result.state.answers)
    gameLog.replaceAll(result.state.log)
    bump()
    setImportMessage(
      result.unresolved.length > 0
        ? `Imported. Could not resolve ${result.unresolved.length} id(s): ${result.unresolved.join(', ')}`
        : 'Imported successfully.',
    )
  }

  return (
    <section>
      <h2>Customise tiers</h2>
      <TierListControls totalConfigs={configurations.length} allowCreate onChange={bump} />
      {tierDiscarded && (
        <p className="notice">
          Your saved tier edits were discarded because the shipped tier list has changed since you
          made them. Export a backup next time to avoid losing edits like this.{' '}
          <button type="button" onClick={() => handleDismissDiscardNotice('tiers')}>
            Dismiss
          </button>
        </p>
      )}
      {complexityDiscarded && (
        <p className="notice">
          Your saved complexity overrides were discarded because the shipped complexity values have
          changed since you made them. Export a backup next time to avoid losing edits like this.{' '}
          <button type="button" onClick={() => handleDismissDiscardNotice('complexity overrides')}>
            Dismiss
          </button>
        </p>
      )}
      {cited ? (
        <p className="notice">
          {active.name} is a citation, not your opinion — editing it would misattribute someone
          else's ranking to you. Switch to a personal list above to make edits.
        </p>
      ) : (
        <p>
          Reassign any spirit. Your edits are saved in this browser and override the shipped list —
          they change how the recommender's <em>raw power</em> slider ranks spirits.
        </p>
      )}
      <p>
        <button type="button" onClick={handleReset} disabled={!customised}>
          Reset to the shipped tier list
        </button>{' '}
        {customised ? <span className="meta">You have unsaved-to-repo edits.</span> : null}
      </p>

      <h3>Backup</h3>
      <p className="meta">
        Nothing here survives a cleared browser cache unless you export it. Export carries your
        edits to every personal list, not just the one shown here. Import replaces those edits,
        your complexity overrides and your answers; your game log is appended and de-duplicated by
        id instead, so merging two devices' histories never loses a played game.
      </p>
      <p>
        <button type="button" onClick={handleExport}>
          Export backup
        </button>{' '}
        <button type="button" onClick={() => fileInput.current?.click()}>
          Import backup
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          className="visually-hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleImportFile(file)
            e.target.value = ''
          }}
        />
      </p>
      {importMessage ? <p className="meta">{importMessage}</p> : null}

      <h3>Complexity overrides</h3>
      <p className="meta">
        Disagree with the printed Complexity? Override it here. This only changes your own{' '}
        <em>enjoyment</em> preference score — a newcomer's safeguard always reads the printed
        value, never your override. Aspects aren't individually overridable; their printed arrow
        still applies on top. {complexityCustomised ? <span>You have overrides set.</span> : null}
      </p>
      <ul className="spirit-grid">
        {spirits.map((spirit) => (
          <li key={spirit.id} className="spirit-tile">
            <SpiritArt spirit={spirit} />
            <h4>{spirit.name}</h4>
            <p className="meta">printed: {spirit.complexity}</p>
            <label>
              <span className="visually-hidden">Complexity override for {spirit.name}</span>
              <select
                value={complexityOverrides[spirit.id]}
                onChange={(e) => handleSetComplexity(spirit.id, e.target.value as Complexity)}
              >
                {COMPLEXITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            {complexityOverrides[spirit.id] !== spirit.complexity && (
              <button type="button" onClick={() => handleResetComplexity(spirit.id)}>
                Reset
              </button>
            )}
          </li>
        ))}
      </ul>

      {active.tierLabels.map((label, i) => (
        <div key={label}>
          <h3>
            <span className="tier-chip" style={{ backgroundColor: tierColor(i) }}>
              {label}
            </span>{' '}
            <span className="meta">{grouped.labeled[label].length}</span>
          </h3>
          <ul className="spirit-grid">
            {grouped.labeled[label].map((config) => (
              <li key={config.configId} className="spirit-tile">
                <SpiritArt spirit={config.spirit} />
                <h4>
                  {config.spirit.name}
                  {config.aspect ? <span className="meta"> — {config.aspect.name}</span> : null}
                </h4>
                <label>
                  <span className="visually-hidden">
                    Tier for {config.spirit.name}
                    {config.aspect ? ` — ${config.aspect.name}` : ''}
                  </span>
                  <select
                    value={label}
                    disabled={cited}
                    title={cited ? 'A citation cannot be edited.' : undefined}
                    onChange={(e) => handleSetTier(config.configId, e.target.value)}
                  >
                    {active.tierLabels.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div>
        <h3>Unrated</h3>
        <p className="meta">Not rated by this source — {grouped.unrated.length} configurations.</p>
        <ul className="spirit-grid">
          {grouped.unrated.map((config) => (
            <li key={config.configId} className="spirit-tile">
              <SpiritArt spirit={config.spirit} />
              <h4>
                {config.spirit.name}
                {config.aspect ? <span className="meta"> — {config.aspect.name}</span> : null}
              </h4>
              <label>
                <span className="visually-hidden">
                  Tier for {config.spirit.name}
                  {config.aspect ? ` — ${config.aspect.name}` : ''}
                </span>
                <select
                  value=""
                  disabled={cited}
                  title={cited ? 'A citation cannot be edited.' : undefined}
                  onChange={(e) => handleSetTier(config.configId, e.target.value)}
                >
                  <option value="" disabled>
                    Unrated
                  </option>
                  {active.tierLabels.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
