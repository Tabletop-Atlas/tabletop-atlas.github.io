import { useRef, useState } from 'react'
import spiritsData from '../data/spirits.json'
import { answersStore } from '../domain/answersStore'
import { parse, serialise } from '../domain/backup'
import type { KnownIds } from '../domain/backup'
import { collectionStore } from '../domain/collectionStore'
import { complexityStore } from '../domain/complexityStore'
import { expand } from '../domain/configurations'
import { gameLog } from '../domain/gameLog'
import { QUESTIONS } from '../domain/questionnaire'
import { tierStore } from '../domain/tierStore'
import { COMPLEXITIES, EXPANSIONS, TIER_LIST_SUBJECTS } from '../domain/types'
import type { Complexity, Spirit } from '../domain/types'
import { SpiritArt } from './SpiritArt'
import { SUBJECT_LABEL } from './TierListControls'

const spirits = spiritsData as Spirit[]
const configurations = expand(spirits)

// A function, not a module-level constant: list ids grow at runtime (#09's created lists), so
// this must re-read tierStore on every import rather than freezing the set at module load.
function knownIds(): KnownIds {
  return {
    tierIds: new Set(configurations.map((c) => c.configId)),
    listIds: new Set(tierStore.getLists().map((l) => l.id)),
    complexityIds: new Set(spirits.map((s) => s.id)),
    questionIds: new Set(QUESTIONS.map((q) => q.id)),
    expansions: new Set(EXPANSIONS),
  }
}

function ownersListId(): string {
  return tierStore.getLists().find((l) => l.origin === 'personal')?.id ?? ''
}

