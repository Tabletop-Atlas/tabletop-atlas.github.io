import { useId, useState, type ReactNode } from 'react'
import { glossaryEntry } from '../domain/glossary'

/**
 * Inline glossary term: dotted underline + popover on hover/click/focus. An id absent from the
 * map renders as plain text (no broken affordance) so missing definitions stay honest.
 */
export function Term({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  const entry = glossaryEntry(id)
  const [open, setOpen] = useState(false)
  const tipId = useId()

  if (!entry) {
    return className ? <span className={className}>{children}</span> : <>{children}</>
  }

  return (
    <span className={className ? `term-wrap ${className}` : 'term-wrap'}>
      <button
        type="button"
        className="term"
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={(e) => {
          // Don't dismiss a keyboard-focused term just because the pointer left.
          if (e.currentTarget !== document.activeElement) setOpen(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false)
            e.currentTarget.blur()
          }
        }}
      >
        {children}
      </button>
      {open && (
        <span id={tipId} role="tooltip" className="term-popover">
          {entry.text}
        </span>
      )}
    </span>
  )
}
