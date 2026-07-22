import { useState, type ReactNode } from 'react'

export interface NavItem<T extends string> {
  id: T
  label: string
}

/**
 * The "command deck" shell: a persistent sidebar (brand, nav, live controls) beside a
 * dense main pane. The sidebar hosts whatever controls the active tab wants to keep
 * always-visible, so tweaking a control and watching the main pane react is the primary
 * interaction rather than a submit-and-wait form.
 *
 * mobile-panel: at the phone breakpoint (≤640px, see deck.css) the shell instead shows a
 * sticky top bar (logo + hamburger) and the nav slides in as a drawer. The drawer is
 * CSS-off-canvas, never unmounted — the nav destinations stay in the rendered markup with
 * the drawer closed. The `side` slot never enters the drawer; on phone it is hidden and the
 * owning tab is responsible for surfacing its controls in the main pane.
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
  const [drawerOpen, setDrawerOpen] = useState(false)

  const logo = (
    <img className="deck-brand" src={`${import.meta.env.BASE_URL}spirit-island-logo.webp`} alt="Spirit Island" />
  )

  return (
    <div className="deck" data-drawer-open={drawerOpen}>
      <header className="deck-topbar">
        <button
          type="button"
          className="deck-brand-button"
          onClick={() => {
            setDrawerOpen(false)
            onHome()
          }}
          aria-label="Home"
        >
          {logo}
        </button>
        <button
          type="button"
          className="deck-menu-toggle"
          onClick={() => setDrawerOpen((open) => !open)}
          aria-expanded={drawerOpen}
          aria-controls="deck-drawer"
          aria-label="Menu"
        >
          <span className="deck-menu-icon" aria-hidden="true" />
        </button>
      </header>
      <aside className="deck-side">
        <button type="button" className="deck-brand-button" onClick={onHome} aria-label="Home">
          {logo}
        </button>
        {/* the drawer IS the navigation landmark — aria-controls points at the labelled <nav> */}
        <nav id="deck-drawer" className="deck-drawer deck-nav" aria-label="Main">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              data-active={current === item.id}
              aria-current={current === item.id ? 'page' : undefined}
              onClick={() => {
                setDrawerOpen(false)
                onNavigate(item.id)
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {side != null && <div className="deck-side-slot">{side}</div>}
      </aside>
      <div className="deck-drawer-backdrop" aria-hidden="true" onClick={() => setDrawerOpen(false)} />
      <main className="deck-main">{children}</main>
    </div>
  )
}