function downloadBackup(json: string) {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `spirit-island-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/**
 * The Settings tab (#14): exactly the three durable-state sections that used to ride inside
 * "Customise tiers" — Backup, My collection, Complexity overrides — moved with behaviour
 * identical. Open-door policy (#02 decision 2): any future durable, app-wide preference
 * defaults here unless its ticket argues for surface-local. Session-only controls (each
 * surface's hide-unowned checkbox) stay beside the results they filter.
 */
export function Settings() {
  const [, setVersion] = useState(0)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const bump = () => setVersion((v) => v + 1)
  const complexityOverrides = complexityStore.getAll()
  const complexityCustomised = complexityStore.isCustomised()
  const complexityDiscarded = complexityStore.wasDiscarded()
  const collectionCustomised = collectionStore.isCustomised()
  const allLists = tierStore.getLists()

  const handleSetComplexity = (spiritId: string, complexity: Complexity) => {
    complexityStore.setComplexity(spiritId, complexity)
    bump()
  }

  const handleResetComplexity = (spiritId: string) => {
    complexityStore.reset(spiritId)
    bump()
  }

  const handleSetOwned = (expansion: (typeof EXPANSIONS)[number], owned: boolean) => {
    collectionStore.setOwned(expansion, owned)
    bump()
  }

  const handleExport = () => {
    const tiers: Record<string, Record<string, string>> = {}
    for (const list of tierStore.getPersonalLists()) {
      const overrides = tierStore.getOverridesForList(list.id)
      if (Object.keys(overrides).length > 0) tiers[list.id] = overrides
    }
    const json = serialise({
      tiers,
      complexityOverrides: complexityStore.getOverrides(),
      answers: answersStore.load() ?? {},
      log: gameLog.list(),
      collection: collectionStore.getExcluded(),
    })
    downloadBackup(json)
  }

  const handleImportFile = async (file: File) => {
    setImportMessage(null)
    let result
    try {
      result = parse(await file.text(), knownIds(), gameLog.list(), ownersListId())
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : 'Could not read that backup file.')
      return
    }

    const hasExistingData =
      tierStore.hasAnyPersonalEdits() ||
      complexityStore.isCustomised() ||
      collectionStore.isCustomised() ||
      Object.keys(answersStore.load() ?? {}).length > 0 ||
      gameLog.list().length > 0
    if (hasExistingData) {
      const ok = window.confirm(
        'Importing will replace your tiers, complexity overrides, collection and answers with ' +
          'the ones in this file. Your game log is merged instead - entries are appended and ' +
          'de-duplicated by id, so nothing already logged is lost.\n\nExport a backup first if ' +
          'you want to keep what you have now?\n\nChoose Cancel to go export, or OK to import anyway.',
      )
      if (!ok) return
    }

    for (const list of tierStore.getPersonalLists()) {
      tierStore.resetList(list.id)
    }
    tierStore.importOverrides(result.state.tiers)
    complexityStore.resetAll()
    for (const [spiritId, complexity] of Object.entries(result.state.complexityOverrides)) {
      complexityStore.setComplexity(spiritId, complexity as Complexity)
    }
    answersStore.save(result.state.answers)
    gameLog.replaceAll(result.state.log)
    collectionStore.resetAll()
    for (const expansion of result.state.collection) {
      collectionStore.setOwned(expansion, false)
    }
    bump()
    setImportMessage(
      result.unresolved.length > 0
        ? `Imported. Could not resolve ${result.unresolved.length} id(s): ${result.unresolved.join(', ')}`
        : 'Imported successfully.',
    )
  }

  return (
    <section>
      <h2>Settings</h2>
      {complexityDiscarded && (
        <p className="notice">
          Your saved complexity overrides were discarded because the shipped complexity values have
          changed since you made them. Export a backup next time to avoid losing edits like this.{' '}
          <button
            type="button"
            onClick={() => {
              complexityStore.dismissDiscardNotice()
              bump()
            }}
          >
            Dismiss
          </button>
        </p>
      )}

      <h3>Backup</h3>
      <p className="meta">
        Nothing here survives a cleared browser cache unless you export it. Export carries your
        edits to every personal list, not just the one shown here. Import replaces those edits,
        your complexity overrides and your answers; your game log is appended and de-duplicated by
        id instead, so merging two devices' histories never loses a played game.
      </p>
      <p>
        <button type="button" onClick={handleExport}>
          Export backup
        </button>{' '}
        <button type="button" onClick={() => fileInput.current?.click()}>
          Import backup
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          className="visually-hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleImportFile(file)
            e.target.value = ''
          }}
        />
      </p>
      {importMessage ? <p className="meta">{importMessage}</p> : null}

      {/* phase-4 #18: the durable boot pick, on the #12 seams. The active list stays session
       * state — changing the default here changes which list boots next load, not this one.
       * Seed note: the owner's named default video matches no shipped citation, so the seed
       * stays the owner's board pending the owner's answer (escalated in #12/#18, ADR 0002). */}
      <h3>Default tier list</h3>
      <p className="meta">
        Which list each subject boots into. Switching a list on the Tier list tab lasts for the
        session; the pick here is what a fresh load starts from.
      </p>
      {TIER_LIST_SUBJECTS.filter((subject) => allLists.some((l) => l.subject === subject)).map((subject) => (
        <label key={subject} className="deck-field">
          <span>{SUBJECT_LABEL[subject]}</span>
          <select
            value={tierStore.getDefaultList(subject)?.id ?? ''}
            onChange={(e) => {
              tierStore.setDefaultListId(e.target.value)
              bump()
            }}
          >
            {allLists
              .filter((l) => l.subject === subject)
              .map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
          </select>
        </label>
      ))}

      <h3>My collection</h3>
      <p className="meta">
        Untick an expansion you don't own. Nothing disappears by default — spirits and aspects
        outside your collection are dimmed wherever a surface respects it (starting with the tier
        board), never hidden. The Cards tab never respects this: browsing the full card pool is
        how you decide whether to buy an expansion.{' '}
        {collectionCustomised ? <span>You've excluded some expansions.</span> : null}
      </p>
      <ul className="collection-checklist">
        {EXPANSIONS.map((expansion) => (
          <li key={expansion}>
            <label>
              <input
                type="checkbox"
                checked={collectionStore.owns(expansion)}
                onChange={(e) => handleSetOwned(expansion, e.target.checked)}
              />
              {expansion}
            </label>
          </li>
        ))}
      </ul>

      <h3>Complexity overrides</h3>
      <p className="meta">
        Disagree with the printed Complexity? Override it here. This only changes your own{' '}
        <em>enjoyment</em> preference score — a newcomer's safeguard always reads the printed
        value, never your override. Aspects aren't individually overridable; their printed arrow
        still applies on top. {complexityCustomised ? <span>You have overrides set.</span> : null}
      </p>
      <ul className="spirit-grid">
        {spirits.map((spirit) => (
          <li key={spirit.id} className="spirit-tile">
            <SpiritArt spirit={spirit} />
            <h4>{spirit.name}</h4>
            <p className="meta">printed: {spirit.complexity}</p>
            <label>
              <span className="visually-hidden">Complexity override for {spirit.name}</span>
              <select
                value={complexityOverrides[spirit.id]}
                onChange={(e) => handleSetComplexity(spirit.id, e.target.value as Complexity)}
              >
                {COMPLEXITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            {complexityOverrides[spirit.id] !== spirit.complexity && (
              <button type="button" onClick={() => handleResetComplexity(spirit.id)}>
                Reset
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
