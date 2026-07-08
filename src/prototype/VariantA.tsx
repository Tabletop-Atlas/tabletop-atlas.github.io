/** PROTOTYPE — throwaway. Variant A: dark editorial "dossier". One column, banner art, no cards. */
import { TIERS } from '../domain/types'
import { OcfduRadar } from '../components/OcfduRadar'
import { SpiritArt } from '../components/SpiritArt'
import { whyYou } from '../domain/whyYou'
import type { VariantProps } from './PrototypeApp'

export function VariantA({ ranked, wildcard, weights, grouped, spirits }: VariantProps) {
  const top = ranked.slice(0, 3)

  return (
    <div className="pv pv-a">
      <header className="pv-a-head">
        <div className="pv-a-kicker">Spirit Island</div>
        <h1>The Recommender</h1>
        <nav>
          <a href="#picks">Your picks</a>
          <a href="#tiers">Tier list</a>
          <a href="#browse">All spirits</a>
        </nav>
      </header>

      <section id="picks">
        <h2 className="pv-a-rule">Tonight&rsquo;s picks</h2>
        {top.map(({ spirit, score }, i) => (
          <article className="pv-a-dossier" key={spirit.id}>
            <div className="pv-a-banner">
              <SpiritArt spirit={spirit} className="pv-a-banner-img" />
              <span className="pv-a-rank">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="pv-a-meta">
              <span>{spirit.expansion}</span>
              <span>{spirit.complexity}</span>
              <span>{score.toFixed(2)}</span>
            </div>
            <h3>{spirit.name}</h3>
            <p className="pv-a-why">{whyYou(spirit, weights)}</p>
            <p className="pv-a-summary">{spirit.summary}</p>
            <div className="pv-a-stats">
              <OcfduRadar ratings={spirit.ratings} />
              <dl>
                {Object.entries(spirit.ratings).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k.slice(0, 3)}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}

        {wildcard && (
          <article className="pv-a-wild">
            <div className="pv-a-kicker">The wildcard</div>
            <h3>{wildcard.name}</h3>
            <p>{wildcard.summary}</p>
          </article>
        )}
      </section>

      <section id="tiers">
        <h2 className="pv-a-rule">Tier list</h2>
        {TIERS.map((tier) => (
          <div className="pv-a-tier" key={tier}>
            <div className="pv-a-tier-key">{tier}</div>
            <p>{grouped[tier].map((s) => s.name).join(' · ') || '—'}</p>
          </div>
        ))}
      </section>

      <section id="browse">
        <h2 className="pv-a-rule">All spirits</h2>
        <ul className="pv-a-index">
          {spirits.map((s) => (
            <li key={s.id}>
              <SpiritArt spirit={s} className="pv-a-thumb" />
              <span>{s.name}</span>
              <em>{s.complexity}</em>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
