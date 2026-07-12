import { useState } from 'react'
import spiritsData from '../data/spirits.json'
import { collectionStore, filterOwnedConfigurations, isConfigurationOwned } from '../domain/collectionStore'
import { expand, type Configuration } from '../domain/configurations'
import { groupByTier, tierStore } from '../domain/tierStore'
import type { Spirit } from '../domain/types'
import { SpiritArt } from './SpiritArt'
import { tierColor } from './tierColors'
import { TierListControls } from './TierListControls'

const spirits = spiritsData as Spirit[]
const configurations = expand(spirits)

/** v5 #06: a configuration outside the collection stays in its rated tier row - a tier is
 * "how good," not "do you own it," so it's dimmed and badged in place, never regrouped. */
function TierTile({ config, owned }: { config: Configuration; owned: boolean }) {
  return (
    <figure
      className={owned ? 'tier-tile' : 'tier-tile tier-tile-unowned'}
      title={
        (config.aspect ? `${config.spirit.name} — ${config.aspect.name} aspect` : config.spirit.name) +
        (owned ? '' : ' (not in your collection)')
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
      {!owned && (
        <span className="unowned-badge" aria-hidden="true">
          ⊘
        </span>
      )}
      {!owned && <span className="visually-hidden"> — not in your collection</span>}
    </figure>
  )
}

/** Read-only visual tier board. Editing lives in the Customise tab. */
export function TierBoard() {
  const [, setVersion] = useState(0)
  const [hardFilter, setHardFilter] = useState(false)
  const bump = () => setVersion((v) => v + 1)
  const active = tierStore.getActiveList()
  const customised = tierStore.isCustomised()
  const excluded = new Set(collectionStore.getExcluded())
  // Hard-filter (#06's opt-in): excluded exactly as if annotation had removed them first, rather
  // than dimmed in place. Session-only - a view preference, not collection data, so it isn't
  // persisted or exported like the collection itself.
  const visibleConfigurations = hardFilter ? filterOwnedConfigurations(configurations, excluded) : configurations
  const grouped = groupByTier(visibleConfigurations, tierStore.getAll(), active.tierLabels)

  return (
    <section>
      <h2>Tier list</h2>
      <TierListControls totalConfigs={configurations.length} onChange={bump} />
      <p>
        {customised ? 'Your customised tier list' : 'The shipped tier list'} — <strong>{active.tierLabels[0]}</strong>{' '}
        is strongest, <strong>{active.tierLabels[active.tierLabels.length - 1]}</strong> weakest. This ordering feeds
        the recommender: the <em>raw power ↔ something fresh</em> slider decides how heavily a spirit's tier counts
        toward its score. Change it in the <strong>Customise tiers</strong> tab.
      </p>
      <label className="deck-field-inline">
        <input type="checkbox" checked={hardFilter} onChange={(e) => setHardFilter(e.target.checked)} />
        Only show spirits I own
      </label>

      <div className="tier-board">
        {active.tierLabels.map((label, i) => (
          <div className="tier-row" key={label}>
            <div className="tier-label" style={{ backgroundColor: tierColor(i) }}>
              {label}
            </div>
            <div className="tier-tiles">
              {grouped.labeled[label].length === 0 ? (
                <p className="tier-empty">No spirits in this tier</p>
              ) : (
                grouped.labeled[label].map((config) => (
                  <TierTile key={config.configId} config={config} owned={isConfigurationOwned(config, excluded)} />
                ))
              )}
            </div>
          </div>
        ))}

        <div className="tier-row tier-row-unrated">
          <div className="tier-label tier-label-unrated">Unrated</div>
          <div className="tier-tiles">
            <p className="tier-empty meta">
              Not rated by this source — different from rated badly. {grouped.unrated.length} of {configurations.length}{' '}
              configurations here.
            </p>
            {grouped.unrated.map((config) => (
              <TierTile key={config.configId} config={config} owned={isConfigurationOwned(config, excluded)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
