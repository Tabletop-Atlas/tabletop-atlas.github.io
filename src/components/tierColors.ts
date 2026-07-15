import { tierStore } from '../domain/tierStore'

/** Sampled from the owner's TierMaker board so the in-app board reads the same. Indexed by a
 * label's *position* in a list's own `tierLabels`, not by the letter itself - no component
 * decides whether one list's `S` means the same as another's `X`. */
const PALETTE = ['#c078c0', '#78c0ff', '#78ffff', '#78ff78', '#ffff78', '#ffc078', '#ff7878']

export function tierColor(position: number): string {
  return PALETTE[position] ?? PALETTE[PALETTE.length - 1]
}

/** #06: a configuration's rank in the *active* configurations tier list, shared by the modal's
 * tier chip and the Browse tile badge so the two can never disagree (the same rule `groupByTier`
 * already applies on the board). Honest absence (ADR 0001): unrated, or a label outside the
 * active list's own vocabulary (a stale override), both come back `undefined` - never a
 * defaulted position. */
export function activeConfigTier(configId: string): { label: string; position: number } | undefined {
  const label = tierStore.getTier(configId)
  if (label === undefined) return undefined
  const position = tierStore.getActiveList().tierLabels.indexOf(label)
  return position === -1 ? undefined : { label, position }
}
