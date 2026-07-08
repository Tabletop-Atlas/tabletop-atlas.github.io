import { useMemo, useState } from 'react'
import spiritsData from '../data/spirits.json'
import tiersData from '../data/tiers.json'
import { answersToWeights, type Answers } from '../domain/answersToWeights'
import { QUESTIONS } from '../domain/questionnaire'
import { recommend } from '../domain/recommend'
import type { Spirit, Tier } from '../domain/types'

const spirits = spiritsData as Spirit[]
const tierPrior = tiersData.tiers as Record<string, Tier>

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
  const prefs = useMemo(() => answersToWeights(answers), [answers])
  const ranked = useMemo(
    () =>
      recommend(spirits, prefs.weights, {
        tempo: prefs.tempo,
        boardControl: prefs.boardControl,
        complexityImportance: prefs.complexityImportance,
        complexityCeiling: prefs.complexityCeiling,
        tierPrior,
        tierKnob: prefs.tierKnob,
      }),
    [prefs],
  )
  const shortlist = ranked.slice(0, 5)

  return (
    <section>
      <h2>Your shortlist</h2>
      <ol>
        {shortlist.map(({ spirit, score }, i) => (
          <li key={spirit.id} className={i < 3 ? 'emphasized' : undefined}>
            {spirit.name} — score {score.toFixed(1)}
            {spirit.notes && <p className="notes">{spirit.notes}</p>}
          </li>
        ))}
      </ol>

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
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [playerCount, setPlayerCount] = useState(2)
  const [phase, setPhase] = useState<'wizard' | 'board'>('wizard')

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
