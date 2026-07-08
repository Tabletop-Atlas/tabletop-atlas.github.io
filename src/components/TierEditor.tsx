import { useMemo, useRef, useState } from 'react'
import spiritsData from '../data/spirits.json'
import { answersStore } from '../domain/answersStore'
import { parse, serialise } from '../domain/backup'
import type { KnownIds } from '../domain/backup'
import { expand } from '../domain/configurations'
import { QUESTIONS } from '../domain/questionnaire'
import { groupByTier, tierStore } from '../domain/tierStore'
import { TIERS } from '../domain/types'
import type { Spirit, Tier } from '../domain/types'
import { SpiritArt } from './SpiritArt'
import { TIER_COLOR } from './tierColors'

const spirits = spiritsData as Spirit[]
const configurations = expand(spirits)

// Complexity overrides and the game log don't exist as stores yet (issues #05, #06) - the
// backup format already declares both sections so this file only grows data, never a version.
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
  a.click()
  URL.revokeObjectURL(url)
}

/** Editable tier list. The read-only visual board lives in the Tier list tab. */
export function TierEditor() {
  const [version, setVersion] = useState(0)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const grouped = useMemo(() => groupByTier(configurations, tierStore.getAll()), [version])
  const customised = tierStore.isCustomised()

  const handleSetTier = (id: string, tier: Tier) => {
    tierStore.setTier(id, tier)
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
      tiers: tierStore.getAll(),
      complexityOverrides: {},
      answers: answersStore.load() ?? {},
      log: [],
    })
    downloadBackup(json)
  }

  const handleImportFile = async (file: File) => {
    setImportMessage(null)
    let result
    try {
      result = parse(await file.text(), KNOWN_IDS)
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : 'Could not read that backup file.')
      return
    }
    tierStore.reset()
    for (const [id, tier] of Object.entries(result.state.tiers)) {
      tierStore.setTier(id, tier as Tier)
    }
    answersStore.save(result.state.answers)
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
        tiers and answers; it never touches this browser's copy of your game log.
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
