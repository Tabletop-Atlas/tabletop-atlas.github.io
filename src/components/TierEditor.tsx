import { useState } from 'react'
import spiritsData from '../data/spirits.json'
import { expand } from '../domain/configurations'
import { groupByTier, tierStore } from '../domain/tierStore'
import type { Spirit } from '../domain/types'
import { SpiritArt } from './SpiritArt'
import { tierColor } from './tierColors'
import { TierListControls } from './TierListControls'

const spirits = spiritsData as Spirit[]
const configurations = expand(spirits)

/** Editable tier list. The read-only visual board lives in the Tier list tab; the Backup,
 * My collection and Complexity overrides sections moved to the Settings tab (#14). This tab
 * dissolves entirely in #15 once edit mode exists to receive the editing. */
export function TierEditor() {
  const [, setVersion] = useState(0)

  const bump = () => setVersion((v) => v + 1)
  const active = tierStore.getActiveList()
  const cited = active.origin === 'cited'
  const grouped = groupByTier(configurations, tierStore.getAll(), active.tierLabels)
  const customised = tierStore.isCustomised()
  const tierDiscarded = tierStore.wasDiscarded()

  const handleSetTier = (id: string, tier: string) => {
    tierStore.setTier(id, tier)
    bump()
  }

  const handleReset = () => {
    if (!customised) return
    const ok = window.confirm(
      'This discards your tier edits and cannot be undone. Export a backup from Settings first?\n\n' +
        'Choose Cancel to go export, or OK to reset anyway.',
    )
    if (!ok) return
    tierStore.reset()
    bump()
  }

  return (
    <section>
      <h2>Customise tiers</h2>
      <TierListControls totalConfigs={configurations.length} allowCreate onChange={bump} />
      {tierDiscarded && (
        <p className="notice">
          Your saved tier edits were discarded because the shipped tier list has changed since you
          made them. Export a backup from Settings next time to avoid losing edits like this.{' '}
          <button
            type="button"
            onClick={() => {
              tierStore.dismissDiscardNotice()
              bump()
            }}
          >
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
