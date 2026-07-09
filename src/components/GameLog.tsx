import { useMemo, useState } from 'react'
import spiritsData from '../data/spirits.json'
import { expand } from '../domain/configurations'
import { gameLog } from '../domain/gameLog'
import { computeLogStats, type RateStat } from '../domain/logStats'
import type { Spirit } from '../domain/types'

const spirits = spiritsData as Spirit[]
const configurations = expand(spirits)

function configLabel(configId: string): string {
  const config = configurations.find((c) => c.configId === configId)
  if (!config) return configId
  return config.aspect ? `${config.spirit.name} — ${config.aspect.name}` : config.spirit.name
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

/** Record a played game and browse history. A journal, not a feedback loop - see gameLog.ts:
 * outcomes are shown here, never fed back into scoring. */
export function GameLog() {
  const [version, setVersion] = useState(0)
  const [players, setPlayers] = useState<PlayerRow[]>([{ ...EMPTY_PLAYER }])
  const [adversary, setAdversary] = useState('')
  const [adversaryLevel, setAdversaryLevel] = useState(0)
  const [scenario, setScenario] = useState('')
  const [outcome, setOutcome] = useState<'win' | 'loss'>('win')
  const [terrorLevel, setTerrorLevel] = useState('')
  const [blightRemaining, setBlightRemaining] = useState('')

  const entries = useMemo(() => [...gameLog.list()].reverse(), [version])
  const stats = useMemo(() => computeLogStats(gameLog.list(), spirits), [version])

  const canSubmit = adversary.trim().length > 0 && players.every((p) => p.name.trim() && p.configId)

  const handleSubmit = () => {
    if (!canSubmit) return
    gameLog.append({
      date: new Date().toISOString(),
      players,
      adversary: adversary.trim(),
      adversaryLevel,
      scenario: scenario.trim() || undefined,
      outcome,
      terrorLevel: terrorLevel ? Number(terrorLevel) : undefined,
      blightRemaining: blightRemaining ? Number(blightRemaining) : undefined,
    })
    setPlayers([{ ...EMPTY_PLAYER }])
    setAdversary('')
    setAdversaryLevel(0)
    setScenario('')
    setOutcome('win')
    setTerrorLevel('')
    setBlightRemaining('')
    setVersion((v) => v + 1)
  }

  return (
    <section>
      <h2>Game log</h2>
      <p>Record what you played. This never adjusts your tier list or your weights.</p>

      <h3>Record a game</h3>
      {players.map((player, i) => (
        <p key={i}>
          <label>
            <span className="visually-hidden">Player name</span>
            <input
              type="text"
              placeholder="Player name"
              value={player.name}
              onChange={(e) =>
                setPlayers((rows) => rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))
              }
            />
          </label>{' '}
          <label>
            <span className="visually-hidden">Configuration played</span>
            <select
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
          </label>{' '}
          {players.length > 1 && (
            <button type="button" onClick={() => setPlayers((rows) => rows.filter((_, j) => j !== i))}>
              Remove
            </button>
          )}
        </p>
      ))}
      <p>
        <button type="button" onClick={() => setPlayers((rows) => [...rows, { ...EMPTY_PLAYER }])}>
          Add player
        </button>
      </p>

      <p>
        <label>
          <span>Adversary</span>{' '}
          <input type="text" value={adversary} onChange={(e) => setAdversary(e.target.value)} />
        </label>{' '}
        <label>
          <span>Level</span>{' '}
          <input
            type="number"
            min={0}
            max={6}
            value={adversaryLevel}
            onChange={(e) => setAdversaryLevel(Number(e.target.value))}
          />
        </label>
      </p>
      <p>
        <label>
          <span>Scenario (optional)</span>{' '}
          <input type="text" value={scenario} onChange={(e) => setScenario(e.target.value)} />
        </label>
      </p>
      <p>
        <label>
          <span>Outcome</span>{' '}
          <select value={outcome} onChange={(e) => setOutcome(e.target.value as 'win' | 'loss')}>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
          </select>
        </label>
      </p>
      <p>
        <label>
          <span>Terror level (optional)</span>{' '}
          <input type="number" min={1} max={3} value={terrorLevel} onChange={(e) => setTerrorLevel(e.target.value)} />
        </label>{' '}
        <label>
          <span>Blight remaining (optional)</span>{' '}
          <input
            type="number"
            min={0}
            value={blightRemaining}
            onChange={(e) => setBlightRemaining(e.target.value)}
          />
        </label>
      </p>
      <p>
        <button type="button" onClick={handleSubmit} disabled={!canSubmit}>
          Record game
        </button>
      </p>

      <h3>Statistics</h3>
      <p className="meta">
        Descriptive only — read these yourself; nothing here adjusts a tier, a weight, or a
        complexity override.
      </p>
      {stats.gamesPlayed === 0 ? (
        <p className="meta">No games logged yet.</p>
      ) : (
        <>
          <p>
            Games played: {stats.gamesPlayed} · Overall win rate: {formatRate(stats.overall)}
          </p>
          <p className="meta">Win rate by configuration:</p>
          <ul>
            {Object.entries(stats.byConfiguration).map(([configId, stat]) => (
              <li key={configId}>
                {configLabel(configId)}: {formatRate(stat)}
              </li>
            ))}
          </ul>
          <p className="meta">Win rate by effective complexity:</p>
          <ul>
            {Object.entries(stats.byComplexity).map(([complexity, stat]) => (
              <li key={complexity}>
                {complexity}: {formatRate(stat)}
              </li>
            ))}
          </ul>
          <p className="meta">Win rate by adversary:</p>
          <ul>
            {Object.entries(stats.byAdversary).map(([adversaryName, stat]) => (
              <li key={adversaryName}>
                {adversaryName}: {formatRate(stat)}
              </li>
            ))}
          </ul>
        </>
      )}

      <h3>History ({entries.length})</h3>
      {entries.length === 0 ? (
        <p className="meta">No games logged yet.</p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.date.slice(0, 10)}</strong> — {entry.outcome} vs {entry.adversary} (level{' '}
              {entry.adversaryLevel}){entry.scenario ? ` — ${entry.scenario}` : ''}
              <ul>
                {entry.players.map((p, i) => (
                  <li key={i}>
                    {p.name}: {configLabel(p.configId)}
                  </li>
                ))}
              </ul>
              {(entry.terrorLevel !== undefined || entry.blightRemaining !== undefined) && (
                <p className="meta">
                  {entry.terrorLevel !== undefined ? `Terror ${entry.terrorLevel}` : null}
                  {entry.terrorLevel !== undefined && entry.blightRemaining !== undefined ? ' · ' : null}
                  {entry.blightRemaining !== undefined ? `Blight remaining ${entry.blightRemaining}` : null}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
