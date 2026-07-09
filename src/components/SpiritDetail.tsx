import { tierStore } from '../domain/tierStore'
import type { Spirit } from '../domain/types'
import { OcfduRadar } from './OcfduRadar'
import { SpiritArt } from './SpiritArt'

const ARROW: Record<string, string> = { up: '↑ more complex', down: '↓ simpler', same: '→ same complexity' }

/**
 * Everything the app already holds about a spirit, in one place: art, OCFDU shape, tier under
 * the active list, and its aspects. No new data, no transcription - #12 adds panel/card images
 * on top of this once #11 sources them.
 */
export function SpiritDetail({ spirit, onClose }: { spirit: Spirit; onClose: () => void }) {
  const tier = tierStore.getTier(spirit.id)
  const activeList = tierStore.getActiveList()

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal spirit-detail" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={spirit.name}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="spirit-detail-head">
          <SpiritArt spirit={spirit} />
          <div>
            <h2>{spirit.name}</h2>
            <p className="meta">
              {spirit.expansion} · {spirit.complexity}
            </p>
            <p className="meta">
              Tier ({activeList.name}): {tier ?? 'not rated by this list'}
            </p>
          </div>
        </div>

        <p>{spirit.summary}</p>

        <div className="spirit-detail-body">
          <OcfduRadar ratings={spirit.ratings} />
          {spirit.ratingsSource === 'estimate' && (
            <p className="meta">
              These OCFDU ratings are an estimate — nobody has verified them against a printed source.
            </p>
          )}
        </div>

        {spirit.aspects.length > 0 && (
          <>
            <h3>Aspects</h3>
            <ul className="aspects">
              {spirit.aspects.map((aspect) => (
                <li key={aspect.name}>
                  <strong>{aspect.name}</strong>
                  {aspect.complexityDelta && <span className="meta"> · {ARROW[aspect.complexityDelta]}</span>}
                  {' — '}
                  {aspect.delta ?? <em className="meta">effect not transcribed yet</em>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
