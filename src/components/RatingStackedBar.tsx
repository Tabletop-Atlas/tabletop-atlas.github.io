export interface RatingSegment {
  key: string
  label: string
  count: number
  color: string
}

/**
 * deck-dashboard #19: a 100%-stacked bar for a judgment rating's composition (fear impact here;
 * event valence in #20 reuses the same component with its own segments/colors) — 2px gaps,
 * direct labels so identity never depends on color alone (PRD-2 user stories 15/16). A legend
 * beneath the bar restates every segment's color->label mapping regardless of how narrow a
 * segment renders, so a thin segment never loses its identity to color alone. `onSegmentClick`
 * makes a segment a button (the tag facet's mini bars, #19's "clickable segments"); omitting it
 * renders plain, non-interactive spans (the headline composition bar).
 */
export function RatingStackedBar({
  segments,
  total,
  onSegmentClick,
  activeKey,
}: {
  segments: RatingSegment[]
  total: number
  onSegmentClick?: (key: string) => void
  activeKey?: string
}) {
  const nonZero = segments.filter((s) => s.count > 0)
  return (
    <div className="rating-stacked-bar-wrap">
      <div className="rating-stacked-bar" role="img" aria-label={segments.map((s) => `${s.label} ${pct(s.count, total)}`).join(', ')}>
        {nonZero.map((segment) => {
          const share = pct(segment.count, total)
          const content = (
            <>
              <span className="rating-segment-label">{segment.label}</span>
              <span className="rating-segment-pct">{share}</span>
            </>
          )
          return onSegmentClick ? (
            <button
              key={segment.key}
              type="button"
              className="rating-segment rating-segment-button"
              style={{ flexGrow: segment.count, background: segment.color }}
              aria-pressed={activeKey === segment.key}
              data-active={activeKey === segment.key}
              title={`${segment.label} ${share}`}
              onClick={() => onSegmentClick(segment.key)}
            >
              {content}
            </button>
          ) : (
            <span key={segment.key} className="rating-segment" style={{ flexGrow: segment.count, background: segment.color }} title={`${segment.label} ${share}`}>
              {content}
            </span>
          )
        })}
      </div>
      <div className="rating-legend">
        {segments.map((segment) => (
          <span key={segment.key} className="rating-legend-item">
            <span className="rating-legend-swatch" style={{ background: segment.color }} />
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function pct(count: number, total: number): string {
  return `${total === 0 ? 0 : Math.round((count / total) * 100)}%`
}
