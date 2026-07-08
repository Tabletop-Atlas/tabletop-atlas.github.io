/** PROTOTYPE — throwaway. Variant C: light art-forward gallery. Podium of three, scroll rails. */
import { SpiritArt } from '../components/SpiritArt'
import { OcfduRadar } from '../components/OcfduRadar'
import { TIERS } from '../domain/types'
import { whyYou } from '../domain/whyYou'
import { TIER_COLOR } from '../components/tierColors'
import type { VariantProps } from './PrototypeApp'

export function VariantC({ ranked, wildcard, weights, grouped, spirits }: VariantProps) {
  const top = ranked.slice(0, 3)

  return (
    <div className="pv pv-c">
      <header className="pv-c-head">
        <h1>Which spirit tonight?</h1>
        <p>Three picks, chosen from all 37 by how you like to play.</p>
      </header>

      <section className="pv-c-podium">
        {top.map(({ spirit }, i) => (
          <article className={`pv-c-hero ${i === 0 ? 'is-first' : ''}`} key={spirit.id}>
            <div className="pv-c-hero-art">
              <SpiritArt spirit={spirit} className="pv-c-hero-img" />
              <span className="pv-c-badge">{i === 0 ? 'Best fit' : `#${i + 1}`}</span>
            </div>
            <h2>{spirit.name}</h2>
            <p className="pv-c-why">{whyYou(spirit, weights)}</p>
            <p className="pv-c-sum">{spirit.summary}</p>
            <div className="pv-c-foot">
              <OcfduRadar ratings={spirit.ratings} />
              <div>
                <span className="pv-c-pill">{spirit.complexity}</span>
                <span className="pv-c-pill pv-c-pill-ghost">{spirit.expansion}</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      {wildcard && (
        <section className="pv-c-wild">
          <SpiritArt spirit={wildcard} className="pv-c-wild-img" />
          <div>
            <span className="pv-c-badge pv-c-badge-hot">Wildcard</span>
            <h3>{wildcard.name}</h3>
            <p>{wildcard.summary}</p>
          </div>
        </section>
      )}

      <section>
        <h2 className="pv-c-h2">Tier list</h2>
        <div className="pv-c-tiers">
          {TIERS.map((tier) => (
            <div className="pv-c-tier" key={tier}>
              <div className="pv-c-tier-key" style={{ background: TIER_COLOR[tier] }}>
                {tier}
              </div>
              <div className="pv-c-rail">
                {grouped[tier].map((s) => (
                  <figure key={s.id} title={s.name}>
                    <SpiritArt spirit={s} className="pv-c-rail-img" />
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="pv-c-h2">Browse all {spirits.length}</h2>
        <div className="pv-c-gallery">
          {spirits.map((s) => (
            <figure key={s.id}>
              <SpiritArt spirit={s} className="pv-c-gal-img" />
              <figcaption>
                <strong>{s.name}</strong>
                <span>{s.summary}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}
