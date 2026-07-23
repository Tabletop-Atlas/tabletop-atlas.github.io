import { ADVERSARIES } from '../domain/adversaries'
import { GLOSSARY } from '../domain/glossary'

const CATEGORIES: { label: string; test: (id: string) => boolean }[] = [
  { label: 'Fear impact', test: (id) => id.startsWith('impact-') },
  { label: 'Event valence', test: (id) => id.startsWith('valence-') },
  { label: 'Fear tags', test: (id) => id.startsWith('fear-tag-') },
  { label: 'Event classes', test: (id) => id.startsWith('event-class-') },
  { label: 'Difficulty', test: (id) => id === 'difficulty' },
]

const SOURCE_LABEL: Record<string, string> = {
  context: 'CONTEXT.md',
  owner: 'Owner',
  wiki: 'Spirit Island Wiki',
}

const LEVELS = [0, 1, 2, 3, 4, 5, 6]

function DifficultyTable() {
  return (
    <div className="log-table-wrap glossary-difficulty-table">
      <table className="log-table">
        <thead>
          <tr>
            <th>Adversary</th>
            {LEVELS.map((l) => (
              <th key={l}>L{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ADVERSARIES.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              {LEVELS.map((l) => (
                <td key={l}>{a.difficultyByLevel?.[l] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="meta">
        Per-level numbers: Spirit Island Wiki (spiritislandwiki.com), one fetch per adversary. Modifiers — second
        adversary (higher + ~60% of lower), board (Thematic·base +3, Thematic·rebalanced +1), scenario (its own
        printed difficulty) — from the community difficulty chart (
        <code>Spirit_Island_Difficulty_Chart_with_Expansions_053122v2.pdf</code>). An adversary with no
        wiki-published per-level table shows blank cells, never a guessed zero.
      </p>
    </div>
  )
}

/** Browsable listing of every `GLOSSARY` entry, grouped by id prefix so a future entry needs no
 * page edit (issue 06). The Difficulty category also renders the additive model as a table built
 * from `adversaries.json`, never a hardcoded duplicate of the numbers. */
export function GlossaryTab() {
  const entries = Object.entries(GLOSSARY)

  return (
    <section className="glossary-tab">
      <h2>Glossary</h2>
      <p className="meta">Every defined term in one place, grouped by category, each with its source.</p>

      {CATEGORIES.map(({ label, test }) => {
        const inCategory = entries.filter(([id]) => test(id))
        if (inCategory.length === 0) return null
        return (
          <fieldset className="log-panel" key={label}>
            <legend>{label}</legend>
            {label === 'Difficulty' && <DifficultyTable />}
            <ul className="log-stat-list">
              {inCategory.map(([id, entry]) => (
                <li key={id}>
                  <strong>{id}</strong> — {entry.text}{' '}
                  <span className="meta">({SOURCE_LABEL[entry.source] ?? entry.source})</span>
                </li>
              ))}
            </ul>
          </fieldset>
        )
      })}
    </section>
  )
}
