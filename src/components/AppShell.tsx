import { useState, type ReactNode } from 'react'
import { ChipVariantSwitcher, readChipVariant } from './ChipRound'
import { readTheme, ThemeVariantSwitcher } from './ThemeRound'

export interface NavItem<T extends string> {
  id: T
  label: string
}

/**
 * The "command deck" shell: a persistent sidebar (brand, nav, live controls) beside a
 * dense main pane. The sidebar hosts whatever controls the active tab wants to keep
 * always-visible, so tweaking a control and watching the main pane react is the primary
 * interaction rather than a submit-and-wait form.
 */
export function AppShell<T extends string>({
  nav,
  current,
  onNavigate,
  onHome,
  side,
  children,
}: {
  nav: NavItem<T>[]
  current: T
  onNavigate: (id: T) => void
  /** The logo is the only route home (#01 decision 3) — there is no Home nav button. */
  onHome: () => void
  side?: ReactNode
  children: ReactNode
}) {
  const [theme, setTheme] = useState(readTheme)
  const [chips, setChips] = useState(readChipVariant)

  return (
    <div className={theme ? `deck theme-${theme}` : 'deck'}>
      <aside className="deck-side">
        <button type="button" className="deck-brand-button" onClick={onHome} aria-label="Home">
          <img className="deck-brand" src={`${import.meta.env.BASE_URL}spirit-island-logo.webp`} alt="Spirit Island" />
        </button>
        <nav className="deck-nav">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              data-active={current === item.id}
              aria-current={current === item.id ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {side}
      </aside>
      <main className="deck-main">{children}</main>
      {(theme || chips) && (
        <div className="variant-switcher-stack">
          {theme && <ThemeVariantSwitcher current={theme} onPick={setTheme} />}
          {chips && <ChipVariantSwitcher current={chips} onPick={setChips} />}
        </div>
      )}
    </div>
  )
}
