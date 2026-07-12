import { useState } from 'react'
import powerCardsData from '../data/power-cards.json'
import type { PowerCard } from '../domain/types'
import { CardGrid } from './CardGrid'
import { CardRows } from './CardRows'

const cards = powerCardsData as PowerCard[]

type View = 'grid' | 'rows'

/** v4 #11: the first complete Cards-tab slice — all 332 power cards, no filters yet (#12).
 * Both v4 #04 result shapes ship, switchable: the image grid is how the owner recognises
 * cards, the compact rows scan fast as a data sheet. Neither replaces the other. */
export function CardsTab() {
  const [view, setView] = useState<View>('grid')

  return (
    <section>
      <h2>Cards</h2>
      <div className="card-view-switch" role="group" aria-label="Card view">
        <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
          Grid
        </button>
        <button type="button" aria-pressed={view === 'rows'} onClick={() => setView('rows')}>
          Rows
        </button>
      </div>
      <p>{cards.length} power cards</p>
      {view === 'grid' ? <CardGrid cards={cards} /> : <CardRows cards={cards} />}
    </section>
  )
}
