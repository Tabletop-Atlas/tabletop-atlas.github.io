import { useEffect, useMemo, useState } from 'react'
import spiritsData from '../data/spirits.json'
import { answersStore } from '../domain/answersStore'
import { answersToWeights, type Answers } from '../domain/answersToWeights'
import { findAspectNudge } from '../domain/aspectNudge'
import { QUESTIONS } from '../domain/questionnaire'
import { recommend, type Weights } from '../domain/recommend'
import { analyzeTeam, tuneTowardGaps } from '../domain/teamCoverage'
import { tierStore } from '../domain/tierStore'
import type { Spirit } from '../domain/types'
import { selectWildcard } from '../domain/wildcard'
import { whyYou } from '../domain/whyYou'
import { OcfduRadar } from './OcfduRadar'

const spirits = spiritsData as Spirit[]

function RecommendedCard({
  spirit,
  score,
  showWhyYou,
  weights,
}: {
  spirit: Spirit
  score: number
  showWhyYou: boolean
  weights: Weights
}) {
  const [showAspects, setShowAspects] = useState(false)
  const nudge = findAspectNudge(spirit, weights)

  return (
    <li className={showWhyYou ? 'emphasized' : undefined}>
      <OcfduRadar ratings={spirit.ratings} />
      <div>
        <p>
          {spirit.name} — score {score.toFixed(1)}
        </p>
        {showWhyYou && <p className="why-you">{whyYou(spirit, weights)}</p>}
        {spirit.notes && <p className="notes">{spirit.notes}</p>}
        {nudge && <p className="aspect-nudge">{nudge.message}</p>}
        {spirit.aspects.length > 0 && (
          <>
            <button type="button" onClick={() => setShowAspects((s) => !s)}>
              {showAspects ? 'Hide' : 'Show'} aspects ({spirit.aspects.length})
            </button>
            {showAspects && (
              <ul className="aspects">
                {spirit.aspects.map((aspect) => (
                  <li key={aspect.name}>
                    <strong>{aspect.name}:</strong> {aspect.delta}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </li>
  )
}

function TeamPanel({
  teamIds,
  onAdd,
  onRemove,
  onTune,
}: {
  teamIds: string[]
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  onTune: () => void
}) {
  const team = spirits.filter((s) => teamIds.includes(s.id))
  const { elementCoverage, roleGaps } = analyzeTeam(team)

  return (
    <div className="team-panel">
      <h3>Team</h3>
      <select value="" onChange={(e) => e.target.value && onAdd(e.target.value)}>
        <option value="">Add a teammate's spirit...</option>
        {spirits
          .filter((s) => !teamIds.includes(s.id))
          .map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
      </select>
      <ul>
        {team.map((s) => (
          <li key={s.id}>
            {s.name}{' '}
            <button type="button" onClick={() => onRemove(s.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      {team.length > 0 && (
        <div className="coverage">
          <p>Element coverage: {elementCoverage.length > 0 ? elementCoverage.join(', ') : 'none'}</p>
          <p>
            Role gaps:{' '}
            {roleGaps.length > 0 ? roleGaps.join(', ') : 'none — the team is well-rounded'}
          </p>
          {roleGaps.length > 0 && (
            <button type="button" onClick={onTune}>
              Tune toward the gaps
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Wizard({
  step,
  answers,
  playerCount,
  onAnswer,
  onPlayerCount,
  onNext,
  onBack,
}: {
  step: number
  answers: Answers
  playerCount: number
  onAnswer: (questionId: string, value: string) => void
  onPlayerCount: (n: number) => void
  onNext: () => void
  onBack: () => void
}) {
  if (step === 0) {
    return (
      <section>
        <h2>How many players at the table?</h2>
        <input
          type="number"
          min={1}
          max={6}
          value={playerCount}
          onChange={(e) => onPlayerCount(Number(e.target.value))}
        />
        <div>
          <button type="button" onClick={onNext}>
            Next
          </button>
        </div>
      </section>
    )
  }

  const question = QUESTIONS[step - 1]
  const selected = answers[question.id]

  return (
    <section>
      <p>
        Question {step} of {QUESTIONS.length}
      </p>
      <h2>{question.prompt}</h2>
      <ul>
        {question.options.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              aria-pressed={selected === option.value}
              onClick={() => onAnswer(question.id, option.value)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
      <div>
        {step > 1 && (
          <button type="button" onClick={onBack}>
            Back
          </button>
        )}
        <button type="button" disabled={!selected} onClick={onNext}>
          {step === QUESTIONS.length ? 'See results' : 'Next'}
        </button>
      </div>
    </section>
  )
}

function ResultsBoard({
  answers,
  onAnswer,
  onRestart,
}: {
  answers: Answers
  onAnswer: (questionId: string, value: string) => void
  onRestart: () => void
}) {
  const [wildcardOffset, setWildcardOffset] = useState(0)
  const [teamIds, setTeamIds] = useState<string[]>([])
  const [tuned, setTuned] = useState(false)

  const prefs = useMemo(() => answersToWeights(answers), [answers])
  const roleGaps = useMemo(
    () => analyzeTeam(spirits.filter((s) => teamIds.includes(s.id))).roleGaps,
    [teamIds],
  )
  const effectiveWeights = useMemo(
    () => (tuned ? tuneTowardGaps(prefs.weights, roleGaps) : prefs.weights),
    [prefs.weights, roleGaps, tuned],
  )
  const ranked = useMemo(
    () =>
      recommend(spirits, effectiveWeights, {
        tempo: prefs.tempo,
        boardControl: prefs.boardControl,
        complexityImportance: prefs.complexityImportance,
        complexityCeiling: prefs.complexityCeiling,
        tierPrior: tierStore.getAll(),
        tierKnob: prefs.tierKnob,
      }),
    [prefs, effectiveWeights],
  )
  const shortlist = ranked.slice(0, 5)
  const wildcard = useMemo(
    () => selectWildcard(ranked, effectiveWeights, prefs.complexityCeiling, wildcardOffset),
    [ranked, effectiveWeights, prefs, wildcardOffset],
  )

  return (
    <section>
      <h2>Your shortlist</h2>
      <ol>
        {shortlist.map(({ spirit, score }, i) => (
          <RecommendedCard
            key={spirit.id}
            spirit={spirit}
            score={score}
            showWhyYou={i < 3}
            weights={effectiveWeights}
          />
        ))}
      </ol>

      <TeamPanel
        teamIds={teamIds}
        onAdd={(id) => setTeamIds((ids) => [...ids, id])}
        onRemove={(id) => setTeamIds((ids) => ids.filter((existing) => existing !== id))}
        onTune={() => setTuned(true)}
      />

      {wildcard && (
        <div className="wildcard">
          <h3>Wildcard</h3>
          <OcfduRadar ratings={wildcard.ratings} />
          <p>{wildcard.name}</p>
          <p>{wildcard.summary}</p>
          <button type="button" onClick={() => setWildcardOffset((n) => n + 1)}>
            Reroll wildcard
          </button>
        </div>
      )}

      <h3>Tweak your answers</h3>
      {QUESTIONS.map((question) => (
        <div key={question.id}>
          <label htmlFor={question.id}>{question.prompt}</label>
          <select
            id={question.id}
            value={answers[question.id] ?? ''}
            onChange={(e) => onAnswer(question.id, e.target.value)}
          >
            <option value="" disabled>
              Choose...
            </option>
            {question.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button type="button" onClick={onRestart}>
        Start over
      </button>
    </section>
  )
}

export function Recommender() {
  const restored = useMemo(() => answersStore.load(), [])
  const hasRestoredAnswers = !!restored && Object.keys(restored).length > 0
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(restored ?? {})
  const [playerCount, setPlayerCount] = useState(2)
  const [phase, setPhase] = useState<'wizard' | 'board'>(hasRestoredAnswers ? 'board' : 'wizard')

  useEffect(() => {
    answersStore.save(answers)
  }, [answers])

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (step >= QUESTIONS.length) {
      setPhase('board')
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleRestart = () => {
    answersStore.clear()
    setStep(0)
    setAnswers({})
    setPhase('wizard')
  }

  if (phase === 'wizard') {
    return (
      <Wizard
        step={step}
        answers={answers}
        playerCount={playerCount}
        onAnswer={handleAnswer}
        onPlayerCount={setPlayerCount}
        onNext={handleNext}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
      />
    )
  }

  return <ResultsBoard answers={answers} onAnswer={handleAnswer} onRestart={handleRestart} />
}
