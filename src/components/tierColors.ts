/** Sampled from the owner's TierMaker board so the in-app board reads the same. Indexed by a
 * label's *position* in a list's own `tierLabels`, not by the letter itself - no component
 * decides whether one list's `S` means the same as another's `X`. */
const PALETTE = ['#c078c0', '#78c0ff', '#78ffff', '#78ff78', '#ffff78', '#ffc078', '#ff7878']

export function tierColor(position: number): string {
  return PALETTE[position] ?? PALETTE[PALETTE.length - 1]
}
