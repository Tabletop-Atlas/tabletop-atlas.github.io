/** PROTOTYPE — throwaway. Variant B: dense "command deck". Sidebar of live knobs, compact rows. */
import { useState } from 'react'
import { SpiritArt } from '../components/SpiritArt'
import type { OCFDU } from '../domain/types'
import { TIERS } from '../domain/types'
import { whyYou } from '../domain/whyYou'
import { TIER_COLOR } from '../components/tierColors'
import type { VariantProps } from './PrototypeApp'

const AXES: (keyof OCFDU)[] = ['offense', 'control', 'fear', 'defense', 'utility']

export function VariantB({
  ranked,
  wildcard,
  weights,
  setWeights,
  tierKnob,
  setTierKnob,
  grouped,
  spirits,
}: VariantProps) {
  const [pane, setPane] = useState<'picks' | 'tiers' | 'browse'>('picks')
  const top = ranked.slice(0, 3)

  return (
    <div className="pv pv-b">
      <aside className="pv-b-side">
        <div className="pv-b-brand">SPIRIT ISLAND</div>

        <nav className="pv-b-nav">
          {(['picks', 'tiers', 'browse'] as const).map((p) => (
            <button key={p} type="button" data-active={pane === p} onClick={() => setPane(p)}>
              {p === 'picks' ? 'Recommend' : p === 'tiers' ? 'Tiers' : 'Browse'}
            </button>
          ))}
        </nav>

        <div className="pv-b-knobs">
          <div className="pv-b-knobs-title">Weights</div>
          {AXES.map((axis) => (
            <label key={axis}>
              <span>{axis}</span>
              <input
                type="range"
                min={0}
                max={5}
                value={weights[axis] ?? 0}
                onChange={(e) => setWeights({ ...weights, [axis]: Number(e.target.value) })}
              />
              <output>{weights[axis] ?? 0}</output>
            </label>
          ))}
          <label>
            <span>tier prior</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={tierKnob}
              onChange={(e) => setTierKnob(Number(e.target.value))}
            />
            <output>{tierKnob.toFixed(2)}</output>
          </label>
        </div>
      </aside>

      <main className="pv-b-main">
        {pane === 'picks' && (
          <>
            <h2>Ranking · live</h2>
            <ol className="pv-b-rows">
              {top.map(({ spirit, score }, i) => (
                <li key={spirit.id}>
                  <span className="pv-b-idx">{i + 1}</span>
                  <SpiritArt spirit={spirit} className="pv-b-thumb" />
                  <div>
                    <div className="pv-b-name">{spirit.name}</div>
                    <div className="pv-b-why">{whyYou(spirit, weights)}</div>
                  </div>
                  <div className="pv-b-nums">
                    {AXES.map((a) => (
                      <span key={a} data-hot={(weights[a] ?? 0) > 0}>
                        {spirit.ratings[a]}
                      </span>
                    ))}
                  </div>
                  <span className="pv-b-score">{score.toFixed(2)}</span>
                </li>
              ))}
            </ol>
            {wildcard && (
              <div className="pv-b-wild">
                <span>WILDCARD</span> {wildcard.name} — {wildcard.summary}
              </div>
            )}
            <p className="pv-b-hint">Drag a weight. The ranking recomputes on every frame.</p>
          </>
        )}

        {pane === 'tiers' && (
          <>
            <h2>Tier list</h2>
            <div className="pv-b-tiers">
              {TIERS.map((tier) => (
                <div className="pv-b-tier-row" key={tier}>
                  <span className="pv-b-tier-key" style={{ background: TIER_COLOR[tier] }}>
                    {tier}
                  </span>
                  <div>
                    {grouped[tier].map((s) => (
                      <span className="pv-b-chip" key={s.id}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {pane === 'browse' && (
          <>
            <h2>All spirits · {spirits.length}</h2>
            <table className="pv-b-table">
              <thead>
                <tr>
                  <th />
                  <th>Spirit</th>
                  <th>Expansion</th>
                  <th>Cx</th>
                  {AXES.map((a) => (
                    <th key={a}>{a[0].toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {spirits.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <SpiritArt spirit={s} className="pv-b-thumb-sm" />
                    </td>
                    <td>{s.name}</td>
                    <td>{s.expansion}</td>
                    <td>{s.complexity[0]}</td>
                    {AXES.map((a) => (
                      <td key={a}>{s.ratings[a]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
    </div>
  )
}
