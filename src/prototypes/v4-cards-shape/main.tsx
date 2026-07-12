import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../deck.css'
import { CardsShapePrototype } from './CardsShapePrototype'

/** v4 #04 PROTOTYPE — standalone entry, deliberately not wired into App.tsx/AppShell per the
 * ticket. Imports deck.css so the real fonts/colors/tokens are used (the question is result
 * shape, not restyling from scratch), but nav/sidebar/tabs don't exist here. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="deck-main" style={{ maxWidth: 'none' }}>
      <CardsShapePrototype />
    </div>
  </StrictMode>,
)
