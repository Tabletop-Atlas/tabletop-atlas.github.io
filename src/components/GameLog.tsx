import { useEffect, useMemo, useRef, useState } from 'react'
import spiritsData from '../data/spirits.json'
import { ADVERSARIES, findAdversary } from '../domain/adversaries'
import type { LogEntry } from '../domain/backup'
import { expand } from '../domain/configurations'
import { type BoardType, computeDifficulty } from '../domain/difficulty'
import { gameLog } from '../domain/gameLog'
import { clampOptionalInt, formatDuration } from '../domain/logEntry'
import { computeLogStats, type RateStat } from '../domain/logStats'
import { SCENARIOS } from '../domain/scenarios'
import type { Spirit } from '../domain/types'
import { AvatarChip } from './AvatarChip'

const BOARD_TYPES: { value: BoardType; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'thematic-base', label: 'Thematic · base' },
  { value: 'thematic-rebalanced', label: 'Thematic · rebalanced' },
]

const spirits = spiritsData as Spirit[]
const configurations = expand(spirits)
const spiritById = new Map(spirits.map((s) => [s.id, s]))

function configLabel(configId: string): string {
  const config = configurations.find((c) => c.configId === configId)
  if (!config) return configId
  return config.aspect ? `${config.spirit.name} — ${config.aspect.name}` : config.spirit.name
}

function spiritForConfig(configId: string): Spirit | undefined {
  const baseId = configId.split('::')[0]
  return spiritById.get(baseId)
}

/** "60% (3/5)", or just the count below the small-sample threshold. */
function formatRate(stat: RateStat): string {
  return stat.rate === undefined
    ? `${stat.wins}/${stat.total} (too few games for a rate)`
    : `${Math.round(stat.rate * 100)}% (${stat.wins}/${stat.total})`
}

interface PlayerRow {
  name: string
  configId: string
}

const EMPTY_PLAYER: PlayerRow = { name: '', configId: '' }
const UNDO_MS = 10_000

function NotesCell({ notes }: { notes?: string }) {
  const [expanded, setExpanded] = useState(false)
  if (!notes) return <span className="meta">—</span>
  return (
    <button
      type="button"
      className={expanded ? 'log-notes-cell log-notes-cell-expanded' : 'log-notes-cell'}
      title={notes}
      onClick={() => setExpanded((e) => !e)}
    >
      {notes}
    </button>
  )
}

/** Record a played game and browse history. A journal, not a feedback loop - see gameLog.ts:
 * outcomes are shown here, never fed back into scoring. */
