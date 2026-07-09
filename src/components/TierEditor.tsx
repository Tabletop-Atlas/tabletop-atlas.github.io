import { useMemo, useRef, useState } from 'react'
import spiritsData from '../data/spirits.json'
import { answersStore } from '../domain/answersStore'
import { parse, serialise } from '../domain/backup'
import type { KnownIds } from '../domain/backup'
import { complexityStore } from '../domain/complexityStore'
import { expand } from '../domain/configurations'
import { gameLog } from '../domain/gameLog'
import { QUESTIONS } from '../domain/questionnaire'
import { groupByTier, tierStore } from '../domain/tierStore'
import { COMPLEXITIES, TIERS } from '../domain/types'
import type { Complexity, Spirit, Tier } from '../domain/types'
import { SpiritArt } from './SpiritArt'
import { TIER_COLOR } from './tierColors'

const spirits = spiritsData as Spirit[]
const configurations = expand(spirits)

const KNOWN_IDS: KnownIds = {
  tierIds: new Set(configurations.map((c) => c.configId)),
  complexityIds: new Set(spirits.map((s) => s.id)),
  questionIds: new Set(QUESTIONS.map((q) => q.id)),
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
  const [version, setVersion] = useState(0)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  // version is a deliberate re-run trigger for tierStore's mutable read, not a real dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const grouped = useMemo(() => groupByTier(configurations, tierStore.getAll()), [version])
  const customised = tierStore.isCustomised()
  const complexityOverrides = complexityStore.getAll()
  const complexityCustomised = complexityStore.isCustomised()
  const tierDiscarded = tierStore.wasDiscarded()
  const complexityDiscarded = complexityStore.wasDiscarded()

  const handleDismissDiscardNotice = (store: 'tiers' | 'complexity overrides') => {
    if (store === 'tiers') tierStore.dismissDiscardNotice()
    else complexityStore.dismissDiscardNotice()
    setVersion((v) => v + 1)
  }

  const handleSetTier = (id: string, tier: Tier) => {
    tierStore.setTier(id, tier)
    setVersion((v) => v + 1)
  }

  const handleSetComplexity = (spiritId: string, complexity: Complexity) => {
    complexityStore.setComplexity(spiritId, complexity)
    setVersion((v) => v + 1)
  }

  const handleResetComplexity = (spiritId: string) => {
    complexityStore.reset(spiritId)
    setVersion((v) => v + 1)
  }

  const handleReset = () => {
    if (!customised) return
    const ok = window.confirm(
      'This discards your tier edits and cannot be undone. Export a backup first?\n\n' +
        'Choose Cancel to go export, or OK to reset anyway.',
    )
    if (!ok) return
    tierStore.reset()
    setVersion((v) => v + 1)
  }

  const handleExport = () => {
    const json = serialise({
      tiers: tierStore.getOverrides(),
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
      result = parse(await file.text(), KNOWN_IDS, gameLog.list())
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : 'Could not read that backup file.')
      return
    }

    const hasExistingData =
      tierStore.isCustomised() ||
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

    tierStore.reset()
    for (const [id, tier] of Object.entries(result.state.tiers)) {
      tierStore.setTier(id, tier as Tier)
    }
    complexityStore.resetAll()
    for (const [spiritId, complexity] of Object.entries(result.state.complexityOverrides)) {
      complexityStore.setComplexity(spiritId, complexity as Complexity)
    }
    answersStore.save(result.state.answers)
    gameLog.replaceAll(result.state.log)
    setVersion((v) => v + 1)
    setImportMessage(
      result.unresolved.length > 0
        ? `Imported. Could not resolve ${result.unresolved.length} id(s): ${result.unresolved.join(', ')}`
        : 'Imported successfully.',
    )
  }

  return (
    <section>
      <h2>Customise tiers</h2>
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
      <p>
        Reassign any spirit. Your edits are saved in this browser and override the shipped list —
        they change how the recommender's <em>raw power</em> slider ranks spirits.
      </p>
      <p>
        <button type="button" onClick={handleReset} disabled={!customised}>
          Reset to the shipped tier list
        </button>{' '}
        {customised ? <span className="meta">You have unsaved-to-repo edits.</span> : null}
      </p>

      <h3>Backup</h3>
      <p className="meta">
        Nothing here survives a cleared browser cache unless you export it. Import replaces your
        tiers, complexity overrides and answers; your game log is appended and de-duplicated by
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

      {TIERS.map((tier) => (
        <div key={tier}>
          <h3>
            <span className="tier-chip" style={{ backgroundColor: TIER_COLOR[tier] }}>
              {tier}
            </span>{' '}
            <span className="meta">{grouped[tier].length}</span>
          </h3>
          <ul className="spirit-grid">
            {grouped[tier].map((config) => (
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
                  <select value={tier} onChange={(e) => handleSetTier(config.configId, e.target.value as Tier)}>
                    {TIERS.map((t) => (
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
    </section>
  )
}
