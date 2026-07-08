/**
 * PROTOTYPE — throwaway. Delete once a direction is chosen (see NOTES.md).
 *
 * Question: what should the Spirit Island recommender look like?
 * Three variants of the whole app shell (results + tier board + browser),
 * switchable via ?variant=A|B|C on the existing single route.
 */
import { useMemo, useState } from 'react'
import spiritsData from '../data/spirits.json'
import { recommend, type Weights } from '../domain/recommend'
import { groupByTier, tierStore } from '../domain/tierStore'
import type { Spirit } from '../domain/types'
import { selectWildcard } from '../domain/wildcard'
import { PrototypeSwitcher, VARIANTS, type VariantKey } from './PrototypeSwitcher'
import { VariantA } from './VariantA'
import { VariantB } from './VariantB'
import { VariantC } from './VariantC'
import './prototype.css'

const spirits = spiritsData as Spirit[]

export interface VariantProps {
  ranked: { spirit: Spirit; score: number }[]
  wildcard: Spirit | undefined
  weights: Weights
  setWeights: (w: Weights) => void
  tierKnob: number
  setTierKnob: (n: number) => void
  grouped: Record<string, Spirit[]>
  spirits: Spirit[]
}

const DEFAULT_WEIGHTS: Weights = { offense: 3, control: 1, fear: 2, defense: 0, utility: 1 }

export function PrototypeApp({ variant }: { variant: VariantKey }) {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS)
  const [tierKnob, setTierKnob] = useState(0.5)

  const ranked = useMemo(
    () => recommend(spirits, weights, { tierPrior: tierStore.getAll(), tierKnob }),
    [weights, tierKnob],
  )
  const wildcard = useMemo(() => selectWildcard(ranked, weights, undefined, 0), [ranked, weights])
  const grouped = useMemo(() => groupByTier(spirits, tierStore.getAll()), [])

  const props: VariantProps = { ranked, wildcard, weights, setWeights, tierKnob, setTierKnob, grouped, spirits }

  return (
    <>
      {variant === 'A' && <VariantA {...props} />}
      {variant === 'B' && <VariantB {...props} />}
      {variant === 'C' && <VariantC {...props} />}
      <PrototypeSwitcher current={variant} variants={VARIANTS} />
    </>
  )
}