export function GameLog() {
  const [version, setVersion] = useState(0)
  const [players, setPlayers] = useState<PlayerRow[]>([{ ...EMPTY_PLAYER }])
  const [adversary, setAdversary] = useState('')
  const [adversaryLevel, setAdversaryLevel] = useState(0)
  const [secondaryAdversary, setSecondaryAdversary] = useState('')
  const [secondaryAdversaryLevel, setSecondaryAdversaryLevel] = useState(0)
  const [boardType, setBoardType] = useState<BoardType>('classic')
  const [scenario, setScenario] = useState('')
  const [outcome, setOutcome] = useState<'win' | 'loss'>('win')
  const [terrorLevel, setTerrorLevel] = useState('')
  const [blightRemaining, setBlightRemaining] = useState('')
  const [notes, setNotes] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [undoEntry, setUndoEntry] = useState<LogEntry | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (undoTimer.current !== undefined) clearTimeout(undoTimer.current)
    }
  }, [])

  // version is a deliberate re-run trigger for gameLog's mutable read, not a real dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const entries = useMemo(() => [...gameLog.list()].reverse(), [version])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => computeLogStats(gameLog.list(), spirits), [version])

  const canSubmit = adversary.trim().length > 0 && players.every((p) => p.name.trim() && p.configId)
  const selectedAdversary = findAdversary(adversary)
  const selectedSecondaryAdversary = findAdversary(secondaryAdversary)
  const selectedPlayerSpirits = players.map((p) => (p.configId ? spiritForConfig(p.configId) : undefined))
  const duration = formatDuration(startTime, endTime)

  const handleSetAdversary = (name: string) => {
    setAdversary(name)
    const found = findAdversary(name)
    if (found) setAdversaryLevel((level) => Math.min(Math.max(level, found.minLevel), found.maxLevel))
  }

  const handleSetAdversaryLevel = (raw: string) => {
    // #17: a non-numeric keystroke (a bad paste) must not turn the level into NaN - ignore it
    // and keep whatever valid level was already set, rather than recording a corrupted entry.
    const level = Number(raw)
    if (!Number.isFinite(level)) return
    const found = findAdversary(adversary)
    setAdversaryLevel(found ? Math.min(Math.max(level, found.minLevel), found.maxLevel) : level)
  }

  const handleSetSecondaryAdversary = (name: string) => {
    setSecondaryAdversary(name)
    const found = findAdversary(name)
    if (found) setSecondaryAdversaryLevel((level) => Math.min(Math.max(level, found.minLevel), found.maxLevel))
  }

  const handleSetSecondaryAdversaryLevel = (raw: string) => {
    const level = Number(raw)
    if (!Number.isFinite(level)) return
    const found = findAdversary(secondaryAdversary)
    setSecondaryAdversaryLevel(found ? Math.min(Math.max(level, found.minLevel), found.maxLevel) : level)
  }

  const difficultyBreakdown = useMemo(
    () =>
      computeDifficulty({
        adversary,
        adversaryLevel,
        secondaryAdversary: secondaryAdversary || undefined,
        secondaryAdversaryLevel: secondaryAdversary ? secondaryAdversaryLevel : undefined,
        boardType,
        scenario: scenario || undefined,
      }),
    [adversary, adversaryLevel, secondaryAdversary, secondaryAdversaryLevel, boardType, scenario],
  )

  // Re-seeds the editable difficulty field whenever the setup that produced the suggestion
  // changes; doesn't fire on keystrokes in the difficulty field itself, so an override survives
  // until the owner changes adversary/level/board/scenario again.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setDifficulty(difficultyBreakdown.total !== undefined ? String(difficultyBreakdown.total) : '')
  }, [difficultyBreakdown.total])

  const handleSubmit = () => {
    if (!canSubmit) return
    gameLog.append({
      date: new Date().toISOString(),
      players,
      adversary: adversary.trim(),
      adversaryLevel,
      secondaryAdversary: secondaryAdversary || undefined,
      secondaryAdversaryLevel: secondaryAdversary ? secondaryAdversaryLevel : undefined,
      boardType,
      scenario: scenario.trim() || undefined,
      outcome,
      // #17: Terror Level only ever reaches 3 (confirmed against the rulebook - there is no
      // Terror Level 4); clamped here, not only in the input's advisory `max`, so a typed or
      // pasted out-of-range value can't be recorded.
      terrorLevel: clampOptionalInt(terrorLevel, 1, 3),
      blightRemaining: clampOptionalInt(blightRemaining, 0),
      notes: notes.trim() || undefined,
      difficulty: clampOptionalInt(difficulty, 0),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    })
    setPlayers([{ ...EMPTY_PLAYER }])
    setAdversary('')
    setAdversaryLevel(0)
    setSecondaryAdversary('')
    setSecondaryAdversaryLevel(0)
    setBoardType('classic')
    setScenario('')
    setOutcome('win')
    setTerrorLevel('')
    setBlightRemaining('')
    setNotes('')
    setDifficulty('')
    setStartTime('')
    setEndTime('')
    setVersion((v) => v + 1)
  }

  const handleDelete = (id: string) => {
    const removed = gameLog.remove(id)
    if (!removed) return
    setUndoEntry(removed)
    if (undoTimer.current !== undefined) clearTimeout(undoTimer.current)
    undoTimer.current = setTimeout(() => setUndoEntry(null), UNDO_MS)
    setVersion((v) => v + 1)
  }

  const handleUndo = () => {
    if (!undoEntry) return
    gameLog.append(undoEntry)
    setUndoEntry(null)
    if (undoTimer.current !== undefined) clearTimeout(undoTimer.current)
    setVersion((v) => v + 1)
  }

  return (
    <section className="log-tab">
      <h2>Game log</h2>
      <p className="meta">
        Record what you played. This never adjusts your tier list or your weights. Your log lives
        only in this browser — the backup export in Settings is the durable copy.
      </p>

      <fieldset className="log-panel">
        <legend>Record a game</legend>

        {players.map((player, i) => (
          <div key={i} className="log-row">
            <label className="log-field">
              <span className="log-field-label">Player</span>
              <input
                className="log-input"
                type="text"
                placeholder="Name"
                value={player.name}
                onChange={(e) =>
                  setPlayers((rows) => rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))
                }
              />
            </label>
            <label className="log-field log-field-grow">
              <span className="log-field-label">Spirit / aspect</span>
              <select
                className="log-select"
                value={player.configId}
                onChange={(e) =>
                  setPlayers((rows) => rows.map((r, j) => (j === i ? { ...r, configId: e.target.value } : r)))
                }
              >
                <option value="">Which spirit/aspect?</option>
                {configurations.map((c) => (
                  <option key={c.configId} value={c.configId}>
                    {configLabel(c.configId)}
                  </option>
                ))}
              </select>
            </label>
            {selectedPlayerSpirits[i] && (
              <AvatarChip kind="spirit" spirit={selectedPlayerSpirits[i]!} name={configLabel(player.configId)} />
            )}
            {players.length > 1 && (
              <button type="button" className="log-chip-button" onClick={() => setPlayers((rows) => rows.filter((_, j) => j !== i))}>
                Remove
              </button>
            )}
          </div>
        ))}
        <div className="log-row">
          <button type="button" className="log-chip-button" onClick={() => setPlayers((rows) => [...rows, { ...EMPTY_PLAYER }])}>
            Add player
          </button>
        </div>

        <div className="log-row">
          <label className="log-field log-field-grow">
            <span className="log-field-label">Adversary</span>
            <select className="log-select" value={adversary} onChange={(e) => handleSetAdversary(e.target.value)}>
              <option value="">Which adversary?</option>
              {ADVERSARIES.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="log-field">
            <span className="log-field-label">Level</span>
            <input
              className="log-input log-input-narrow"
              type="number"
              min={selectedAdversary?.minLevel ?? 0}
              max={selectedAdversary?.maxLevel ?? 6}
              value={adversaryLevel}
              onChange={(e) => handleSetAdversaryLevel(e.target.value)}
            />
          </label>
          {adversary && <AvatarChip kind="adversary" name={adversary} />}
        </div>

        <div className="log-row">
          <label className="log-field log-field-grow">
            <span className="log-field-label">Second adversary (optional)</span>
            <select
              className="log-select"
              value={secondaryAdversary}
              onChange={(e) => handleSetSecondaryAdversary(e.target.value)}
            >
              <option value="">None</option>
              {ADVERSARIES.filter((a) => a.name !== adversary).map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="log-field">
            <span className="log-field-label">Level</span>
            <input
              className="log-input log-input-narrow"
              type="number"
              min={selectedSecondaryAdversary?.minLevel ?? 0}
              max={selectedSecondaryAdversary?.maxLevel ?? 6}
              value={secondaryAdversaryLevel}
              disabled={!secondaryAdversary}
              onChange={(e) => handleSetSecondaryAdversaryLevel(e.target.value)}
            />
          </label>
          {secondaryAdversary && <AvatarChip kind="adversary" name={secondaryAdversary} />}
        </div>

        <div className="log-row">
          <span className="log-field-label">Board</span>
          <div className="log-chip-group" role="group" aria-label="Board type">
            {BOARD_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className="log-chip"
                aria-pressed={boardType === value}
                data-active={boardType === value}
                onClick={() => setBoardType(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="log-row">
          <label className="log-field log-field-grow">
            <span className="log-field-label">Scenario (optional)</span>
            <select className="log-select" value={scenario} onChange={(e) => setScenario(e.target.value)}>
              <option value="">None</option>
              {SCENARIOS.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          {scenario && <AvatarChip kind="scenario" name={scenario} />}
        </div>

        <div className="log-row">
          <span className="log-field-label">Outcome</span>
          <div className="log-chip-group" role="group" aria-label="Outcome">
            {(['win', 'loss'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className="log-chip"
                data-outcome={value}
                aria-pressed={outcome === value}
                data-active={outcome === value}
                onClick={() => setOutcome(value)}
              >
                {value === 'win' ? 'Win' : 'Loss'}
              </button>
            ))}
          </div>
        </div>

        <div className="log-row">
          <label className="log-field">
            <span className="log-field-label">Terror level</span>
            <input
              className="log-input log-input-narrow"
              type="number"
              min={1}
              max={3}
              value={terrorLevel}
              onChange={(e) => setTerrorLevel(e.target.value)}
              placeholder="—"
            />
          </label>
          <label className="log-field">
            <span className="log-field-label">Blight remaining</span>
            <input
              className="log-input log-input-narrow"
              type="number"
              min={0}
              value={blightRemaining}
              onChange={(e) => setBlightRemaining(e.target.value)}
              placeholder="—"
            />
          </label>
        </div>

        <div className="log-row">
          <label className="log-field">
            <span className="log-field-label">Start (optional)</span>
            <input className="log-input log-input-narrow" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </label>
          <label className="log-field">
            <span className="log-field-label">End (optional)</span>
            <input className="log-input log-input-narrow" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </label>
          {duration && <span className="meta">{duration}</span>}
        </div>

        <div className="log-field-block">
          <span className="log-field-label">Difficulty (≈ approximate)</span>
          {difficultyBreakdown.lines.length === 0 ? (
            <p className="meta">Pick an adversary to see a suggestion.</p>
          ) : (
            <ul className="log-stat-list">
              {difficultyBreakdown.lines.map((line, i) => (
                <li key={i}>
                  {line.label}: {line.value} ({line.amount >= 0 ? '+' : ''}
                  {line.amount})
                </li>
              ))}
            </ul>
          )}
          <label className="log-field">
            <span className="log-field-label">Total</span>
            <input
              className="log-input log-input-narrow"
              type="number"
              min={0}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              placeholder="—"
            />
          </label>
        </div>

        <label className="log-field log-field-block">
          <span className="log-field-label">Notes (optional)</span>
          <textarea
            className="log-textarea"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it go?"
          />
        </label>

        <div className="log-row">
          <button type="button" className="log-submit" onClick={handleSubmit} disabled={!canSubmit}>
            Record game
          </button>
        </div>
      </fieldset>

      <fieldset className="log-panel">
        <legend>Statistics</legend>
        <p className="meta">
          Descriptive only — read these yourself; nothing here adjusts a tier, a weight, or a complexity override.
        </p>
        {stats.gamesPlayed === 0 ? (
          <p className="meta">No games logged yet.</p>
        ) : (
          <>
            <p>
              Games played: {stats.gamesPlayed} · Overall win rate: {formatRate(stats.overall)}
            </p>
            <p className="meta">Win rate by configuration:</p>
            <ul className="log-stat-list">
              {Object.entries(stats.byConfiguration).map(([configId, stat]) => (
                <li key={configId}>
                  {configLabel(configId)}: {formatRate(stat)}
                </li>
              ))}
            </ul>
            <p className="meta">Win rate by effective complexity:</p>
            <ul className="log-stat-list">
              {Object.entries(stats.byComplexity).map(([complexity, stat]) => (
                <li key={complexity}>
                  {complexity}: {formatRate(stat)}
                </li>
              ))}
            </ul>
            <p className="meta">Win rate by adversary:</p>
            <ul className="log-stat-list">
              {Object.entries(stats.byAdversary).map(([adversaryName, stat]) => (
                <li key={adversaryName}>
                  {adversaryName}: {formatRate(stat)}
                </li>
              ))}
            </ul>
            {Object.keys(stats.byDifficultyBand).length > 0 && (
              <>
                <p className="meta">Win rate by difficulty:</p>
                <ul className="log-stat-list">
                  {Object.entries(stats.byDifficultyBand).map(([band, stat]) => (
                    <li key={band}>
                      {band}: {formatRate(stat)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </fieldset>

      <fieldset className="log-panel">
        <legend>History ({entries.length})</legend>
        {undoEntry && (
          <p className="log-toast" role="status">
            Deleted —{' '}
            <button type="button" className="log-toast-undo" onClick={handleUndo}>
              Undo
            </button>
          </p>
        )}
        {entries.length === 0 ? (
          <p className="meta">No games logged yet.</p>
        ) : (
          <div className="log-table-wrap">
            <table className="log-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Outcome</th>
                  <th>Spirits</th>
                  <th>Adversary</th>
                  <th>Scenario</th>
                  <th>Notes</th>
                  <th>
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td data-label="Date">{entry.date.slice(0, 10)}</td>
                    <td data-label="Outcome">
                      <span className="log-outcome" data-outcome={entry.outcome}>
                        {entry.outcome === 'win' ? 'Win' : 'Loss'}
                      </span>
                      {(entry.terrorLevel !== undefined || entry.blightRemaining !== undefined) && (
                        <span className="meta log-outcome-meta">
                          {entry.terrorLevel !== undefined ? `Terror ${entry.terrorLevel}` : null}
                          {entry.terrorLevel !== undefined && entry.blightRemaining !== undefined ? ' · ' : null}
                          {entry.blightRemaining !== undefined ? `Blight remaining ${entry.blightRemaining}` : null}
                        </span>
                      )}
                      {formatDuration(entry.startTime, entry.endTime) && (
                        <span className="meta log-outcome-meta">{formatDuration(entry.startTime, entry.endTime)}</span>
                      )}
                    </td>
                    <td data-label="Spirits">
                      <span className="log-chip-cluster">
                        {entry.players.map((p, i) => {
                          const spirit = spiritForConfig(p.configId)
                          const label = `${p.name}: ${configLabel(p.configId)}`
                          return spirit ? (
                            <AvatarChip key={i} kind="spirit" spirit={spirit} name={label} />
                          ) : (
                            <span key={i} className="avatar-chip">
                              <span className="avatar-chip-name">{label}</span>
                            </span>
                          )
                        })}
                      </span>
                    </td>
                    <td data-label="Adversary">
                      <span className="log-chip-cluster">
                        <AvatarChip kind="adversary" name={entry.adversary} />
                        <span className="meta">Lv {entry.adversaryLevel}</span>
                        {entry.difficulty !== undefined && <span className="log-difficulty-badge">Diff {entry.difficulty}</span>}
                      </span>
                    </td>
                    <td data-label="Scenario">
                      {entry.scenario ? <AvatarChip kind="scenario" name={entry.scenario} /> : <span className="meta">—</span>}
                    </td>
                    <td data-label="Notes">
                      <NotesCell notes={entry.notes} />
                    </td>
                    <td data-label="Actions">
                      <button type="button" className="log-delete" onClick={() => handleDelete(entry.id)} aria-label="Delete game">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </fieldset>
    </section>
  )
}
