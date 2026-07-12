import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../deck.css'
import { TagColorsPrototype } from './TagColorsPrototype'

/** v5 #08 PROTOTYPE — standalone entry, deliberately not wired into App.tsx/AppShell (same
 * shape as v4 #04's cards-shape prototype). Imports deck.css for the real dark theme/tokens, but
 * nav/sidebar/tabs don't exist here - the question is chip/badge/stripe treatment, not full-app
 * chrome. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TagColorsPrototype />
  </StrictMode>,
)
