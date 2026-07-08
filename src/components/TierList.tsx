import { useMemo, useState } from 'react'
import spiritsData from '../data/spirits.json'
import { tierStore } from '../domain/tierStore'
import type { Spirit, Tier } from '../domain/types'
import { PlaceholderArt } from './PlaceholderArt'

const spirits = spiritsData as Spirit[]
const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D']

export function TierList() {
  const [version, setVersion] = useState(0)

  const grouped = useMemo(() => {
    const all = tierStore.getAll()
    const groups: Record<Tier, Spirit[]> = { S: [], A: [], B: [], C: [], D: [] }
    for (const spirit of spirits) {
      const tier = all[spirit.id] ?? 'B'
      groups[tier].push(spirit)
    }
    return groups
  }, [version])

  const handleSetTier = (id: string, tier: Tier) => {
    tierStore.setTier(id, tier)
    setVersion((v) => v + 1)
  }

  const handleReset = () => {
    tierStore.reset()
    setVersion((v) => v + 1)
  }

  return (
    <section>
      <h2>Tier list</h2>
      <p>Provisional community-consensus tiers, editable per spirit. Edits persist across reloads.</p>
      <button type="button" onClick={handleReset}>
        Reset to default
      </button>

      {TIERS.map((tier) => (
        <div key={tier}>
          <h3>{tier} tier</h3>
          <ul className="spirit-grid">
            {grouped[tier].map((spirit) => (
              <li key={spirit.id} className="spirit-tile">
                <PlaceholderArt spirit={spirit} />
                <h4>{spirit.name}</h4>
                <select
                  value={tier}
                  onChange={(e) => handleSetTier(spirit.id, e.target.value as Tier)}
                >
                  {TIERS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
