import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import spiritsData from '../data/spirits.json'
import { answersStore } from '../domain/answersStore'
import { answersToWeights, type Answers } from '../domain/answersToWeights'
import { findAspectNudge } from '../domain/aspectNudge'
import { complexityStore } from '../domain/complexityStore'
import { expand, type Configuration } from '../domain/configurations'
import { gameLog } from '../domain/gameLog'
import { isRelevantToPlayerCount } from '../domain/noteRelevance'
import { QUESTIONS } from '../domain/questionnaire'
import { drawRandom } from '../domain/randomChoose'
import { dedupeBySpirit, recommend, type Weights } from '../domain/recommend'
import { analyzeTeam, tuneTowardGaps } from '../domain/teamCoverage'
import { tierStore } from '../domain/tierStore'
import { COMPLEXITIES } from '../domain/types'
import type { Complexity, OCFDU, Spirit, Tier } from '../domain/types'
import { selectWildcard } from '../domain/wildcard'
import { whyYou } from '../domain/whyYou'
import { OcfduRadar } from './OcfduRadar'
import { SpiritArt } from './SpiritArt'

const spirits = spiritsData as Spirit[]
const configurations = expand(spirits)
const CONFIGS_BY_SPIRIT = configurations.reduce<Record<string, Configuration[]>>((acc, config) => {
  ;(acc[config.spirit.id] ??= []).push(config)
  return acc
}, {})
const AXES: (keyof OCFDU)[] = ['offense', 'control', 'fear', 'defense', 'utility']
/** Deliberately narrow: three picks plus a wildcard, not a menu to agonise over. */
const SHORTLIST_SIZE = 3

type Phase = 'wizard' | 'board' | 'random' | 'resume'

interface RecommenderState {
  phase: Phase
  setPhase: (p: Phase) => void
  step: number
  setStep: (fn: (s: number) => number) => void
  answers: Answers
  answer: (questionId: string, value: string) => void
  playerCount: number
  setPlayerCount: (n: number) => void
  restart: () => void
  teamIds: string[]
  setTeamIds: (fn: (ids: string[]) => string[]) => void
  tuned: boolean
  setTuned: (b: boolean) => void
  wildcardOffset: number
  rerollWildcard: () => void
}

const Ctx = createContext<RecommenderState | null>(null)

function useRecommender(): RecommenderState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('Recommender components must be inside <RecommenderProvider>')
  return ctx
}

