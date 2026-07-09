import { useState } from 'react'
import spiritsData from '../data/spirits.json'
import { expand, type Configuration } from '../domain/configurations'
import { groupByTier, tierStore } from '../domain/tierStore'
import type { Spirit } from '../domain/types'
import { SpiritArt } from './SpiritArt'
import { tierColor } from './tierColors'
import { TierListControls } from './TierListControls'

const spirits = spiritsData as Spirit[]
const configurations = expand(spirits)

function TierTile({ config }: { config: Configuration }) {
  return (
    <figure
      className="tier-tile"
      title={config.aspect ? `${config.spirit.name} — ${config.aspect.name} aspect` : config.spirit.name}
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
    </figure>
  )
}

/** Read-only visual tier board. Editing lives in the Customise tab. */
export function TierBoard() {
  const [, setVersion] = useState(0)
  const bump = () => setVersion((v) => v + 1)
  const active = tierStore.getActiveList()
  const grouped = groupByTier(configurations, tierStore.getAll(), active.tierLabels)
  const customised = tierStore.isCustomised()

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
                grouped.labeled[label].map((config) => <TierTile key={config.configId} config={config} />)
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
              <TierTile key={config.configId} config={config} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
