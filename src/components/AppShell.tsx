import type { ReactNode } from 'react'

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
  side,
  children,
}: {
  nav: NavItem<T>[]
  current: T
  onNavigate: (id: T) => void
  side?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="deck">
      <aside className="deck-side">
        <img className="deck-brand" src={`${import.meta.env.BASE_URL}spirit-island-logo.webp`} alt="Spirit Island" />
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
    </div>
  )
}