export function RecommenderProvider({ children }: { children: ReactNode }) {
  const restored = useMemo(() => answersStore.load(), [])
  const hasRestored = !!restored && Object.keys(restored).length > 0

  const [phase, setPhase] = useState<Phase>(hasRestored ? 'resume' : 'wizard')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(restored ?? {})
  const [playerCount, setPlayerCount] = useState(2)
  const [teamIds, setTeamIds] = useState<string[]>([])
  const [tuned, setTuned] = useState(false)
  const [wildcardOffset, setWildcardOffset] = useState(0)

  useEffect(() => {
    answersStore.save(answers)
  }, [answers])

  const value: RecommenderState = {
    phase,
    setPhase,
    step,
    setStep,
    answers,
    answer: (questionId, val) => setAnswers((prev) => ({ ...prev, [questionId]: val })),
    playerCount,
    setPlayerCount,
    restart: () => {
      answersStore.clear()
      setAnswers({})
      setStep(0)
      setTeamIds([])
      setTuned(false)
      setPhase('wizard')
    },
    teamIds,
    setTeamIds,
    tuned,
    setTuned,
    wildcardOffset,
    rerollWildcard: () => setWildcardOffset((n) => n + 1),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/** Everything the ranking depends on, derived once and shared by both panes. */
function useRanking() {
  const { answers, teamIds, tuned, wildcardOffset } = useRecommender()

  const prefs = useMemo(() => answersToWeights(answers), [answers])
  const roleGaps = useMemo(
    () => analyzeTeam(spirits.filter((s) => teamIds.includes(s.id))).roleGaps,
    [teamIds],
  )
  const weights = useMemo(
    () => (tuned ? tuneTowardGaps(prefs.weights, roleGaps) : prefs.weights),
    [prefs.weights, roleGaps, tuned],
  )
  // Reads complexityStore, tierStore and gameLog - all mutable - but depends only on
  // [prefs, weights]. Correct today only because App.tsx unmounts RecommenderMain (and this
  // hook with it) on every tab switch, so a stale read here never survives to be seen; it is
  // not safe to call this hook from a component that stays mounted while those stores change.
  const ranked = useMemo(() => {
    const configsForRanking = expand(spirits, complexityStore.getAll())
    const timesPlayed = Object.fromEntries(
      configsForRanking.map((c) => [c.configId, gameLog.timesPlayed(c.configId)]),
    )
    return dedupeBySpirit(
      recommend(configsForRanking, weights, {
        tempo: prefs.tempo,
        boardControl: prefs.boardControl,
        complexityImportance: prefs.complexityImportance,
        complexityCeiling: prefs.complexityCeiling,
        tierPrior: tierStore.getAll(),
        tierKnob: prefs.tierKnob,
        timesPlayed,
      }),
    )
  }, [prefs, weights])
  const wildcard = useMemo(
    () => selectWildcard(ranked, weights, prefs.complexityCeiling, wildcardOffset),
    [ranked, weights, prefs.complexityCeiling, wildcardOffset],
  )

  return { prefs, weights, roleGaps, ranked, wildcard }
}

/* ------------------------------ sidebar ------------------------------ */

/** "beatOpponents" -> "beat opponents". The full prompt stays as the control's tooltip. */
function shortLabel(id: string): string {
  return id.replace(/([A-Z])/g, ' $1').toLowerCase()
}

/** Live controls. Every change re-ranks the main pane immediately — no submit. */
export function RecommenderSide() {
  const { phase, answers, answer, playerCount, setPlayerCount, restart } = useRecommender()
  if (phase !== 'board') return null

  return (
    <div className="deck-knobs">
      <div className="deck-knobs-title">Your answers</div>

      <label className="deck-field">
        <span>players</span>
        <input
          type="number"
          min={1}
          max={6}
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
        />
      </label>

      {QUESTIONS.map((question) => (
        <label className="deck-field" key={question.id} title={question.prompt}>
          <span>{shortLabel(question.id)}</span>
          <select value={answers[question.id] ?? ''} onChange={(e) => answer(question.id, e.target.value)}>
            <option value="" disabled>
              —
            </option>
            {question.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      <button type="button" className="deck-ghost deck-ghost-accent" onClick={restart}>
        Start over
      </button>
    </div>
  )
}

/* ------------------------------ main pane ------------------------------ */

export function RecommenderMain() {
  const { phase } = useRecommender()
  if (phase === 'random') return <RandomChooser />
  if (phase === 'wizard') return <Wizard />
  if (phase === 'resume') return <ResumePrompt />
  return <ResultsBoard />
}

/** Shown once on load when answers were restored from a previous visit, instead of silently
 * jumping to results - the player explicitly chooses to continue or retake the questionnaire. */
function ResumePrompt() {
  const { setPhase, restart } = useRecommender()

  return (
    <section className="deck-wizard">
      <h2>Welcome back</h2>
      <p>You've got saved answers from last time.</p>
      <div className="deck-wizard-actions">
        <button type="button" onClick={() => setPhase('board')}>
          Continue with my saved answers
        </button>
        <button type="button" className="deck-ghost" onClick={restart}>
          Retake the questionnaire
        </button>
      </div>
    </section>
  )
}

function HeatStrip({ ratings, weights }: { ratings: OCFDU; weights: Weights }) {
  return (
    <div className="deck-heat" aria-hidden="true">
      {AXES.map((axis) => (
        <span key={axis} data-hot={(weights[axis] ?? 0) > 0} title={axis}>
          {ratings[axis]}
        </span>
      ))}
    </div>
  )
}

function ResultRow({
  config,
  score,
  rank,
  weights,
  tiers,
}: {
  config: Configuration
  score: number
  rank: number
  weights: Weights
  tiers: Record<string, Tier>
}) {
  const [open, setOpen] = useState(false)
  const { playerCount } = useRecommender()
  const { spirit, aspect } = config
  const nudge = findAspectNudge(spirit, weights)
  const siblings = CONFIGS_BY_SPIRIT[spirit.id].filter((c) => c.configId !== config.configId)
  const noteIsRelevant = spirit.notes ? isRelevantToPlayerCount(spirit.notes, playerCount) : false

  return (
    <li className="deck-row">
      <button type="button" className="deck-row-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="deck-rank">{rank}</span>
        <SpiritArt spirit={spirit} className="deck-thumb" />
        <span className="deck-row-text">
          <span className="deck-name">
            {spirit.name}
            {aspect ? <> — play the <strong>{aspect.name}</strong> aspect</> : null}
          </span>
          <span className="deck-why">{whyYou(spirit, weights)}</span>
        </span>
        <HeatStrip ratings={spirit.ratings} weights={weights} />
        <span className="deck-score">{score.toFixed(2)}</span>
      </button>

      {open && (
        <div className="deck-row-body">
          <div className="deck-row-detail">
            <p className="meta">
              {spirit.expansion} · {config.effectiveComplexity} · {spirit.elements.join(', ')}
            </p>
            <p>{spirit.summary}</p>
            {spirit.notes && (
              <p className={noteIsRelevant ? 'notes notes-relevant' : 'notes'}>
                {noteIsRelevant ? <strong>At this table size: </strong> : null}
                {spirit.notes}
              </p>
            )}
            {nudge && <p className="aspect-nudge">{nudge.message}</p>}
            {spirit.aspects.length > 0 && (
              <ul className="aspects">
                {spirit.aspects.map((aspect) => (
                  <li key={aspect.name}>
                    <strong>{aspect.name}:</strong>{' '}
                    {aspect.delta ?? <em className="meta">effect not transcribed yet</em>}
                  </li>
                ))}
              </ul>
            )}
            {siblings.length > 0 && (
              <>
                <p className="meta">Other configurations of {spirit.name}:</p>
                <ul className="aspects">
                  {siblings.map((sibling) => (
                    <li key={sibling.configId}>
                      {sibling.aspect ? sibling.aspect.name : 'Base'} — tier {tiers[sibling.configId] ?? '?'} ·{' '}
                      {sibling.effectiveComplexity}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <OcfduRadar ratings={spirit.ratings} />
        </div>
      )}
    </li>
  )
}

function ResultsBoard() {
  const { setPhase, rerollWildcard } = useRecommender()
  const { weights, ranked, wildcard } = useRanking()
  const shortlist = ranked.slice(0, SHORTLIST_SIZE)
  const tiers = tierStore.getAll()

  return (
    <>
      <div className="deck-head">
        <h2>Your top {SHORTLIST_SIZE}</h2>
        <button type="button" className="deck-ghost" onClick={() => setPhase('random')}>
          Pick at random instead
        </button>
      </div>

      <ol className="deck-rows">
        {shortlist.map(({ config, score }, i) => (
          <ResultRow key={config.configId} config={config} score={score} rank={i + 1} weights={weights} tiers={tiers} />
        ))}
      </ol>
      <p className="deck-hint">Change an answer in the sidebar — the ranking recomputes immediately.</p>

      {wildcard && (
        <div className="deck-wild">
          <div className="deck-wild-tag">Wildcard</div>
          <SpiritArt spirit={wildcard.spirit} className="deck-thumb" />
          <div>
            <div className="deck-name">
              {wildcard.spirit.name}
              {wildcard.aspect ? <> — play the <strong>{wildcard.aspect.name}</strong> aspect</> : null}
            </div>
            <div className="meta">{wildcard.effectiveComplexity}</div>
            <div className="deck-why">{wildcard.spirit.summary}</div>
          </div>
          <button type="button" className="deck-ghost" onClick={rerollWildcard}>
            Reroll
          </button>
        </div>
      )}

      <TeamPanel />
    </>
  )
}

function TeamPanel() {
  const { teamIds, setTeamIds, setTuned } = useRecommender()
  const team = spirits.filter((s) => teamIds.includes(s.id))
  const { elementCoverage, roleGaps } = analyzeTeam(team)

  return (
    <section className="deck-team">
      <h3>Team coverage</h3>
      <select
        value=""
        onChange={(e) => {
          const id = e.target.value
          if (id) setTeamIds((ids) => [...ids, id])
        }}
      >
        <option value="">Add a teammate&rsquo;s spirit…</option>
        {spirits
          .filter((s) => !teamIds.includes(s.id))
          .map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
      </select>

      {team.length > 0 && (
        <>
          <ul className="deck-team-list">
            {team.map((s) => (
              <li key={s.id}>
                {s.name}
                <button
                  type="button"
                  onClick={() => setTeamIds((ids) => ids.filter((existing) => existing !== s.id))}
                  aria-label={`Remove ${s.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <p className="meta">Elements: {elementCoverage.join(', ') || 'none'}</p>
          <p className="meta">
            Role gaps: {roleGaps.length > 0 ? roleGaps.join(', ') : 'none — the team is well-rounded'}
          </p>
          {roleGaps.length > 0 && (
            <button type="button" onClick={() => setTuned(true)}>
              Tune toward the gaps
            </button>
          )}
        </>
      )}
    </section>
  )
}

function Wizard() {
  const { step, setStep, answers, answer, playerCount, setPlayerCount, setPhase } = useRecommender()

  if (step === 0) {
    return (
      <section className="deck-wizard">
        <h2>How many players at the table?</h2>
        <input
          type="number"
          min={1}
          max={6}
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
        />
        <div className="deck-wizard-actions">
          <button type="button" onClick={() => setStep((s) => s + 1)}>
            Next
          </button>
          <button type="button" className="deck-ghost" onClick={() => setPhase('random')}>
            Just pick one at random
          </button>
        </div>
      </section>
    )
  }

  const question = QUESTIONS[step - 1]
  const selected = answers[question.id]
  const last = step === QUESTIONS.length

  return (
    <section className="deck-wizard">
      <p className="meta">
        Question {step} of {QUESTIONS.length}
      </p>
      <h2>{question.prompt}</h2>
      <ul className="deck-choices">
        {question.options.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              aria-pressed={selected === option.value}
              onClick={() => answer(question.id, option.value)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="deck-wizard-actions">
        <button type="button" className="deck-ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>
          Back
        </button>
        <button type="button" disabled={!selected} onClick={() => (last ? setPhase('board') : setStep((s) => s + 1))}>
          {last ? 'See results' : 'Next'}
        </button>
      </div>
    </section>
  )
}

function RandomChooser() {
  const { setPhase } = useRecommender()
  const [complexityCeiling, setComplexityCeiling] = useState<Complexity | ''>('')
  const [drawKey, setDrawKey] = useState(0)
  // drawKey is a deliberate re-run trigger for the reroll button, not a real dependency.
  const drawn = useMemo(
    () => drawRandom(spirits, { complexityCeiling: complexityCeiling || undefined }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [complexityCeiling, drawKey],
  )

  return (
    <section className="deck-wizard">
      <h2>Random chooser</h2>
      <label className="deck-field">
        <span>max complexity</span>
        <select value={complexityCeiling} onChange={(e) => setComplexityCeiling(e.target.value as Complexity | '')}>
          <option value="">No limit</option>
          {COMPLEXITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {drawn ? (
        <div className="deck-drawn">
          <SpiritArt spirit={drawn} />
          <h3>{drawn.name}</h3>
          <p>{drawn.summary}</p>
        </div>
      ) : (
        <p>No spirits match that constraint.</p>
      )}

      <div className="deck-wizard-actions">
        <button type="button" onClick={() => setDrawKey((k) => k + 1)}>
          Draw again
        </button>
        <button type="button" className="deck-ghost" onClick={() => setPhase('board')}>
          Back to recommendations
        </button>
      </div>
    </section>
  )
}
